import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({Key? key}) : super(key: key);

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  DateTime selectedDate = DateTime.now();
  String viewType = 'category'; // category, trend, comparison
  bool isLoading = false;
  final String baseUrl = 'http://10.0.2.2:8090';
  final int userId = 1;
  
  List<CategoryStatistic> categoryStats = [];
  List<DailyStatistic> dailyStats = [];

  @override
  void initState() {
    super.initState();
    loadStatistics();
  }

  Future<void> loadStatistics() async {
    setState(() {
      isLoading = true;
    });

    try {
      await loadCategoryStatistics();
      await loadDailyStatistics();
    } catch (e) {
      print('Error loading statistics: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> loadCategoryStatistics() async {
    try {
      final year = selectedDate.year;
      final month = selectedDate.month;
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/categories/statistics/$year/$month?userId=$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          categoryStats = data.map((item) => CategoryStatistic.fromJson(item)).toList();
        });
      }
    } catch (e) {
      print('Error loading category statistics: $e');
    }
  }

  Future<void> loadDailyStatistics() async {
    try {
      final year = selectedDate.year;
      final month = selectedDate.month;
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/statistics/daily/$year/$month?userId=$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          dailyStats = data.map((item) => DailyStatistic.fromJson(item)).toList();
        });
      }
    } catch (e) {
      print('Error loading daily statistics: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '통계',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today, color: AppColors.textPrimary),
            onPressed: _selectMonth,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildViewTypeSelector(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildViewTypeSelector() {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildViewTypeButton('카테고리', 'category'),
          _buildViewTypeButton('추세', 'trend'),
          _buildViewTypeButton('비교', 'comparison'),
        ],
      ),
    );
  }

  Widget _buildViewTypeButton(String label, String type) {
    final isSelected = viewType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          viewType = type;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isSelected ? AppColors.primaryYellow : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: AppTypography.body1.copyWith(
            color: isSelected ? AppColors.primaryYellow : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryYellow),
      );
    }

    switch (viewType) {
      case 'category':
        return _buildCategoryView();
      case 'trend':
        return _buildTrendView();
      case 'comparison':
        return _buildComparisonView();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildCategoryView() {
    if (categoryStats.isEmpty) {
      return _buildEmptyState();
    }

    final formatter = NumberFormat('#,###');
    final totalExpense = categoryStats.fold<double>(
      0, (sum, stat) => sum + stat.totalAmount,
    );

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // 파이 차트 영역 (간단한 비율 표시로 대체)
        Container(
          height: 200,
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '총 지출',
                  style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                Text(
                  formatter.format(totalExpense),
                  style: AppTypography.h3.copyWith(color: AppColors.primaryRed),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // 카테고리별 목록
        ...categoryStats.map((stat) {
          final percentage = totalExpense > 0 ? (stat.totalAmount / totalExpense * 100) : 0;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.primaryRed.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            _getCategoryIcon(stat.categoryName),
                            color: AppColors.primaryRed,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              stat.categoryName,
                              style: AppTypography.body1,
                            ),
                            Text(
                              '${stat.transactionCount}건',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          formatter.format(stat.totalAmount),
                          style: AppTypography.body1.copyWith(
                            color: AppColors.primaryRed,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${percentage.toStringAsFixed(1)}%',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                // 진행 바
                LinearProgressIndicator(
                  value: percentage / 100,
                  backgroundColor: AppColors.divider,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryRed),
                  minHeight: 4,
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildTrendView() {
    if (dailyStats.isEmpty) {
      return _buildEmptyState();
    }

    final formatter = NumberFormat('#,###');
    
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
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
              // 간단한 바 차트
              SizedBox(
                height: 200,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: dailyStats.take(7).map((stat) {
                    final maxAmount = dailyStats
                        .map((s) => s.totalExpense)
                        .reduce((a, b) => a > b ? a : b);
                    final height = maxAmount > 0 
                        ? (stat.totalExpense / maxAmount * 150)
                        : 0.0;
                    
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Container(
                          width: 30,
                          height: height,
                          decoration: BoxDecoration(
                            color: AppColors.primaryRed,
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${stat.date.day}',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // 일별 상세 목록
        ...dailyStats.map((stat) {
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('MM/dd (E)', 'ko_KR').format(stat.date),
                  style: AppTypography.body2,
                ),
                Row(
                  children: [
                    if (stat.totalIncome > 0) ...[
                      Text(
                        '+${formatter.format(stat.totalIncome)}',
                        style: AppTypography.body2.copyWith(
                          color: AppColors.primaryBlue,
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    if (stat.totalExpense > 0)
                      Text(
                        '-${formatter.format(stat.totalExpense)}',
                        style: AppTypography.body2.copyWith(
                          color: AppColors.primaryRed,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildComparisonView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.insert_chart,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16),
          Text(
            '비교 분석 준비 중',
            style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.bar_chart,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16),
          Text(
            '통계 데이터가 없습니다',
            style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  void _selectMonth() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.primaryYellow,
              surface: AppColors.cardBackground,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        selectedDate = picked;
      });
      loadStatistics();
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
      default:
        return Icons.category;
    }
  }
}

class CategoryStatistic {
  final String categoryName;
  final double totalAmount;
  final int transactionCount;

  CategoryStatistic({
    required this.categoryName,
    required this.totalAmount,
    required this.transactionCount,
  });

  factory CategoryStatistic.fromJson(Map<String, dynamic> json) {
    return CategoryStatistic(
      categoryName: json['categoryName'] ?? '',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      transactionCount: json['transactionCount'] ?? 0,
    );
  }
}

class DailyStatistic {
  final DateTime date;
  final double totalIncome;
  final double totalExpense;
  final int transactionCount;

  DailyStatistic({
    required this.date,
    required this.totalIncome,
    required this.totalExpense,
    required this.transactionCount,
  });

  factory DailyStatistic.fromJson(Map<String, dynamic> json) {
    return DailyStatistic(
      date: DateTime.parse(json['date']),
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
      transactionCount: json['transactionCount'] ?? 0,
    );
  }
}