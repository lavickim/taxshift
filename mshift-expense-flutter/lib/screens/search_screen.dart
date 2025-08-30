import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();
  final String baseUrl = 'http://10.0.2.2:8090';
  final int userId = 1;
  
  List<Transaction> searchResults = [];
  List<Transaction> recentTransactions = [];
  List<String> recentSearches = [];
  bool isLoading = false;
  bool hasSearched = false;
  
  String? selectedCategory;
  String? selectedTransactionType;
  DateTime? startDate;
  DateTime? endDate;
  double? minAmount;
  double? maxAmount;
  
  bool showFilters = false;
  
  final List<String> categories = [
    '전체',
    '식비',
    '교통',
    '문화',
    '쇼핑',
    '의료',
    '교육',
    '통신',
    '주거',
    '금융',
    '기타',
  ];
  
  final List<String> transactionTypes = [
    '전체',
    '수입',
    '지출',
    '이체',
  ];

  @override
  void initState() {
    super.initState();
    loadRecentTransactions();
    _searchFocus.requestFocus();
  }

  Future<void> loadRecentTransactions() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/transactions/recent?userId=$userId&limit=10'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          recentTransactions = data.map((item) => Transaction.fromJson(item)).toList();
        });
      }
    } catch (e) {
      print('Error loading recent transactions: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> searchTransactions() async {
    if (_searchController.text.isEmpty && !hasActiveFilters()) {
      return;
    }

    setState(() {
      isLoading = true;
      hasSearched = true;
    });

    try {
      // Build query parameters
      final queryParams = <String, String>{
        'userId': userId.toString(),
      };
      
      if (_searchController.text.isNotEmpty) {
        queryParams['keyword'] = _searchController.text;
        // Add to recent searches
        if (!recentSearches.contains(_searchController.text)) {
          recentSearches.insert(0, _searchController.text);
          if (recentSearches.length > 5) {
            recentSearches.removeLast();
          }
        }
      }
      
      if (selectedCategory != null && selectedCategory != '전체') {
        queryParams['category'] = selectedCategory!;
      }
      
      if (selectedTransactionType != null && selectedTransactionType != '전체') {
        String type = selectedTransactionType == '수입' ? 'INCOME' : 
                     selectedTransactionType == '지출' ? 'EXPENSE' : 'TRANSFER';
        queryParams['type'] = type;
      }
      
      if (startDate != null) {
        queryParams['startDate'] = DateFormat('yyyy-MM-dd').format(startDate!);
      }
      
      if (endDate != null) {
        queryParams['endDate'] = DateFormat('yyyy-MM-dd').format(endDate!);
      }
      
      if (minAmount != null) {
        queryParams['minAmount'] = minAmount.toString();
      }
      
      if (maxAmount != null) {
        queryParams['maxAmount'] = maxAmount.toString();
      }
      
      final uri = Uri.parse('$baseUrl/api/v1/transactions/search')
          .replace(queryParameters: queryParams);
      
      final response = await http.get(
        uri,
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          searchResults = data.map((item) => Transaction.fromJson(item)).toList();
        });
      }
    } catch (e) {
      print('Error searching transactions: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  bool hasActiveFilters() {
    return selectedCategory != null && selectedCategory != '전체' ||
           selectedTransactionType != null && selectedTransactionType != '전체' ||
           startDate != null ||
           endDate != null ||
           minAmount != null ||
           maxAmount != null;
  }

  void clearFilters() {
    setState(() {
      selectedCategory = null;
      selectedTransactionType = null;
      startDate = null;
      endDate = null;
      minAmount = null;
      maxAmount = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '검색',
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (hasActiveFilters())
            TextButton(
              onPressed: () {
                clearFilters();
                searchTransactions();
              },
              child: Text(
                '필터 초기화',
                style: AppTypography.caption.copyWith(
                  color: AppColors.primaryYellow,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.cardBackground,
            child: Column(
              children: [
                // Search input
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        child: Icon(Icons.search, color: AppColors.textSecondary),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          focusNode: _searchFocus,
                          style: AppTypography.body1,
                          decoration: const InputDecoration(
                            hintText: '거래 내역 검색',
                            hintStyle: TextStyle(color: AppColors.textTertiary),
                            border: InputBorder.none,
                          ),
                          onSubmitted: (_) => searchTransactions(),
                        ),
                      ),
                      if (_searchController.text.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.clear, color: AppColors.textSecondary),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              searchResults.clear();
                              hasSearched = false;
                            });
                          },
                        ),
                      IconButton(
                        icon: Icon(
                          showFilters ? Icons.filter_alt : Icons.filter_alt_outlined,
                          color: hasActiveFilters() ? AppColors.primaryYellow : AppColors.textSecondary,
                        ),
                        onPressed: () {
                          setState(() {
                            showFilters = !showFilters;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                // Filters
                if (showFilters) ...[
                  const SizedBox(height: 16),
                  _buildFilters(),
                ],
              ],
            ),
          ),
          // Recent searches
          if (!hasSearched && recentSearches.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '최근 검색',
                    style: AppTypography.body2.copyWith(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: recentSearches.map((search) {
                      return ActionChip(
                        label: Text(search),
                        labelStyle: AppTypography.caption,
                        backgroundColor: AppColors.surface,
                        onPressed: () {
                          _searchController.text = search;
                          searchTransactions();
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          // Results
          Expanded(
            child: isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryYellow),
                  )
                : hasSearched
                    ? _buildSearchResults()
                    : _buildRecentTransactions(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      children: [
        // Category filter
        SizedBox(
          height: 40,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              final isSelected = selectedCategory == category;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(category),
                  labelStyle: AppTypography.caption.copyWith(
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  selected: isSelected,
                  selectedColor: AppColors.primaryYellow,
                  backgroundColor: AppColors.surface,
                  onSelected: (selected) {
                    setState(() {
                      selectedCategory = selected ? category : null;
                    });
                  },
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        // Transaction type filter
        Row(
          children: [
            Text(
              '거래 유형:',
              style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(width: 8),
            ...transactionTypes.map((type) {
              final isSelected = selectedTransactionType == type;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(type),
                  labelStyle: AppTypography.caption.copyWith(
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  selected: isSelected,
                  selectedColor: type == '수입' ? AppColors.primaryBlue :
                                type == '지출' ? AppColors.primaryRed :
                                type == '이체' ? AppColors.textSecondary :
                                AppColors.primaryYellow,
                  backgroundColor: AppColors.surface,
                  onSelected: (selected) {
                    setState(() {
                      selectedTransactionType = selected ? type : null;
                    });
                  },
                ),
              );
            }).toList(),
          ],
        ),
        const SizedBox(height: 12),
        // Date range filter
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: startDate ?? DateTime.now(),
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
                      startDate = picked;
                    });
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 8),
                      Text(
                        startDate != null
                            ? DateFormat('yyyy.MM.dd').format(startDate!)
                            : '시작일',
                        style: AppTypography.caption.copyWith(
                          color: startDate != null ? AppColors.textPrimary : AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Text('~', style: TextStyle(color: AppColors.textSecondary)),
            ),
            Expanded(
              child: InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: endDate ?? DateTime.now(),
                    firstDate: startDate ?? DateTime(2020),
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
                      endDate = picked;
                    });
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 8),
                      Text(
                        endDate != null
                            ? DateFormat('yyyy.MM.dd').format(endDate!)
                            : '종료일',
                        style: AppTypography.caption.copyWith(
                          color: endDate != null ? AppColors.textPrimary : AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Search button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: searchTransactions,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryYellow,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('검색', style: AppTypography.body1),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchResults() {
    if (searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              '검색 결과가 없습니다',
              style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: searchResults.length,
      itemBuilder: (context, index) {
        final transaction = searchResults[index];
        return _buildTransactionItem(transaction);
      },
    );
  }

  Widget _buildRecentTransactions() {
    if (recentTransactions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.history,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              '최근 거래 내역이 없습니다',
              style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          '최근 거래',
          style: AppTypography.h5,
        ),
        const SizedBox(height: 16),
        ...recentTransactions.map((transaction) => _buildTransactionItem(transaction)).toList(),
      ],
    );
  }

  Widget _buildTransactionItem(Transaction transaction) {
    final formatter = NumberFormat('#,###');
    final isIncome = transaction.transactionType == 'INCOME';
    final isTransfer = transaction.transactionType == 'TRANSFER';
    final color = isIncome ? AppColors.primaryBlue : 
                  isTransfer ? AppColors.textSecondary : AppColors.primaryRed;
    final sign = isIncome ? '+' : isTransfer ? '' : '-';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
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
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getCategoryIcon(transaction.categoryName),
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  transaction.description,
                  style: AppTypography.body1,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      DateFormat('MM/dd').format(transaction.transactionDate),
                      style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                    ),
                    if (transaction.categoryName.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          transaction.categoryName,
                          style: AppTypography.caption.copyWith(fontSize: 10),
                        ),
                      ),
                    ],
                    if (transaction.assetName.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Text(
                        transaction.assetName,
                        style: AppTypography.caption.copyWith(color: AppColors.textTertiary),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          Text(
            '$sign${formatter.format(transaction.amount)}',
            style: AppTypography.body1.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
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
      case '이체':
        return Icons.swap_horiz;
      default:
        return Icons.category;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }
}

class Transaction {
  final int transactionId;
  final String transactionType;
  final double amount;
  final String description;
  final String categoryName;
  final String assetName;
  final DateTime transactionDate;
  final String? memo;

  Transaction({
    required this.transactionId,
    required this.transactionType,
    required this.amount,
    required this.description,
    required this.categoryName,
    required this.assetName,
    required this.transactionDate,
    this.memo,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      transactionId: json['transactionId'] ?? 0,
      transactionType: json['transactionType'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      description: json['description'] ?? '',
      categoryName: json['categoryName'] ?? '',
      assetName: json['assetName'] ?? '',
      transactionDate: DateTime.parse(json['transactionDate'] ?? DateTime.now().toIso8601String()),
      memo: json['memo'],
    );
  }
}