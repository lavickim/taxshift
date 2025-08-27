import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({Key? key}) : super(key: key);

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late PageController _pageController;
  DateTime _selectedMonth = DateTime.now();
  DateTime _today = DateTime.now();
  Map<String, List<Transaction>> _transactionsByDate = {};
  bool _isLoading = false;
  
  // 충분히 큰 값으로 시작 (앞뒤로 100년씩 스크롤 가능)
  static const int _initialPage = 1200;
  
  final String baseUrl = 'http://10.0.2.2:8090';
  final int userId = 1;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _initialPage);
    _loadTransactions();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final year = _selectedMonth.year;
      final month = _selectedMonth.month;
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/monthly/$year/$month?userId=$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final transactions = data.map((tx) => Transaction.fromJson(tx)).toList();
        
        setState(() {
          _transactionsByDate = {};
          for (var tx in transactions) {
            final dateKey = DateFormat('yyyy-MM-dd').format(tx.transactionDate);
            if (!_transactionsByDate.containsKey(dateKey)) {
              _transactionsByDate[dateKey] = [];
            }
            _transactionsByDate[dateKey]!.add(tx);
          }
        });
      }
    } catch (e) {
      print('Error loading transactions: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // 특정 월로 이동하는 애니메이션
  void _jumpToMonth(DateTime targetMonth) {
    final monthsDiff = (targetMonth.year - _today.year) * 12 + 
                       (targetMonth.month - _today.month);
    _pageController.animateToPage(
      _initialPage + monthsDiff,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  // 페이지 인덱스에서 실제 날짜 계산
  DateTime _getMonthFromPageIndex(int pageIndex) {
    final monthOffset = pageIndex - _initialPage;
    return DateTime(_today.year, _today.month + monthOffset, 1);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildWeekdayHeaders(),
          Expanded(
            child: _buildCalendarPageView(),
          ),
        ],
      ),
    );
  }

  AppBar _buildAppBar() {
    final formatter = DateFormat('yyyy년 M월', 'ko_KR');
    
    return AppBar(
      backgroundColor: AppColors.background,
      elevation: 0,
      centerTitle: true,
      title: GestureDetector(
        onTap: () => _jumpToMonth(DateTime.now()),
        child: Text(
          formatter.format(_selectedMonth),
          style: AppTypography.h4,
        ),
      ),
      leading: IconButton(
        icon: const Icon(Icons.chevron_left, color: AppColors.textPrimary),
        onPressed: () {
          _pageController.previousPage(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
        },
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.chevron_right, color: AppColors.textPrimary),
          onPressed: () {
            _pageController.nextPage(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.today, color: AppColors.textPrimary),
          onPressed: () => _jumpToMonth(DateTime.now()),
        ),
      ],
    );
  }

  Widget _buildWeekdayHeaders() {
    final weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    
    return Container(
      height: 40,
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: Row(
        children: weekDays.map((day) {
          return Expanded(
            child: Center(
              child: Text(
                day,
                style: AppTypography.caption.copyWith(
                  color: day == '일' ? AppColors.primaryRed :
                         day == '토' ? AppColors.primaryBlue :
                         AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCalendarPageView() {
    return PageView.builder(
      controller: _pageController,
      onPageChanged: (index) {
        final newMonth = _getMonthFromPageIndex(index);
        setState(() {
          _selectedMonth = newMonth;
        });
        _loadTransactions();
      },
      itemBuilder: (context, pageIndex) {
        final displayMonth = _getMonthFromPageIndex(pageIndex);
        return _buildMonthGrid(displayMonth);
      },
    );
  }

  Widget _buildMonthGrid(DateTime month) {
    // 월의 첫날과 마지막날 계산
    final firstDay = DateTime(month.year, month.month, 1);
    final lastDay = DateTime(month.year, month.month + 1, 0);
    final daysInMonth = lastDay.day;
    
    // 첫날의 요일 (0=일요일, 6=토요일)
    final firstWeekday = firstDay.weekday % 7;
    
    // 이전 달의 마지막 날들
    final prevMonthLastDay = DateTime(month.year, month.month, 0);
    final daysFromPrevMonth = firstWeekday;
    
    // 전체 그리드에 표시할 날짜들 생성
    List<CalendarDay> calendarDays = [];
    
    // 이전 달 날짜들
    for (int i = daysFromPrevMonth - 1; i >= 0; i--) {
      final day = prevMonthLastDay.day - i;
      calendarDays.add(CalendarDay(
        date: DateTime(prevMonthLastDay.year, prevMonthLastDay.month, day),
        isCurrentMonth: false,
        isPrevMonth: true,
      ));
    }
    
    // 현재 달 날짜들
    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(month.year, month.month, day);
      calendarDays.add(CalendarDay(
        date: date,
        isCurrentMonth: true,
        isPrevMonth: false,
      ));
    }
    
    // 다음 달 날짜들 (42개 = 6주를 채우기 위해)
    final remainingDays = 42 - calendarDays.length;
    for (int day = 1; day <= remainingDays; day++) {
      calendarDays.add(CalendarDay(
        date: DateTime(month.year, month.month + 1, day),
        isCurrentMonth: false,
        isPrevMonth: false,
      ));
    }
    
    return GridView.builder(
      padding: const EdgeInsets.all(8),
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        childAspectRatio: 0.9,
        crossAxisSpacing: 4,
        mainAxisSpacing: 4,
      ),
      itemCount: 42,
      itemBuilder: (context, index) {
        final calendarDay = calendarDays[index];
        return _buildDayCell(calendarDay);
      },
    );
  }

  Widget _buildDayCell(CalendarDay calendarDay) {
    final dateKey = DateFormat('yyyy-MM-dd').format(calendarDay.date);
    final transactions = _transactionsByDate[dateKey] ?? [];
    
    double income = 0;
    double expense = 0;
    for (var tx in transactions) {
      if (tx.transactionType == 'INCOME') {
        income += tx.amount;
      } else if (tx.transactionType == 'EXPENSE') {
        expense += tx.amount;
      }
    }
    
    final isToday = _isToday(calendarDay.date);
    final isWeekend = calendarDay.date.weekday == 7 || calendarDay.date.weekday == 6;
    
    return GestureDetector(
      onTap: () {
        if (!calendarDay.isCurrentMonth) {
          // 이전/다음 달로 이동
          _jumpToMonth(calendarDay.date);
        } else if (transactions.isNotEmpty) {
          // 거래 상세 보기
          _showTransactionDetails(calendarDay.date, transactions);
        } else {
          // 새 거래 추가
          _addNewTransaction(calendarDay.date);
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: isToday 
              ? AppColors.primaryYellow.withOpacity(0.2)
              : calendarDay.isCurrentMonth 
                  ? AppColors.cardBackground 
                  : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: isToday 
              ? Border.all(color: AppColors.primaryYellow, width: 2)
              : null,
        ),
        padding: const EdgeInsets.all(4),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              '${calendarDay.date.day}',
              style: AppTypography.caption.copyWith(
                color: !calendarDay.isCurrentMonth 
                    ? AppColors.textTertiary
                    : isToday 
                        ? AppColors.primaryYellow
                        : isWeekend && calendarDay.date.weekday == 7
                            ? AppColors.primaryRed
                            : isWeekend && calendarDay.date.weekday == 6
                                ? AppColors.primaryBlue
                                : AppColors.textPrimary,
                fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (calendarDay.isCurrentMonth) ...[
              const SizedBox(height: 2),
              if (income > 0)
                Text(
                  '+${_formatAmount(income)}',
                  style: const TextStyle(
                    color: AppColors.primaryBlue,
                    fontSize: 9,
                  ),
                ),
              if (expense > 0)
                Text(
                  '-${_formatAmount(expense)}',
                  style: const TextStyle(
                    color: AppColors.primaryRed,
                    fontSize: 9,
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && 
           date.month == now.month && 
           date.day == now.day;
  }

  String _formatAmount(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(0)}k';
    }
    return amount.toStringAsFixed(0);
  }

  void _showTransactionDetails(DateTime date, List<Transaction> transactions) {
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
                    DateFormat('yyyy년 M월 d일 (E)', 'ko_KR').format(date),
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
                  Column(
                    children: [
                      Text('합계', style: AppTypography.caption),
                      Text(
                        formatter.format(totalIncome - totalExpense),
                        style: AppTypography.body1.copyWith(
                          color: (totalIncome - totalExpense) >= 0 
                              ? AppColors.primaryBlue 
                              : AppColors.primaryRed,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.builder(
                  itemCount: transactions.length,
                  itemBuilder: (context, index) {
                    final tx = transactions[index];
                    return ListTile(
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: (tx.transactionType == 'INCOME' 
                              ? AppColors.primaryBlue 
                              : AppColors.primaryRed).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          tx.transactionType == 'INCOME' 
                              ? Icons.add_circle 
                              : Icons.remove_circle,
                          color: tx.transactionType == 'INCOME' 
                              ? AppColors.primaryBlue 
                              : AppColors.primaryRed,
                          size: 20,
                        ),
                      ),
                      title: Text(tx.description, style: AppTypography.body1),
                      subtitle: Text(
                        '${tx.categoryName} • ${tx.assetName ?? ""}',
                        style: AppTypography.caption,
                      ),
                      trailing: Text(
                        '${tx.transactionType == 'INCOME' ? '+' : '-'}${formatter.format(tx.amount)}',
                        style: AppTypography.body1.copyWith(
                          color: tx.transactionType == 'INCOME' 
                              ? AppColors.primaryBlue 
                              : AppColors.primaryRed,
                          fontWeight: FontWeight.bold,
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

  void _addNewTransaction(DateTime date) {
    // TODO: Navigate to add transaction screen with selected date
    print('Add new transaction for $date');
  }
}

class CalendarDay {
  final DateTime date;
  final bool isCurrentMonth;
  final bool isPrevMonth;

  CalendarDay({
    required this.date,
    required this.isCurrentMonth,
    required this.isPrevMonth,
  });
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