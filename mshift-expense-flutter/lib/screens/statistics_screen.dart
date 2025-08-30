import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:convert';
import 'dart:math' as math;
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
  
  // Chart colors
  final List<Color> chartColors = [
    AppColors.primaryRed,
    AppColors.primaryBlue,
    AppColors.primaryYellow,
    const Color(0xFF9C27B0), // Purple
    const Color(0xFF00BCD4), // Cyan
    const Color(0xFF4CAF50), // Green
    const Color(0xFFFF9800), // Orange
    const Color(0xFF795548), // Brown
  ];

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
          _buildMonthSelector(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppColors.cardBackground,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left, color: AppColors.textPrimary),
            onPressed: () {
              setState(() {
                selectedDate = DateTime(selectedDate.year, selectedDate.month - 1);
              });
              loadStatistics();
            },
          ),
          Text(
            DateFormat('yyyy년 MM월').format(selectedDate),
            style: AppTypography.body1.copyWith(fontWeight: FontWeight.bold),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right, color: AppColors.textPrimary),
            onPressed: () {
              setState(() {
                selectedDate = DateTime(selectedDate.year, selectedDate.month + 1);
              });
              loadStatistics();
            },
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
        // Pie Chart
        Container(
          height: 250,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Text(
                '카테고리별 지출',
                style: AppTypography.h5,
              ),
              const SizedBox(height: 16),
              Expanded(
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 2,
                    centerSpaceRadius: 40,
                    sections: _createPieChartSections(),
                    pieTouchData: PieTouchData(
                      touchCallback: (FlTouchEvent event, pieTouchResponse) {
                        setState(() {});
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Total summary
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '총 지출',
                style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
              ),
              Text(
                '${formatter.format(totalExpense)}원',
                style: AppTypography.h5.copyWith(color: AppColors.primaryRed),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Category list with progress bars
        ...categoryStats.asMap().entries.map((entry) {
          final index = entry.key;
          final stat = entry.value;
          final percentage = totalExpense > 0 ? (stat.totalAmount / totalExpense * 100) : 0;
          final color = chartColors[index % chartColors.length];
          
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
                            color: color.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            _getCategoryIcon(stat.categoryName),
                            color: color,
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
                            color: color,
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
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: percentage / 100,
                    backgroundColor: AppColors.divider,
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  List<PieChartSectionData> _createPieChartSections() {
    final totalExpense = categoryStats.fold<double>(
      0, (sum, stat) => sum + stat.totalAmount,
    );
    
    return categoryStats.asMap().entries.map((entry) {
      final index = entry.key;
      final stat = entry.value;
      final percentage = totalExpense > 0 ? (stat.totalAmount / totalExpense * 100) : 0;
      final color = chartColors[index % chartColors.length];
      
      return PieChartSectionData(
        color: color,
        value: stat.totalAmount,
        title: '${percentage.toStringAsFixed(0)}%',
        radius: 50,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      );
    }).toList();
  }

  Widget _buildTrendView() {
    if (dailyStats.isEmpty) {
      return _buildEmptyState();
    }

    final formatter = NumberFormat('#,###');
    
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Line Chart for Income/Expense Trend
        Container(
          height: 300,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '일별 수입/지출 추이',
                style: AppTypography.h5,
              ),
              const SizedBox(height: 16),
              Expanded(
                child: LineChart(
                  LineChartData(
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: false,
                      horizontalInterval: _calculateInterval(),
                      getDrawingHorizontalLine: (value) {
                        return FlLine(
                          color: AppColors.divider,
                          strokeWidth: 1,
                        );
                      },
                    ),
                    titlesData: FlTitlesData(
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 50,
                          getTitlesWidget: (value, meta) {
                            if (value == 0) return const SizedBox.shrink();
                            return Text(
                              '${(value / 10000).toStringAsFixed(0)}만',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 10,
                              ),
                            );
                          },
                        ),
                      ),
                      rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 30,
                          interval: math.max(1, dailyStats.length ~/ 7).toDouble(),
                          getTitlesWidget: (value, meta) {
                            final index = value.toInt();
                            if (index >= 0 && index < dailyStats.length) {
                              return Text(
                                '${dailyStats[index].date.day}일',
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 10,
                                ),
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                      ),
                    ),
                    borderData: FlBorderData(
                      show: true,
                      border: Border.all(color: AppColors.divider),
                    ),
                    lineBarsData: [
                      // Income line
                      LineChartBarData(
                        spots: _createIncomeSpots(),
                        isCurved: true,
                        color: AppColors.primaryBlue,
                        barWidth: 3,
                        dotData: const FlDotData(show: false),
                        belowBarData: BarAreaData(
                          show: true,
                          color: AppColors.primaryBlue.withOpacity(0.1),
                        ),
                      ),
                      // Expense line
                      LineChartBarData(
                        spots: _createExpenseSpots(),
                        isCurved: true,
                        color: AppColors.primaryRed,
                        barWidth: 3,
                        dotData: const FlDotData(show: false),
                        belowBarData: BarAreaData(
                          show: true,
                          color: AppColors.primaryRed.withOpacity(0.1),
                        ),
                      ),
                    ],
                    lineTouchData: LineTouchData(
                      touchTooltipData: LineTouchTooltipData(
                        getTooltipColor: (touchedSpot) => AppColors.cardBackground,
                        getTooltipItems: (touchedSpots) {
                          return touchedSpots.map((LineBarSpot touchedSpot) {
                            final textStyle = TextStyle(
                              color: touchedSpot.bar.color,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            );
                            return LineTooltipItem(
                              formatter.format(touchedSpot.y),
                              textStyle,
                            );
                          }).toList();
                        },
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Legend
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLegendItem('수입', AppColors.primaryBlue),
                  const SizedBox(width: 24),
                  _buildLegendItem('지출', AppColors.primaryRed),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Bar Chart for Daily Comparison
        Container(
          height: 250,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '일별 지출 비교',
                style: AppTypography.h5,
              ),
              const SizedBox(height: 16),
              Expanded(
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: _getMaxExpense() * 1.2,
                    barTouchData: BarTouchData(
                      touchTooltipData: BarTouchTooltipData(
                        getTooltipColor: (touchedSpot) => AppColors.cardBackground,
                      ),
                    ),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            final index = value.toInt();
                            if (index >= 0 && index < dailyStats.length && index % 3 == 0) {
                              return Text(
                                '${dailyStats[index].date.day}',
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 10,
                                ),
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                      ),
                    ),
                    gridData: const FlGridData(show: false),
                    borderData: FlBorderData(show: false),
                    barGroups: _createBarGroups(),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Daily list
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

  List<FlSpot> _createIncomeSpots() {
    return dailyStats.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.totalIncome);
    }).toList();
  }

  List<FlSpot> _createExpenseSpots() {
    return dailyStats.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.totalExpense);
    }).toList();
  }

  List<BarChartGroupData> _createBarGroups() {
    return dailyStats.asMap().entries.map((entry) {
      final index = entry.key;
      final stat = entry.value;
      
      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: stat.totalExpense,
            color: AppColors.primaryRed,
            width: 8,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
        ],
      );
    }).toList();
  }

  double _getMaxExpense() {
    if (dailyStats.isEmpty) return 100000;
    return dailyStats.map((s) => s.totalExpense).reduce((a, b) => a > b ? a : b);
  }

  double _calculateInterval() {
    final maxAmount = dailyStats.isEmpty ? 100000.0 : math.max(
      dailyStats.map((s) => s.totalIncome).reduce((a, b) => a > b ? a : b),
      dailyStats.map((s) => s.totalExpense).reduce((a, b) => a > b ? a : b),
    );
    return (maxAmount / 5).roundToDouble();
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildComparisonView() {
    // Mock data for comparison
    final lastMonthTotal = 1500000.0;
    final thisMonthTotal = categoryStats.fold<double>(
      0, (sum, stat) => sum + stat.totalAmount,
    );
    final difference = thisMonthTotal - lastMonthTotal;
    final percentageChange = lastMonthTotal > 0 ? (difference / lastMonthTotal * 100) : 0.0;
    final formatter = NumberFormat('#,###');
    
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Month to Month Comparison
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
                '전월 대비 비교',
                style: AppTypography.h5,
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      Text(
                        '지난달',
                        style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        formatter.format(lastMonthTotal),
                        style: AppTypography.h5.copyWith(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  Icon(
                    difference > 0 ? Icons.arrow_forward : Icons.arrow_back,
                    color: difference > 0 ? AppColors.primaryRed : AppColors.primaryBlue,
                  ),
                  Column(
                    children: [
                      Text(
                        '이번달',
                        style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        formatter.format(thisMonthTotal),
                        style: AppTypography.h5.copyWith(color: AppColors.primaryRed),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      difference > 0 ? Icons.trending_up : Icons.trending_down,
                      color: difference > 0 ? AppColors.primaryRed : AppColors.primaryBlue,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${difference > 0 ? '+' : ''}${formatter.format(difference)} (${percentageChange > 0 ? '+' : ''}${percentageChange.toStringAsFixed(1)}%)',
                      style: AppTypography.body1.copyWith(
                        color: difference > 0 ? AppColors.primaryRed : AppColors.primaryBlue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Category Comparison
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
                '카테고리별 전월 대비',
                style: AppTypography.h5,
              ),
              const SizedBox(height: 16),
              ...categoryStats.map((stat) {
                // Mock last month data
                final lastMonthAmount = stat.totalAmount * 0.8;
                final diff = stat.totalAmount - lastMonthAmount;
                final pctChange = lastMonthAmount > 0 ? (diff / lastMonthAmount * 100) : 0.0;
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            _getCategoryIcon(stat.categoryName),
                            color: AppColors.textSecondary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            stat.categoryName,
                            style: AppTypography.body2,
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: diff > 0 
                              ? AppColors.primaryRed.withOpacity(0.1)
                              : AppColors.primaryBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${diff > 0 ? '↑' : '↓'} ${pctChange.abs().toStringAsFixed(0)}%',
                          style: AppTypography.caption.copyWith(
                            color: diff > 0 ? AppColors.primaryRed : AppColors.primaryBlue,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ],
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
      case '통신':
        return Icons.phone_android;
      case '주거':
        return Icons.home;
      case '금융':
        return Icons.account_balance;
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