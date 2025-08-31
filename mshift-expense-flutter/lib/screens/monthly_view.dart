import '../config/api_config.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class MonthlyView extends StatefulWidget {
  final DateTime selectedDate;
  final int userId;
  
  const MonthlyView({
    Key? key,
    required this.selectedDate,
    required this.userId,
  }) : super(key: key);

  @override
  State<MonthlyView> createState() => _MonthlyViewState();
}

class _MonthlyViewState extends State<MonthlyView> {
  bool _isLoading = true;
  MonthlySummary? _monthlySummary;
  List<CategorySummary> _categoryBreakdown = [];
  List<DailySummary> _dailySummaries = [];
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  @override
  void didUpdateWidget(MonthlyView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate.year != widget.selectedDate.year ||
        oldWidget.selectedDate.month != widget.selectedDate.month) {
      _loadData();
    }
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });
    
    await Future.wait([
      _loadMonthlySummary(),
      _loadCategoryBreakdown(),
      _loadDailySummaries(),
    ]);
    
    setState(() {
      _isLoading = false;
    });
  }
  
  Future<void> _loadMonthlySummary() async {
    try {
      final year = widget.selectedDate.year;
      final month = widget.selectedDate.month;
      final response = await http.get(
        Uri.parse('' + ApiConfig.baseUrl + '/api/v1/transactions/statistics/monthly/$year/$month?userId=${widget.userId}'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _monthlySummary = MonthlySummary.fromJson(data);
        });
      }
    } catch (e) {
      print('Error loading monthly summary: $e');
    }
  }
  
  Future<void> _loadCategoryBreakdown() async {
    try {
      final year = widget.selectedDate.year;
      final month = widget.selectedDate.month;
      final response = await http.get(
        Uri.parse('' + ApiConfig.baseUrl + '/api/v1/transactions/statistics/category/$year/$month?userId=${widget.userId}'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _categoryBreakdown = data.map((item) => CategorySummary.fromJson(item)).toList();
          _categoryBreakdown.sort((a, b) => b.amount.compareTo(a.amount));
        });
      }
    } catch (e) {
      print('Error loading category breakdown: $e');
    }
  }
  
  Future<void> _loadDailySummaries() async {
    try {
      final year = widget.selectedDate.year;
      final month = widget.selectedDate.month;
      final response = await http.get(
        Uri.parse('' + ApiConfig.baseUrl + '/api/v1/transactions/statistics/daily/$year/$month?userId=${widget.userId}'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _dailySummaries = data.map((item) => DailySummary.fromJson(item)).toList();
        });
      }
    } catch (e) {
      print('Error loading daily summaries: $e');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,###');
    
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryRed),
      );
    }
    
    return SingleChildScrollView(
      child: Column(
        children: [
          // 월별 요약
          if (_monthlySummary != null)
            Container(
              padding: const EdgeInsets.all(16),
              color: AppColors.cardBackground,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSummaryItem(
                    '총 수입',
                    formatter.format(_monthlySummary!.totalIncome),
                    AppColors.primaryBlue,
                  ),
                  Container(width: 1, height: 40, color: AppColors.divider),
                  _buildSummaryItem(
                    '총 지출',
                    formatter.format(_monthlySummary!.totalExpense),
                    AppColors.primaryRed,
                  ),
                  Container(width: 1, height: 40, color: AppColors.divider),
                  _buildSummaryItem(
                    '잔액',
                    formatter.format(_monthlySummary!.totalIncome - _monthlySummary!.totalExpense),
                    (_monthlySummary!.totalIncome - _monthlySummary!.totalExpense) >= 0 
                        ? AppColors.primaryBlue 
                        : AppColors.primaryRed,
                  ),
                ],
              ),
            ),
          
          // 일별 지출 그래프
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '일별 지출 추이',
                  style: AppTypography.h5,
                ),
                const SizedBox(height: 16),
                if (_dailySummaries.isNotEmpty) ...[
                  SizedBox(
                    height: 150,
                    child: CustomPaint(
                      size: Size.infinite,
                      painter: SpendingGraphPainter(
                        dailySummaries: _dailySummaries,
                        selectedDate: widget.selectedDate,
                      ),
                    ),
                  ),
                ] else ...[
                  Container(
                    height: 100,
                    alignment: Alignment.center,
                    child: Text(
                      '데이터가 없습니다',
                      style: AppTypography.body2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          
          // 카테고리별 지출
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '카테고리별 지출',
                  style: AppTypography.h5,
                ),
                const SizedBox(height: 12),
                if (_categoryBreakdown.isNotEmpty) ...[
                  ..._categoryBreakdown.where((cat) => cat.type == 'EXPENSE').take(5).map((category) {
                    final maxAmount = _categoryBreakdown
                        .where((c) => c.type == 'EXPENSE')
                        .fold(0.0, (max, c) => c.amount > max ? c.amount : max);
                    final percentage = maxAmount > 0 ? category.amount / maxAmount : 0.0;
                    
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                category.categoryName,
                                style: AppTypography.body2,
                              ),
                              Text(
                                formatter.format(category.amount),
                                style: AppTypography.body2.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Container(
                            height: 20,
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: percentage,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppColors.primaryRed,
                                      AppColors.primaryRed.withOpacity(0.7),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ] else ...[
                  Container(
                    height: 100,
                    alignment: Alignment.center,
                    child: Text(
                      '지출 내역이 없습니다',
                      style: AppTypography.body2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          
          // 카테고리별 수입
          if (_categoryBreakdown.any((cat) => cat.type == 'INCOME')) ...[
            Container(
              margin: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '카테고리별 수입',
                    style: AppTypography.h5,
                  ),
                  const SizedBox(height: 12),
                  ..._categoryBreakdown.where((cat) => cat.type == 'INCOME').map((category) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            category.categoryName,
                            style: AppTypography.body2,
                          ),
                          Text(
                            '+ ${formatter.format(category.amount)}',
                            style: AppTypography.body2.copyWith(
                              color: AppColors.primaryBlue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: 80),
        ],
      ),
    );
  }
  
  Widget _buildSummaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: AppTypography.caption,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTypography.h5.copyWith(
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

// 일별 지출 그래프 페인터
class SpendingGraphPainter extends CustomPainter {
  final List<DailySummary> dailySummaries;
  final DateTime selectedDate;
  
  SpendingGraphPainter({
    required this.dailySummaries,
    required this.selectedDate,
  });
  
  @override
  void paint(Canvas canvas, Size size) {
    if (dailySummaries.isEmpty) return;
    
    final paint = Paint()
      ..color = AppColors.primaryRed
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    
    final fillPaint = Paint()
      ..color = AppColors.primaryRed.withOpacity(0.1)
      ..style = PaintingStyle.fill;
    
    final maxAmount = dailySummaries.fold(0.0, (max, summary) => 
        summary.totalExpense > max ? summary.totalExpense : max);
    
    if (maxAmount == 0) return;
    
    final path = Path();
    final fillPath = Path();
    
    final daysInMonth = DateTime(selectedDate.year, selectedDate.month + 1, 0).day;
    final dayWidth = size.width / daysInMonth;
    
    bool firstPoint = true;
    
    for (int day = 1; day <= daysInMonth; day++) {
      final summary = dailySummaries.firstWhere(
        (s) => s.date.day == day,
        orElse: () => DailySummary(
          date: DateTime(selectedDate.year, selectedDate.month, day),
          totalIncome: 0,
          totalExpense: 0,
        ),
      );
      
      final x = (day - 1) * dayWidth + dayWidth / 2;
      final y = size.height - (summary.totalExpense / maxAmount) * size.height * 0.8;
      
      if (firstPoint) {
        path.moveTo(x, y);
        fillPath.moveTo(x, size.height);
        fillPath.lineTo(x, y);
        firstPoint = false;
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }
    
    fillPath.lineTo(size.width, size.height);
    fillPath.close();
    
    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);
    
    // 점 그리기
    final dotPaint = Paint()
      ..color = AppColors.primaryRed
      ..style = PaintingStyle.fill;
    
    for (int day = 1; day <= daysInMonth; day++) {
      final summary = dailySummaries.firstWhere(
        (s) => s.date.day == day,
        orElse: () => DailySummary(
          date: DateTime(selectedDate.year, selectedDate.month, day),
          totalIncome: 0,
          totalExpense: 0,
        ),
      );
      
      if (summary.totalExpense > 0) {
        final x = (day - 1) * dayWidth + dayWidth / 2;
        final y = size.height - (summary.totalExpense / maxAmount) * size.height * 0.8;
        canvas.drawCircle(Offset(x, y), 3, dotPaint);
      }
    }
  }
  
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// 데이터 모델들
class MonthlySummary {
  final double totalIncome;
  final double totalExpense;
  final int transactionCount;
  
  MonthlySummary({
    required this.totalIncome,
    required this.totalExpense,
    required this.transactionCount,
  });
  
  factory MonthlySummary.fromJson(Map<String, dynamic> json) {
    return MonthlySummary(
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
      transactionCount: json['transactionCount'] ?? 0,
    );
  }
}

class CategorySummary {
  final String categoryName;
  final String type;
  final double amount;
  final int count;
  
  CategorySummary({
    required this.categoryName,
    required this.type,
    required this.amount,
    required this.count,
  });
  
  factory CategorySummary.fromJson(Map<String, dynamic> json) {
    return CategorySummary(
      categoryName: json['categoryName'] ?? '',
      type: json['type'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      count: json['count'] ?? 0,
    );
  }
}

class DailySummary {
  final DateTime date;
  final double totalIncome;
  final double totalExpense;
  
  DailySummary({
    required this.date,
    required this.totalIncome,
    required this.totalExpense,
  });
  
  factory DailySummary.fromJson(Map<String, dynamic> json) {
    return DailySummary(
      date: DateTime.parse(json['date']),
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
    );
  }
}