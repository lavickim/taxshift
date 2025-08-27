import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
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
  
  final String baseUrl = 'http://10.0.2.2:8090';
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
        headers: {'Content-Type': 'application/json'},
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
        headers: {'Content-Type': 'application/json'},
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
        Text(
          '메모',
          style: AppTypography.caption.copyWith(
            color: AppColors.textSecondary,
          ),
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
      ],
    );
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
        headers: {'Content-Type': 'application/json'},
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