import '../config/api_config.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class AddTransferScreen extends StatefulWidget {
  final DateTime? initialDate;

  const AddTransferScreen({
    Key? key,
    this.initialDate,
  }) : super(key: key);

  @override
  State<AddTransferScreen> createState() => _AddTransferScreenState();
}

class _AddTransferScreenState extends State<AddTransferScreen> {
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _noteController = TextEditingController();
  
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.now();
  int? _selectedFromAssetId;
  int? _selectedToAssetId;
  
  List<Asset> _assets = [];
  bool _isLoading = false;
  String _currentInput = '';
  
  String get baseUrl => ApiConfig.baseUrl;
  final int userId = 1;

  @override
  void initState() {
    super.initState();
    if (widget.initialDate != null) {
      _selectedDate = widget.initialDate!;
    }
    _loadAssets();
  }

  Future<void> _loadAssets() async {
    setState(() {
      _isLoading = true;
    });

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
          if (_assets.length >= 2) {
            _selectedFromAssetId = _assets[0].assetId;
            _selectedToAssetId = _assets[1].assetId;
          }
        });
      }
    } catch (e) {
      print('Error loading assets: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _saveTransfer() async {
    if (_amountController.text.isEmpty || 
        _selectedFromAssetId == null || 
        _selectedToAssetId == null ||
        _selectedFromAssetId == _selectedToAssetId) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_selectedFromAssetId == _selectedToAssetId 
              ? '출금 계좌와 입금 계좌가 같습니다' 
              : '필수 정보를 입력해주세요'),
          backgroundColor: AppColors.primaryRed,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final amount = double.parse(_amountController.text.replaceAll(',', ''));
      
      final requestBody = {
        'userId': userId,
        'transactionType': 'TRANSFER',
        'amount': amount,
        'assetId': _selectedFromAssetId,
        'targetAssetId': _selectedToAssetId,
        'description': _descriptionController.text.isEmpty 
            ? '이체' 
            : _descriptionController.text,
        'memo': _noteController.text,
        'transactionDate': DateFormat('yyyy-MM-dd').format(_selectedDate),
        'transactionTime': '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}:00',
      };

      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/transactions'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
        body: json.encode(requestBody),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        Navigator.pop(context, true);
      } else {
        throw Exception('Failed to save transfer');
      }
    } catch (e) {
      print('Error saving transfer: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('이체 저장 중 오류가 발생했습니다'),
          backgroundColor: AppColors.primaryRed,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onNumberPadTap(String value) {
    setState(() {
      if (value == '×') {
        if (_currentInput.isNotEmpty) {
          _currentInput = _currentInput.substring(0, _currentInput.length - 1);
        }
      } else if (value == '완료') {
        _saveTransfer();
      } else if (value == '📅') {
        _selectDate();
      } else {
        _currentInput += value;
      }
      
      // 숫자 포맷팅 적용
      if (_currentInput.isNotEmpty) {
        final number = int.tryParse(_currentInput);
        if (number != null) {
          _amountController.text = NumberFormat('#,###').format(number);
        }
      } else {
        _amountController.text = '';
      }
    });
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.primaryRed,
              surface: AppColors.cardBackground,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '이체',
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.star_outline, color: AppColors.textPrimary),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.mic, color: AppColors.textPrimary),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // 이체 정보 입력 섹션
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildInputField(
                          label: '날짜',
                          value: DateFormat('yy/M/d (E) a h:mm', 'ko_KR').format(_selectedDate),
                          onTap: _selectDate,
                        ),
                        _buildInputField(
                          label: '금액',
                          child: TextField(
                            controller: _amountController,
                            style: AppTypography.body1,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              hintText: '0',
                              hintStyle: TextStyle(color: AppColors.textTertiary),
                            ),
                            readOnly: true,
                          ),
                        ),
                        _buildInputField(
                          label: '출금',
                          child: DropdownButton<int>(
                            value: _selectedFromAssetId,
                            isExpanded: true,
                            underline: Container(),
                            style: AppTypography.body1,
                            dropdownColor: AppColors.cardBackground,
                            items: _assets.map((asset) {
                              return DropdownMenuItem(
                                value: asset.assetId,
                                child: Text(asset.assetName),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedFromAssetId = value;
                              });
                            },
                          ),
                        ),
                        _buildInputField(
                          label: '입금',
                          child: DropdownButton<int>(
                            value: _selectedToAssetId,
                            isExpanded: true,
                            underline: Container(),
                            style: AppTypography.body1,
                            dropdownColor: AppColors.cardBackground,
                            items: _assets.map((asset) {
                              return DropdownMenuItem(
                                value: asset.assetId,
                                child: Text(asset.assetName),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedToAssetId = value;
                              });
                            },
                          ),
                        ),
                        _buildInputField(
                          label: '내용',
                          child: TextField(
                            controller: _descriptionController,
                            style: AppTypography.body1,
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              hintText: '이체 내용 입력',
                              hintStyle: TextStyle(color: AppColors.textTertiary),
                            ),
                          ),
                        ),
                        _buildInputField(
                          label: '메모',
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _noteController,
                                  style: AppTypography.body1,
                                  decoration: const InputDecoration(
                                    border: InputBorder.none,
                                    hintText: '메모 입력',
                                    hintStyle: TextStyle(color: AppColors.textTertiary),
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.camera_alt, color: AppColors.textSecondary),
                                onPressed: () {
                                  // 사진 첨부 기능
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // 숫자 키패드
                _buildNumberPad(),
              ],
            ),
    );
  }

  Widget _buildInputField({
    required String label,
    String? value,
    Widget? child,
    VoidCallback? onTap,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 0.5),
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: AppTypography.body2.copyWith(color: AppColors.textSecondary),
            ),
          ),
          Expanded(
            child: child ?? GestureDetector(
              onTap: onTap,
              child: Text(
                value ?? '',
                style: AppTypography.body1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNumberPad() {
    final buttons = [
      ['1', '2', '3', '×'],
      ['4', '5', '6', '-'],
      ['7', '8', '9', '📅'],
      ['00', '0', '완료'],
    ];

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(
          top: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: Column(
        children: buttons.map((row) {
          return Row(
            children: row.map((button) {
              final isComplete = button == '완료';
              final isWide = button == '00' || button == '0' || button == '완료';
              
              return Expanded(
                flex: isWide ? 2 : 1,
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Material(
                    color: isComplete ? AppColors.primaryRed : AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                    child: InkWell(
                      onTap: () => _onNumberPadTap(button),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: Text(
                            button,
                            style: AppTypography.h5.copyWith(
                              color: isComplete ? AppColors.textPrimary : AppColors.textPrimary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          );
        }).toList(),
      ),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}

class Asset {
  final int assetId;
  final String assetName;
  final String assetType;
  final double currentBalance;

  Asset({
    required this.assetId,
    required this.assetName,
    required this.assetType,
    required this.currentBalance,
  });

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      assetId: json['assetId'] ?? 0,
      assetName: json['assetName'] ?? '',
      assetType: json['assetType'] ?? '',
      currentBalance: (json['currentBalance'] ?? 0).toDouble(),
    );
  }
}