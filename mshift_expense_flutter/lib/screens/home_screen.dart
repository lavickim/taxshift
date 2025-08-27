import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  DateTime selectedDate = DateTime.now();
  late TabController _tabController;
  int _selectedTabIndex = 1; // 달력 탭 기본 선택
  Map<int, List<Transaction>> transactionsByDay = {};
  MonthlySummary? monthlySummary;
  bool isLoading = false;
  final String baseUrl = 'http://10.0.2.2:8090';
  final int userId = 1;

  final List<String> _topTabs = ['일일', '달력', '월별', '결산', '메모'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _topTabs.length, vsync: this, initialIndex: 1);
    loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> loadData() async {
    setState(() {
      isLoading = true;
    });

    try {
      await Future.wait([
        loadTransactions(),
        loadMonthlySummary(),
      ]);
    } catch (e) {
      print('Error loading data: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> loadTransactions() async {
    try {
      final year = selectedDate.year;
      final month = selectedDate.month;
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/monthly/$year/$month?userId=$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final transactions = data.map((tx) => Transaction.fromJson(tx)).toList();
        
        // 날짜별로 그룹화
        setState(() {
          transactionsByDay = {};
          for (var tx in transactions) {
            final day = tx.transactionDate.day;
            if (!transactionsByDay.containsKey(day)) {
              transactionsByDay[day] = [];
            }
            transactionsByDay[day]!.add(tx);
          }
        });
      }
    } catch (e) {
      print('Error loading transactions: $e');
    }
  }

  Future<void> loadMonthlySummary() async {
    try {
      final year = selectedDate.year;
      final month = selectedDate.month;
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/statistics/monthly/$year/$month?userId=$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          monthlySummary = MonthlySummary.fromJson(data);
        });
      }
    } catch (e) {
      print('Error loading monthly summary: $e');
    }
  }

  void changeMonth(int offset) {
    setState(() {
      selectedDate = DateTime(selectedDate.year, selectedDate.month + offset, 1);
    });
    loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildTabBar(),
          _buildSummarySection(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildDailyView(),
                _buildCalendarView(),
                _buildMonthlyView(),
                _buildSettlementView(),
                _buildMemoView(),
              ],
            ),
          ),
          _buildBottomDateBar(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    final monthFormatter = DateFormat('yyyy년 M월', 'ko_KR');
    
    return AppBar(
      backgroundColor: AppColors.background,
      elevation: 0,
      centerTitle: true,
      leadingWidth: 48,
      leading: IconButton(
        icon: const Icon(Icons.chevron_left, color: AppColors.textPrimary, size: 28),
        onPressed: () => changeMonth(-1),
      ),
      title: Text(
        monthFormatter.format(selectedDate),
        style: AppTypography.h4,
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.chevron_right, color: AppColors.textPrimary, size: 28),
          onPressed: () => changeMonth(1),
        ),
        IconButton(
          icon: const Icon(Icons.search, color: AppColors.textPrimary),
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.menu, color: AppColors.textPrimary),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildTabBar() {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: TabBar(
        controller: _tabController,
        indicatorColor: AppColors.primaryRed,
        indicatorWeight: 2,
        labelColor: AppColors.textPrimary,
        unselectedLabelColor: AppColors.textTertiary,
        labelStyle: AppTypography.body1,
        tabs: _topTabs.map((tab) => Tab(text: tab)).toList(),
      ),
    );
  }

  Widget _buildSummarySection() {
    final formatter = NumberFormat('#,###');
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildSummaryItem(
            '수입',
            formatter.format(monthlySummary?.totalIncome ?? 0),
            AppColors.primaryBlue,
          ),
          Container(
            width: 1,
            height: 40,
            color: AppColors.divider,
          ),
          _buildSummaryItem(
            '지출',
            formatter.format(monthlySummary?.totalExpense ?? 0),
            AppColors.primaryRed,
          ),
          Container(
            width: 1,
            height: 40,
            color: AppColors.divider,
          ),
          _buildSummaryItem(
            '합계',
            formatter.format(monthlySummary?.balance ?? 0),
            (monthlySummary?.balance ?? 0) >= 0 ? AppColors.primaryBlue : AppColors.primaryRed,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String amount, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 4),
        Text(
          amount,
          style: AppTypography.h5.copyWith(color: color),
        ),
      ],
    );
  }

  Widget _buildCalendarView() {
    // 현재 날짜 기준으로 PageController 생성
    final now = DateTime.now();
    final currentMonthDiff = (selectedDate.year - now.year) * 12 + (selectedDate.month - now.month);
    
    return PageView.builder(
      controller: PageController(
        initialPage: 1200 + currentMonthDiff, // 선택된 월로 시작
      ),
      onPageChanged: (index) {
        // 1200을 기준으로 월 차이 계산
        final monthDiff = index - 1200;
        final newDate = DateTime(
          now.year,
          now.month + monthDiff,
          1,
        );
        setState(() {
          selectedDate = newDate;
        });
        loadData();
      },
      itemBuilder: (context, pageIndex) {
        // 1200을 기준으로 월 차이 계산
        final monthDiff = pageIndex - 1200;
        final displayDate = DateTime(
          now.year,
          now.month + monthDiff,
          1,
        );
        
        final daysInMonth = DateTime(displayDate.year, displayDate.month + 1, 0).day;
        final firstDayOfMonth = DateTime(displayDate.year, displayDate.month, 1);
        
        // Flutter의 weekday: 1=월요일, 2=화요일, ..., 7=일요일
        // 캘린더 표시용: 일요일=0, 월요일=1, ..., 토요일=6
        int firstWeekday;
        if (firstDayOfMonth.weekday == 7) {
          firstWeekday = 0; // 일요일
        } else {
          firstWeekday = firstDayOfMonth.weekday; // 월요일=1, 화요일=2, ...
        }
        
        final weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        
        // 해당 월의 거래 데이터 가져오기
        Map<int, List<Transaction>> monthTransactions = {};
        if (displayDate.year == selectedDate.year && 
            displayDate.month == selectedDate.month) {
          monthTransactions = transactionsByDay;
        }
        
        return Column(
          children: [
            // 요일 헤더
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: weekDays.map((day) {
                  return Text(
                    day,
                    style: AppTypography.caption.copyWith(
                      color: day == '일' ? AppColors.primaryRed : 
                             (day == '토' ? AppColors.primaryBlue : AppColors.textSecondary),
                      fontWeight: FontWeight.bold,
                    ),
                  );
                }).toList(),
              ),
            ),
            // 캘린더 그리드
            Expanded(
              child: GestureDetector(
                onHorizontalDragEnd: (details) {
                  // 스와이프 제스처 추가 지원
                  if (details.primaryVelocity! < 0) {
                    // 왼쪽 스와이프 - 다음 달
                    changeMonth(1);
                  } else if (details.primaryVelocity! > 0) {
                    // 오른쪽 스와이프 - 이전 달
                    changeMonth(-1);
                  }
                },
                child: GridView.builder(
                  physics: const NeverScrollableScrollPhysics(), // GridView 자체 스크롤 비활성화
                  padding: const EdgeInsets.all(8),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    childAspectRatio: 0.9,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                  ),
                  itemCount: 42,
                  itemBuilder: (context, index) {
                    final dayNumber = index - firstWeekday + 1;
                    final isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                    final isToday = isCurrentMonth && 
                                   dayNumber == DateTime.now().day &&
                                   displayDate.month == DateTime.now().month &&
                                   displayDate.year == DateTime.now().year;
                    
                    // 이전/다음 달 날짜 표시
                    int displayDay = dayNumber;
                    bool isPrevMonth = false;
                    bool isNextMonth = false;
                    
                    if (dayNumber <= 0) {
                      // 이전 달 날짜
                      isPrevMonth = true;
                      final prevMonth = DateTime(displayDate.year, displayDate.month, 0);
                      displayDay = prevMonth.day + dayNumber;
                    } else if (dayNumber > daysInMonth) {
                      // 다음 달 날짜
                      isNextMonth = true;
                      displayDay = dayNumber - daysInMonth;
                    }
                    
                    final dayTransactions = monthTransactions[dayNumber] ?? [];
                    double dayIncome = 0;
                    double dayExpense = 0;
                    
                    for (var tx in dayTransactions) {
                      if (tx.transactionType == 'INCOME') {
                        dayIncome += tx.amount;
                      } else if (tx.transactionType == 'EXPENSE') {
                        dayExpense += tx.amount;
                      }
                    }
                    
                    return GestureDetector(
                      onTap: () {
                        if (isPrevMonth) {
                          // 이전 달로 이동
                          changeMonth(-1);
                        } else if (isNextMonth) {
                          // 다음 달로 이동
                          changeMonth(1);
                        } else if (isCurrentMonth) {
                          // 날짜 클릭 시 상세 보기
                          _showDayDetails(displayDate, dayNumber, dayTransactions);
                        }
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: isToday ? AppColors.primaryRed.withOpacity(0.1) : 
                                 isCurrentMonth ? AppColors.cardBackground : 
                                 Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: isToday ? Border.all(color: AppColors.primaryRed, width: 1) : null,
                        ),
                        padding: const EdgeInsets.all(4),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              displayDay.toString(),
                              style: AppTypography.caption.copyWith(
                                color: isToday ? AppColors.primaryRed : 
                                       (isPrevMonth || isNextMonth) ? AppColors.textTertiary :
                                       AppColors.textPrimary,
                                fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            if (isCurrentMonth) ...[
                              const SizedBox(height: 2),
                              if (dayIncome > 0)
                                Text(
                                  '+${NumberFormat.compact(locale: 'ko').format(dayIncome)}',
                                  style: TextStyle(
                                    color: AppColors.primaryBlue,
                                    fontSize: 10,
                                  ),
                                ),
                              if (dayExpense > 0)
                                Text(
                                  '-${NumberFormat.compact(locale: 'ko').format(dayExpense)}',
                                  style: TextStyle(
                                    color: AppColors.primaryRed,
                                    fontSize: 10,
                                  ),
                                ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showDayDetails(DateTime date, int day, List<Transaction> transactions) {
    // 날짜별 상세 거래 내역 표시
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final formatter = NumberFormat('#,###');
        double totalIncome = 0;
        double totalExpense = 0;
        
        for (var tx in transactions) {
          if (tx.transactionType == 'INCOME') {
            totalIncome += tx.amount;
          } else {
            totalExpense += tx.amount;
          }
        }
        
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${date.year}년 ${date.month}월 ${day}일',
                    style: AppTypography.h5,
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Column(
                    children: [
                      Text('수입', style: AppTypography.caption),
                      Text(
                        formatter.format(totalIncome),
                        style: AppTypography.body1.copyWith(color: AppColors.primaryBlue),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Text('지출', style: AppTypography.caption),
                      Text(
                        formatter.format(totalExpense),
                        style: AppTypography.body1.copyWith(color: AppColors.primaryRed),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Expanded(
                child: transactions.isEmpty
                    ? Center(
                        child: Text(
                          '거래 내역이 없습니다',
                          style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
                        ),
                      )
                    : ListView.builder(
                        itemCount: transactions.length,
                        itemBuilder: (context, index) {
                          final tx = transactions[index];
                          return ListTile(
                            leading: Icon(
                              tx.transactionType == 'INCOME' ? Icons.add_circle : Icons.remove_circle,
                              color: tx.transactionType == 'INCOME' ? AppColors.primaryBlue : AppColors.primaryRed,
                            ),
                            title: Text(tx.description, style: AppTypography.body1),
                            subtitle: Text(tx.categoryName, style: AppTypography.caption),
                            trailing: Text(
                              '${tx.transactionType == 'INCOME' ? '+' : '-'}${formatter.format(tx.amount)}',
                              style: AppTypography.body1.copyWith(
                                color: tx.transactionType == 'INCOME' ? AppColors.primaryBlue : AppColors.primaryRed,
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDailyView() {
    return const Center(
      child: Text('일일 보기', style: AppTypography.body1),
    );
  }

  Widget _buildMonthlyView() {
    return const Center(
      child: Text('월별 보기', style: AppTypography.body1),
    );
  }

  Widget _buildSettlementView() {
    return const Center(
      child: Text('결산 보기', style: AppTypography.body1),
    );
  }

  Widget _buildMemoView() {
    return const Center(
      child: Text('메모', style: AppTypography.body1),
    );
  }

  Widget _buildBottomDateBar() {
    final formatter = NumberFormat('#,###');
    final today = DateTime.now();
    final todayTransactions = transactionsByDay[today.day] ?? [];
    
    double todayIncome = 0;
    double todayExpense = 0;
    
    for (var tx in todayTransactions) {
      if (tx.transactionType == 'INCOME') {
        todayIncome += tx.amount;
      } else if (tx.transactionType == 'EXPENSE') {
        todayExpense += tx.amount;
      }
    }
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(
          top: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text(
                '${today.day}',
                style: AppTypography.h4,
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _getWeekdayName(today.weekday),
                  style: AppTypography.caption,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                DateFormat('yyyy.MM', 'ko_KR').format(today),
                style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
          Row(
            children: [
              if (todayIncome > 0) ...[   
                Text(
                  formatter.format(todayIncome),
                  style: AppTypography.body1.copyWith(color: AppColors.primaryBlue),
                ),
                const SizedBox(width: 8),
              ],
              if (todayExpense > 0)
                Text(
                  formatter.format(todayExpense),
                  style: AppTypography.body1.copyWith(color: AppColors.primaryRed),
                ),
            ],
          ),
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

class MonthlySummary {
  final double totalIncome;
  final double totalExpense;
  final double balance;
  final int transactionCount;

  MonthlySummary({
    required this.totalIncome,
    required this.totalExpense,
    required this.balance,
    required this.transactionCount,
  });

  factory MonthlySummary.fromJson(Map<String, dynamic> json) {
    return MonthlySummary(
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
      balance: (json['balance'] ?? 0).toDouble(),
      transactionCount: json['transactionCount'] ?? 0,
    );
  }
}