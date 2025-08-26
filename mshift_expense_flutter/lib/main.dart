import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'dart:convert';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ko_KR', null);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '편한가계부',
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.black,
        primaryColor: Colors.black,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.black,
          selectedItemColor: Colors.red,
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Colors.white),
          titleLarge: TextStyle(color: Colors.white),
        ),
      ),
      home: const ExpenseTrackerHome(),
    );
  }
}

class Transaction {
  final int transactionId;
  final String description;
  final double amount;
  final String categoryName;
  final DateTime transactionDate;
  final String transactionType;
  final String assetName;

  Transaction({
    required this.transactionId,
    required this.description,
    required this.amount,
    required this.categoryName,
    required this.transactionDate,
    required this.transactionType,
    required this.assetName,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      transactionId: json['transactionId'] ?? 0,
      description: json['description'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      categoryName: json['categoryName'] ?? '',
      transactionDate: DateTime.parse(json['transactionDate'] ?? DateTime.now().toString().split(' ')[0]),
      transactionType: json['transactionType'] ?? '',
      assetName: json['assetName'] ?? '',
    );
  }
}

class MonthlySummary {
  final double totalIncome;
  final double totalExpense;
  final double balance;
  final int transactionCount;
  final String month;

  MonthlySummary({
    required this.totalIncome,
    required this.totalExpense,
    required this.balance,
    required this.transactionCount,
    required this.month,
  });

  factory MonthlySummary.fromJson(Map<String, dynamic> json) {
    return MonthlySummary(
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
      balance: (json['balance'] ?? 0).toDouble(),
      transactionCount: json['transactionCount'] ?? 0,
      month: json['month'] ?? '',
    );
  }
}

class ExpenseTrackerHome extends StatefulWidget {
  const ExpenseTrackerHome({super.key});

  @override
  State<ExpenseTrackerHome> createState() => _ExpenseTrackerHomeState();
}

class _ExpenseTrackerHomeState extends State<ExpenseTrackerHome> {
  DateTime selectedDate = DateTime.now();
  List<Transaction> transactions = [];
  MonthlySummary? monthlySummary;
  bool isLoading = false;
  final String baseUrl = 'http://10.0.2.2:8090';
  final int userId = 1;
  int _selectedTabIndex = 1; // 달력 탭을 기본으로 선택
  int _selectedBottomIndex = 0;

  final List<String> _topTabs = ['일일', '달력', '월별', '결산', '메모'];
  final List<String> _bottomTabs = ['가계부', '통계', '자산', '더보기'];
  final List<IconData> _bottomIcons = [
    Icons.book_outlined,
    Icons.bar_chart_outlined, 
    Icons.account_balance_wallet_outlined,
    Icons.more_horiz
  ];

