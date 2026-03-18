import '../config/api_config.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class AddTransactionScreen extends StatefulWidget {
  final bool isIncome;
  final DateTime? initialDate;
  final int? editTransactionId;

  const AddTransactionScreen({
    Key? key,
    required this.isIncome,
    this.initialDate,
    this.editTransactionId,
  }) : super(key: key);

  @override
  State<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends State<AddTransactionScreen> {
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _noteController = TextEditingController();
  
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.now();
  int? _selectedCategoryId;
  int? _selectedAssetId;
  String _transactionType = 'EXPENSE';
  
  List<Category> _categories = [];
  List<Asset> _assets = [];
  bool _isLoading = false;
  
  final ImagePicker _picker = ImagePicker();
  List<XFile> _attachedImages = [];
  
  // Recurring transaction settings
  bool _isRecurring = false;
  String _recurringType = 'NONE'; // NONE, DAILY, WEEKLY, MONTHLY, YEARLY
  int _recurringInterval = 1; // Every N days/weeks/months
  DateTime? _recurringEndDate;
  List<int> _selectedWeekdays = []; // For weekly recurrence (1=Mon, 7=Sun)
  int? _selectedDayOfMonth; // For monthly recurrence
  
  String get baseUrl => ApiConfig.baseUrl;
  final int userId = 1;

  @override
  void initState() {
    super.initState();
    _transactionType = widget.isIncome ? 'INCOME' : 'EXPENSE';
    if (widget.initialDate != null) {
      _selectedDate = widget.initialDate!;
    }
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await Future.wait([
        _loadCategories(),
        _loadAssets(),
      ]);
      
      if (widget.editTransactionId != null) {
        await _loadTransaction();
      }
    } catch (e) {
      print('Error loading initial data: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/categories?userId=$userId'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _categories = data
              .map((item) => Category.fromJson(item))
              .where((cat) => cat.categoryType == _transactionType)
              .toList();
          if (_categories.isNotEmpty && _selectedCategoryId == null) {
            _selectedCategoryId = _categories.first.categoryId;
          }
        });
      }
    } catch (e) {
      print('Error loading categories: $e');
    }
  }

  Future<void> _loadAssets() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/assets?userId=$userId'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _assets = data.map((item) => Asset.fromJson(item)).toList();
          if (_assets.isNotEmpty && _selectedAssetId == null) {
            final defaultAsset = _assets.firstWhere(
              (asset) => asset.isDefault,
              orElse: () => _assets.first,
            );
            _selectedAssetId = defaultAsset.assetId;
          }
        });
      }
    } catch (e) {
      print('Error loading assets: $e');
    }
  }

  Future<void> _loadTransaction() async {
    // 수정 모드일 때 거래 데이터 로드
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: widget.isIncome ? '수입 추가' : '지출 추가',
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveTransaction,
            child: Text(
              '저장',
              style: AppTypography.body1.copyWith(
                color: _isLoading ? AppColors.textTertiary : AppColors.primaryYellow,
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primaryYellow),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 금액 입력
                  _buildAmountSection(),
                  const SizedBox(height: 24),
                  
                  // 카테고리 선택
                  _buildCategorySection(),
                  const SizedBox(height: 24),
                  
                  // 자산 선택
                  _buildAssetSection(),
                  const SizedBox(height: 24),
                  
                  // 날짜 시간 선택
                  _buildDateTimeSection(),
                  const SizedBox(height: 24),
                  
                  // 설명 입력
                  _buildDescriptionSection(),
                  const SizedBox(height: 24),
                  
                  // 반복 설정
                  _buildRecurringSection(),
                  const SizedBox(height: 24),
                  
                  // 메모 입력
                  _buildNoteSection(),
                  const SizedBox(height: 32),
                  
                  // 숫자 패드
                  _buildNumberPad(),
                ],
              ),
            ),
    );
  }

  Widget _buildAmountSection() {
    final formatter = NumberFormat('#,###');
    final amount = int.tryParse(_amountController.text.replaceAll(',', '')) ?? 0;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            '금액',
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.isIncome ? '+' : '-',
                style: AppTypography.h2.copyWith(
                  color: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                amount == 0 ? '0' : formatter.format(amount),
                style: AppTypography.h2.copyWith(
                  color: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
                ),
              ),
              Text(
                ' 원',
                style: AppTypography.h5.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '카테고리',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final category = _categories[index];
              final isSelected = category.categoryId == _selectedCategoryId;
              
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCategoryId = category.categoryId;
                  });
                },
                child: Container(
                  width: 72,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                            .withOpacity(0.2)
                        : AppColors.cardBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                          : AppColors.divider,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _getCategoryIcon(category.categoryName),
                        color: isSelected
                            ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                            : AppColors.textSecondary,
                        size: 24,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        category.categoryName,
                        style: AppTypography.caption.copyWith(
                          color: isSelected
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAssetSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '자산',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.divider),
          ),
          child: DropdownButton<int>(
            value: _selectedAssetId,
            isExpanded: true,
            dropdownColor: AppColors.cardBackground,
            underline: const SizedBox(),
            style: AppTypography.body1,
            items: _assets.map((asset) {
              return DropdownMenuItem(
                value: asset.assetId,
                child: Text(asset.assetName),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedAssetId = value;
              });
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDateTimeSection() {
    final dateFormatter = DateFormat('yyyy년 MM월 dd일', 'ko_KR');
    final timeFormatter = DateFormat('HH:mm', 'ko_KR');
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '날짜 및 시간',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: _selectDate,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.cardBackground,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        dateFormatter.format(_selectedDate),
                        style: AppTypography.body2,
                      ),
                      const Icon(
                        Icons.calendar_today,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: _selectTime,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Row(
                  children: [
                    Text(
                      _selectedTime.format(context),
                      style: AppTypography.body2,
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.access_time,
                      color: AppColors.textSecondary,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDescriptionSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '설명',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _descriptionController,
          style: AppTypography.body1,
          decoration: InputDecoration(
            hintText: '거래 설명 입력',
            hintStyle: AppTypography.body2.copyWith(
              color: AppColors.textTertiary,
            ),
            filled: true,
            fillColor: AppColors.cardBackground,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNoteSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '메모 및 사진',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.camera_alt, color: AppColors.textSecondary, size: 20),
                  onPressed: _pickImageFromCamera,
                ),
                IconButton(
                  icon: const Icon(Icons.photo_library, color: AppColors.textSecondary, size: 20),
                  onPressed: _pickImageFromGallery,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _noteController,
          maxLines: 3,
          style: AppTypography.body2,
          decoration: InputDecoration(
            hintText: '메모 입력 (선택)',
            hintStyle: AppTypography.body2.copyWith(
              color: AppColors.textTertiary,
            ),
            filled: true,
            fillColor: AppColors.cardBackground,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.divider),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
              ),
            ),
          ),
        ),
        if (_attachedImages.isNotEmpty) ...[
          const SizedBox(height: 12),
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _attachedImages.length,
              itemBuilder: (context, index) {
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          File(_attachedImages[index].path),
                          fit: BoxFit.cover,
                          width: 80,
                          height: 80,
                        ),
                      ),
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _attachedImages.removeAt(index);
                            });
                          },
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: Colors.black54,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ],
    );
  }
  
  Future<void> _pickImageFromCamera() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1080,
        maxHeight: 1080,
        imageQuality: 85,
      );
      
      if (image != null) {
        setState(() {
          _attachedImages.add(image);
        });
      }
    } catch (e) {
      print('Error picking image from camera: $e');
    }
  }
  
  Future<void> _pickImageFromGallery() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(
        maxWidth: 1080,
        maxHeight: 1080,
        imageQuality: 85,
      );
      
      if (images.isNotEmpty) {
        setState(() {
          _attachedImages.addAll(images);
          // 최대 5장까지만 허용
          if (_attachedImages.length > 5) {
            _attachedImages = _attachedImages.take(5).toList();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('최대 5장까지 첨부 가능합니다'),
                backgroundColor: AppColors.primaryRed,
              ),
            );
          }
        });
      }
    } catch (e) {
      print('Error picking images from gallery: $e');
    }
  }
  
  Widget _buildRecurringSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '반복 설정',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            Switch(
              value: _isRecurring,
              onChanged: (value) {
                setState(() {
                  _isRecurring = value;
                  if (!value) {
                    _recurringType = 'NONE';
                    _recurringEndDate = null;
                    _selectedWeekdays.clear();
                    _selectedDayOfMonth = null;
                  }
                });
              },
              activeColor: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
            ),
          ],
        ),
        if (_isRecurring) ...[
          const SizedBox(height: 12),
          // Recurring type selector
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.divider),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '반복 주기',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    _buildRecurringTypeChip('매일', 'DAILY'),
                    _buildRecurringTypeChip('매주', 'WEEKLY'),
                    _buildRecurringTypeChip('매월', 'MONTHLY'),
                    _buildRecurringTypeChip('매년', 'YEARLY'),
                  ],
                ),
                const SizedBox(height: 12),
                // Interval selector
                Row(
                  children: [
                    Text(
                      '반복 간격:',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 60,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          InkWell(
                            onTap: () {
                              if (_recurringInterval > 1) {
                                setState(() {
                                  _recurringInterval--;
                                });
                              }
                            },
                            child: const Icon(Icons.remove, size: 16),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              '$_recurringInterval',
                              style: AppTypography.body2,
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              setState(() {
                                _recurringInterval++;
                              });
                            },
                            child: const Icon(Icons.add, size: 16),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _getIntervalUnit(),
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                // Weekly specific - weekday selector
                if (_recurringType == 'WEEKLY') ...[
                  const SizedBox(height: 12),
                  Text(
                    '반복 요일',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildWeekdayChip('월', 1),
                      _buildWeekdayChip('화', 2),
                      _buildWeekdayChip('수', 3),
                      _buildWeekdayChip('목', 4),
                      _buildWeekdayChip('금', 5),
                      _buildWeekdayChip('토', 6),
                      _buildWeekdayChip('일', 7),
                    ],
                  ),
                ],
                // Monthly specific - day of month selector
                if (_recurringType == 'MONTHLY') ...[
                  const SizedBox(height: 12),
                  Text(
                    '반복일',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  DropdownButton<int>(
                    value: _selectedDayOfMonth ?? _selectedDate.day,
                    items: List.generate(31, (index) => index + 1)
                        .map((day) => DropdownMenuItem(
                              value: day,
                              child: Text('$day일'),
                            ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedDayOfMonth = value;
                      });
                    },
                    style: AppTypography.body2,
                    dropdownColor: AppColors.cardBackground,
                  ),
                ],
                // End date selector
                const SizedBox(height: 12),
                Row(
                  children: [
                    Text(
                      '종료일:',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _recurringEndDate ?? DateTime.now().add(const Duration(days: 365)),
                          firstDate: _selectedDate,
                          lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
                          builder: (context, child) {
                            return Theme(
                              data: ThemeData.dark().copyWith(
                                colorScheme: ColorScheme.dark(
                                  primary: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
                                  surface: AppColors.cardBackground,
                                ),
                              ),
                              child: child!,
                            );
                          },
                        );
                        if (picked != null) {
                          setState(() {
                            _recurringEndDate = picked;
                          });
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _recurringEndDate != null
                              ? DateFormat('yyyy.MM.dd').format(_recurringEndDate!)
                              : '무제한',
                          style: AppTypography.caption,
                        ),
                      ),
                    ),
                    if (_recurringEndDate != null) ...[
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () {
                          setState(() {
                            _recurringEndDate = null;
                          });
                        },
                        child: const Icon(Icons.clear, size: 16, color: AppColors.textSecondary),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
  
  Widget _buildRecurringTypeChip(String label, String type) {
    final isSelected = _recurringType == type;
    return ChoiceChip(
      label: Text(label),
      labelStyle: AppTypography.caption.copyWith(
        color: isSelected ? Colors.white : AppColors.textSecondary,
      ),
      selected: isSelected,
      selectedColor: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
      backgroundColor: AppColors.surface,
      onSelected: (selected) {
        setState(() {
          _recurringType = selected ? type : 'NONE';
          // Reset specific settings when changing type
          _selectedWeekdays.clear();
          _selectedDayOfMonth = null;
        });
      },
    );
  }
  
  Widget _buildWeekdayChip(String label, int weekday) {
    final isSelected = _selectedWeekdays.contains(weekday);
    return InkWell(
      onTap: () {
        setState(() {
          if (isSelected) {
            _selectedWeekdays.remove(weekday);
          } else {
            _selectedWeekdays.add(weekday);
          }
        });
      },
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isSelected 
              ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
              : AppColors.surface,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(
            label,
            style: AppTypography.caption.copyWith(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
  
  String _getIntervalUnit() {
    switch (_recurringType) {
      case 'DAILY':
        return '일마다';
      case 'WEEKLY':
        return '주마다';
      case 'MONTHLY':
        return '개월마다';
      case 'YEARLY':
        return '년마다';
      default:
        return '';
    }
  }

  Widget _buildNumberPad() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildNumberButton('7'),
              _buildNumberButton('8'),
              _buildNumberButton('9'),
            ],
          ),
          Row(
            children: [
              _buildNumberButton('4'),
              _buildNumberButton('5'),
              _buildNumberButton('6'),
            ],
          ),
          Row(
            children: [
              _buildNumberButton('1'),
              _buildNumberButton('2'),
              _buildNumberButton('3'),
            ],
          ),
          Row(
            children: [
              _buildNumberButton('00'),
              _buildNumberButton('0'),
              _buildNumberButton('⌫', isBackspace: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNumberButton(String text, {bool isBackspace = false}) {
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (isBackspace) {
              if (_amountController.text.isNotEmpty) {
                setState(() {
                  _amountController.text = _amountController.text
                      .substring(0, _amountController.text.length - 1);
                });
              }
            } else {
              setState(() {
                _amountController.text += text;
              });
            }
          },
          child: Container(
            height: 56,
            alignment: Alignment.center,
            child: Text(
              text,
              style: AppTypography.h5.copyWith(
                color: isBackspace ? AppColors.primaryRed : AppColors.textPrimary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: ColorScheme.dark(
              primary: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
              surface: AppColors.cardBackground,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _selectTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: ColorScheme.dark(
              primary: widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
              surface: AppColors.cardBackground,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  Future<void> _saveTransaction() async {
    final amount = int.tryParse(_amountController.text.replaceAll(',', ''));
    
    if (amount == null || amount == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('금액을 입력해주세요')),
      );
      return;
    }

    if (_selectedCategoryId == null || _selectedAssetId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('카테고리와 자산을 선택해주세요')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final transactionDate = DateTime(
        _selectedDate.year,
        _selectedDate.month,
        _selectedDate.day,
        _selectedTime.hour,
        _selectedTime.minute,
      );

      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/transactions'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
        body: json.encode({
          'userId': userId,
          'categoryId': _selectedCategoryId,
          'assetId': _selectedAssetId,
          'amount': amount.toDouble(),
          'transactionType': _transactionType,
          'description': _descriptionController.text,
          'transactionDate': transactionDate.toIso8601String(),
          'note': _noteController.text.isEmpty ? null : _noteController.text,
        }),
      );

      if (response.statusCode == 201) {
        Navigator.pop(context, true);
      } else {
        throw Exception('Failed to save transaction');
      }
    } catch (e) {
      print('Error saving transaction: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('저장 중 오류가 발생했습니다')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  IconData _getCategoryIcon(String categoryName) {
    switch (categoryName) {
      case '식비':
        return Icons.restaurant;
      case '교통':
        return Icons.directions_car;
      case '문화':
        return Icons.movie;
      case '쇼핑':
        return Icons.shopping_bag;
      case '의료':
        return Icons.local_hospital;
      case '교육':
        return Icons.school;
      case '급여':
        return Icons.account_balance_wallet;
      case '용돈':
        return Icons.card_giftcard;
      default:
        return Icons.category;
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}

class Category {
  final int categoryId;
  final String categoryName;
  final String categoryType;
  final String? iconName;

  Category({
    required this.categoryId,
    required this.categoryName,
    required this.categoryType,
    this.iconName,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      categoryId: json['categoryId'],
      categoryName: json['categoryName'],
      categoryType: json['categoryType'],
      iconName: json['iconName'],
    );
  }
}

class Asset {
  final int assetId;
  final String assetName;
  final bool isDefault;

  Asset({
    required this.assetId,
    required this.assetName,
    required this.isDefault,
  });

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      assetId: json['assetId'],
      assetName: json['assetName'],
      isDefault: json['isDefault'] ?? false,
    );
  }
}