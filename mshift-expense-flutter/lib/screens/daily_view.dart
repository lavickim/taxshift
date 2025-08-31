import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../models/daily_memo.dart';
import '../services/daily_memo_service.dart';
import '../widgets/memo_dialog.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DailyView extends StatefulWidget {
  final DateTime selectedDate;
  final int userId;
  
  const DailyView({
    Key? key,
    required this.selectedDate,
    required this.userId,
  }) : super(key: key);

  @override
  State<DailyView> createState() => _DailyViewState();
}

class _DailyViewState extends State<DailyView> {
  final DailyMemoService _memoService = DailyMemoService();
  List<Transaction> _transactions = [];
  DailyMemo? _todayMemo;
  bool _isLoading = true;
  
  double _totalIncome = 0;
  double _totalExpense = 0;
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  @override
  void didUpdateWidget(DailyView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate != widget.selectedDate) {
      _loadData();
    }
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    await Future.wait([
      _loadTransactions(),
      _loadMemo(),
    ]);
    
    setState(() {
      _isLoading = false;
    });
  }
  
  Future<void> _loadTransactions() async {
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(widget.selectedDate);
      final response = await http.get(
        Uri.parse('http://10.0.2.2:8090/api/v1/transactions/daily/$dateStr?userId=${widget.userId}'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _transactions = data.map((tx) => Transaction.fromJson(tx)).toList();
          _calculateTotals();
        });
      }
    } catch (e) {
      print('Error loading daily transactions: $e');
    }
  }
  
  Future<void> _loadMemo() async {
    try {
      final memo = await _memoService.getMemoByDate(widget.userId, widget.selectedDate);
      setState(() {
        _todayMemo = memo;
      });
    } catch (e) {
      print('Error loading memo: $e');
    }
  }
  
  void _calculateTotals() {
    _totalIncome = 0;
    _totalExpense = 0;
    
    for (var tx in _transactions) {
      if (tx.transactionType == 'INCOME') {
        _totalIncome += tx.amount;
      } else if (tx.transactionType == 'EXPENSE') {
        _totalExpense += tx.amount;
      }
    }
  }
  
  void _showMemoDialog() {
    showDialog(
      context: context,
      builder: (context) => MemoDialog(
        date: widget.selectedDate,
        existingMemo: _todayMemo,
        userId: widget.userId,
      ),
    ).then((result) {
      if (result != null || (result == null && _todayMemo != null)) {
        _loadMemo();
      }
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,###');
    final isToday = DateFormat('yyyy-MM-dd').format(widget.selectedDate) == 
                    DateFormat('yyyy-MM-dd').format(DateTime.now());
    
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryRed),
      );
    }
    
    return SingleChildScrollView(
      child: Column(
        children: [
          // 날짜 헤더
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.cardBackground,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      DateFormat('yyyy년 MM월 dd일').format(widget.selectedDate),
                      style: AppTypography.h4,
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isToday ? AppColors.primaryRed : AppColors.background,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _getWeekdayName(widget.selectedDate.weekday),
                        style: AppTypography.caption.copyWith(
                          color: isToday ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // 수입/지출 요약
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Column(
                      children: [
                        Text('수입', style: AppTypography.caption),
                        const SizedBox(height: 4),
                        Text(
                          '+ ${formatter.format(_totalIncome)}',
                          style: AppTypography.h5.copyWith(
                            color: AppColors.primaryBlue,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 1,
                      height: 40,
                      color: AppColors.divider,
                    ),
                    Column(
                      children: [
                        Text('지출', style: AppTypography.caption),
                        const SizedBox(height: 4),
                        Text(
                          '- ${formatter.format(_totalExpense)}',
                          style: AppTypography.h5.copyWith(
                            color: AppColors.primaryRed,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 1,
                      height: 40,
                      color: AppColors.divider,
                    ),
                    Column(
                      children: [
                        Text('합계', style: AppTypography.caption),
                        const SizedBox(height: 4),
                        Text(
                          formatter.format(_totalIncome - _totalExpense),
                          style: AppTypography.h5.copyWith(
                            color: (_totalIncome - _totalExpense) >= 0 
                                ? AppColors.primaryBlue 
                                : AppColors.primaryRed,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // 메모 섹션
          if (_todayMemo != null) ...[
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Color(int.parse('0xFF${_todayMemo!.color?.substring(1) ?? "4A90E2"}')).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Color(int.parse('0xFF${_todayMemo!.color?.substring(1) ?? "4A90E2"}')),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _todayMemo!.isImportant ? Icons.star : Icons.note,
                        color: _todayMemo!.isImportant 
                            ? Colors.amber 
                            : Color(int.parse('0xFF${_todayMemo!.color?.substring(1) ?? "4A90E2"}')),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _todayMemo!.title ?? '메모',
                          style: AppTypography.body1.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit, size: 20),
                        onPressed: _showMemoDialog,
                        color: AppColors.textSecondary,
                      ),
                    ],
                  ),
                  if (_todayMemo!.content != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _todayMemo!.content!,
                      style: AppTypography.body2,
                    ),
                  ],
                ],
              ),
            ),
          ] else ...[
            GestureDetector(
              onTap: _showMemoDialog,
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.divider,
                    width: 1,
                    style: BorderStyle.solid,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.add_circle_outline, 
                         color: AppColors.textSecondary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '메모 추가',
                      style: AppTypography.body2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          
          // 거래 내역
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '거래 내역',
                  style: AppTypography.h5,
                ),
                Text(
                  '${_transactions.length}건',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          
          if (_transactions.isEmpty) ...[
            Container(
              height: 200,
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 48,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '거래 내역이 없습니다',
                    style: AppTypography.body1.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _transactions.length,
              itemBuilder: (context, index) {
                final tx = _transactions[index];
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.cardBackground,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: tx.transactionType == 'INCOME' 
                              ? AppColors.primaryBlue.withOpacity(0.1)
                              : AppColors.primaryRed.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          tx.transactionType == 'INCOME' 
                              ? Icons.add_circle_outline
                              : Icons.remove_circle_outline,
                          color: tx.transactionType == 'INCOME' 
                              ? AppColors.primaryBlue
                              : AppColors.primaryRed,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tx.description,
                              style: AppTypography.body1,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              tx.categoryName,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${tx.transactionType == 'INCOME' ? '+' : '-'} ${formatter.format(tx.amount)}',
                        style: AppTypography.body1.copyWith(
                          color: tx.transactionType == 'INCOME' 
                              ? AppColors.primaryBlue
                              : AppColors.primaryRed,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
          const SizedBox(height: 80),
        ],
      ),
    );
  }
  
  String _getWeekdayName(int weekday) {
    const weekdays = ['', '월', '화', '수', '목', '금', '토', '일'];
    return weekdays[weekday];
  }
}

class Transaction {
  final int transactionId;
  final String description;
  final double amount;
  final String categoryName;
  final DateTime transactionDate;
  final String transactionType;
  final String? assetName;

  Transaction({
    required this.transactionId,
    required this.description,
    required this.amount,
    required this.categoryName,
    required this.transactionDate,
    required this.transactionType,
    this.assetName,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      transactionId: json['transactionId'] ?? 0,
      description: json['description'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      categoryName: json['categoryName'] ?? '',
      transactionDate: DateTime.parse(json['transactionDate']),
      transactionType: json['transactionType'] ?? '',
      assetName: json['assetName'],
    );
  }
}