  @override
  void initState() {
    super.initState();
    loadData();
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
      final dateStr = '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-01';
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/monthly?userId=$userId&date=$dateStr'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as List;
        setState(() {
          transactions = data.map((tx) => Transaction.fromJson(tx)).toList();
        });
      } else {
        print('Failed to load transactions: ${response.statusCode}');
      }
    } catch (e) {
      print('Error loading transactions: $e');
    }
  }

  Future<void> loadMonthlySummary() async {
    try {
      final dateStr = '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-01';
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/monthly/summary?userId=$userId&date=$dateStr'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          monthlySummary = MonthlySummary.fromJson(data);
        });
      } else {
        print('Failed to load monthly summary: ${response.statusCode}');
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
    final formatter = NumberFormat('#,###');
    final monthFormatter = DateFormat('yyyy년 M월', 'ko');
    
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left, color: Colors.white, size: 28),
              onPressed: () => changeMonth(-1),
            ),
            Text(
              monthFormatter.format(selectedDate),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.normal,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right, color: Colors.white, size: 28),
              onPressed: () => changeMonth(1),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.mail_outline, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.star_outline, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // 상단 탭 메뉴
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: _topTabs.asMap().entries.map((entry) {
                int index = entry.key;
                String tab = entry.value;
                bool isSelected = index == _selectedTabIndex;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedTabIndex = index;
                    });
                  },
                  child: Column(
                    children: [
                      Text(
                        tab,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey,
                          fontSize: 16,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      const SizedBox(height: 4),
                      if (isSelected)
                        Container(
                          height: 2,
                          width: 30,
                          color: Colors.red,
                        )
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          
          // 수입/지출/합계 표시
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  children: [
                    const Text(
                      '수입',
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    Text(
                      monthlySummary != null 
                          ? formatter.format(monthlySummary!.totalIncome)
                          : '0',
                      style: const TextStyle(
                        color: Colors.blue,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Column(
                  children: [
                    const Text(
                      '지출',
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    Text(
                      monthlySummary != null 
                          ? formatter.format(monthlySummary!.totalExpense)
                          : '36,900',
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Column(
                  children: [
                    const Text(
                      '합계',
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    Text(
                      monthlySummary != null 
                          ? '${formatter.format(monthlySummary!.balance)}'
                          : '-36,900',
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // 캘린더 그리드
          Expanded(
            child: _selectedTabIndex == 1 ? _buildCalendarGrid() : _buildEmptyState(),
          ),
          
          // 하단 날짜 및 수입/지출 표시
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      '${DateTime.now().day}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[800],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _getWeekdayName(DateTime.now().weekday),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('yyyy.MM', 'ko').format(selectedDate),
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    const Text(
                      '0원',
                      style: TextStyle(
                        color: Colors.blue,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Text(
                      '0원',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.list,
                      color: Colors.white,
                      size: 20,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black,
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedBottomIndex,
        onTap: (index) {
          setState(() {
            _selectedBottomIndex = index;
          });
        },
        items: _bottomTabs.asMap().entries.map((entry) {
          int index = entry.key;
          String label = entry.value;
          return BottomNavigationBarItem(
            icon: Icon(_bottomIcons[index]),
            label: label,
          );
        }).toList(),
        selectedItemColor: Colors.red,
        unselectedItemColor: Colors.grey,
      ),
      floatingActionButton: Stack(
        children: [
          Positioned(
            bottom: 16,
            right: 80,
            child: FloatingActionButton(
              backgroundColor: Colors.grey[800],
              onPressed: () {},
              child: const Icon(Icons.add, color: Colors.white),
            ),
          ),
          Positioned(
            bottom: 16,
            right: 16,
            child: FloatingActionButton(
              backgroundColor: Colors.red,
              onPressed: () {},
              child: const Icon(Icons.add, color: Colors.white),
            ),
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
  
  String _getWeekdayName(int weekday) {
    const weekdays = ['', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    return weekdays[weekday];
  }
  
  Widget _buildCalendarGrid() {
    final daysInMonth = DateTime(selectedDate.year, selectedDate.month + 1, 0).day;
    final firstDayOfMonth = DateTime(selectedDate.year, selectedDate.month, 1);
    final firstWeekday = firstDayOfMonth.weekday % 7; // 0: 일요일, 1: 월요일, ...
    
    final weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    
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
                style: TextStyle(
                  color: day == '일' ? Colors.red : (day == '토' ? Colors.blue : Colors.grey),
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              );
            }).toList(),
          ),
        ),
        // 캘린더 그리드
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(8),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 1,
            ),
            itemCount: 42, // 6주 * 7일
            itemBuilder: (context, index) {
              final dayNumber = index - firstWeekday + 1;
              final isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
              final isToday = isCurrentMonth && dayNumber == DateTime.now().day && 
                             selectedDate.month == DateTime.now().month &&
                             selectedDate.year == DateTime.now().year;
              
              return Container(
                margin: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: isToday ? Colors.red.withOpacity(0.3) : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: isCurrentMonth
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              dayNumber.toString(),
                              style: TextStyle(
                                color: isToday ? Colors.white : Colors.grey[300],
                                fontSize: 16,
                                fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            if (dayNumber == 1) // 8.1 표시 예시
                              const Text(
                                '8.1',
                                style: TextStyle(
                                  color: Colors.blue,
                                  fontSize: 10,
                                ),
                              ),
                          ],
                        )
                      : null,
                ),
              );
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long,
            size: 64,
            color: Colors.grey,
          ),
          SizedBox(height: 16),
          Text(
            '데이터가 없습니다.',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
}