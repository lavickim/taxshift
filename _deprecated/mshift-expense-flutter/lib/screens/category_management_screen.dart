import '../config/api_config.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class CategoryManagementScreen extends StatefulWidget {
  const CategoryManagementScreen({Key? key}) : super(key: key);

  @override
  State<CategoryManagementScreen> createState() => _CategoryManagementScreenState();
}

class _CategoryManagementScreenState extends State<CategoryManagementScreen> 
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Category> _incomeCategories = [];
  List<Category> _expenseCategories = [];
  bool _isLoading = false;
  
  String get baseUrl => ApiConfig.baseUrl;
  final int userId = 1;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadCategories();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/v1/categories?userId=$userId'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _incomeCategories = data
              .map((item) => Category.fromJson(item))
              .where((cat) => cat.categoryType == 'INCOME')
              .toList();
          _expenseCategories = data
              .map((item) => Category.fromJson(item))
              .where((cat) => cat.categoryType == 'EXPENSE')
              .toList();
        });
      }
    } catch (e) {
      print('Error loading categories: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '카테고리 관리',
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppColors.textPrimary),
            onPressed: _showAddCategoryDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            decoration: const BoxDecoration(
              color: AppColors.cardBackground,
              border: Border(
                bottom: BorderSide(color: AppColors.divider, width: 1),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorColor: AppColors.primaryYellow,
              indicatorWeight: 2,
              labelColor: AppColors.textPrimary,
              unselectedLabelColor: AppColors.textTertiary,
              labelStyle: AppTypography.body1,
              tabs: const [
                Tab(text: '수입 카테고리'),
                Tab(text: '지출 카테고리'),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryYellow),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildCategoryList(_incomeCategories, true),
                      _buildCategoryList(_expenseCategories, false),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryList(List<Category> categories, bool isIncome) {
    if (categories.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.category,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              '카테고리가 없습니다',
              style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _showAddCategoryDialog,
              child: Text(
                '카테고리 추가',
                style: AppTypography.body1.copyWith(
                  color: AppColors.primaryYellow,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return ReorderableListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: categories.length,
      onReorder: (oldIndex, newIndex) {
        // 순서 변경 처리
        if (newIndex > oldIndex) newIndex--;
        setState(() {
          final category = categories.removeAt(oldIndex);
          categories.insert(newIndex, category);
        });
        _updateCategoryOrder(categories);
      },
      itemBuilder: (context, index) {
        final category = categories[index];
        return _buildCategoryItem(
          key: ValueKey(category.categoryId),
          category: category,
          isIncome: isIncome,
        );
      },
    );
  }

  Widget _buildCategoryItem({
    required Key key,
    required Category category,
    required bool isIncome,
  }) {
    return Container(
      key: key,
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.divider, width: 1),
      ),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: (isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                .withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getCategoryIcon(category.iconName ?? category.categoryName),
            color: isIncome ? AppColors.primaryBlue : AppColors.primaryRed,
            size: 20,
          ),
        ),
        title: Text(
          category.categoryName,
          style: AppTypography.body1,
        ),
        subtitle: category.isDefault
            ? Text(
                '기본 카테고리',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              )
            : null,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!category.isDefault)
              IconButton(
                icon: const Icon(Icons.edit, color: AppColors.textSecondary, size: 20),
                onPressed: () => _showEditCategoryDialog(category),
              ),
            if (!category.isDefault)
              IconButton(
                icon: const Icon(Icons.delete, color: AppColors.textTertiary, size: 20),
                onPressed: () => _showDeleteConfirmDialog(category),
              ),
            const Icon(Icons.drag_handle, color: AppColors.textTertiary),
          ],
        ),
      ),
    );
  }

  void _showAddCategoryDialog() {
    showDialog(
      context: context,
      builder: (context) => _CategoryDialog(
        isIncome: _tabController.index == 0,
        onSave: (name, type, icon) async {
          await _createCategory(name, type, icon);
          _loadCategories();
        },
      ),
    );
  }

  void _showEditCategoryDialog(Category category) {
    showDialog(
      context: context,
      builder: (context) => _CategoryDialog(
        category: category,
        isIncome: category.categoryType == 'INCOME',
        onSave: (name, type, icon) async {
          await _updateCategory(category.categoryId, name, icon);
          _loadCategories();
        },
      ),
    );
  }

  void _showDeleteConfirmDialog(Category category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: Text('카테고리 삭제', style: AppTypography.h5),
        content: Text(
          '${category.categoryName} 카테고리를 삭제하시겠습니까?',
          style: AppTypography.body1,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              '취소',
              style: AppTypography.body1.copyWith(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _deleteCategory(category.categoryId);
              _loadCategories();
            },
            child: Text(
              '삭제',
              style: AppTypography.body1.copyWith(color: AppColors.primaryRed),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _createCategory(String name, String type, String? icon) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/v1/categories'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
        body: json.encode({
          'userId': userId,
          'categoryName': name,
          'categoryType': type,
          'iconName': icon,
          'isDefault': false,
        }),
      );

      if (response.statusCode != 201) {
        throw Exception('Failed to create category');
      }
    } catch (e) {
      print('Error creating category: $e');
    }
  }

  Future<void> _updateCategory(int categoryId, String name, String? icon) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/api/v1/categories/$categoryId'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
        body: json.encode({
          'categoryName': name,
          'iconName': icon,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update category');
      }
    } catch (e) {
      print('Error updating category: $e');
    }
  }

  Future<void> _deleteCategory(int categoryId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/api/v1/categories/$categoryId'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
      );

      if (response.statusCode != 204) {
        throw Exception('Failed to delete category');
      }
    } catch (e) {
      print('Error deleting category: $e');
    }
  }

  Future<void> _updateCategoryOrder(List<Category> categories) async {
    // 카테고리 순서 업데이트 API 호출
  }

  IconData _getCategoryIcon(String name) {
    switch (name) {
      case '식비':
      case 'food':
        return Icons.restaurant;
      case '교통':
      case 'transport':
        return Icons.directions_car;
      case '문화':
      case 'entertainment':
        return Icons.movie;
      case '쇼핑':
      case 'shopping':
        return Icons.shopping_bag;
      case '의료':
      case 'medical':
        return Icons.local_hospital;
      case '교육':
      case 'education':
        return Icons.school;
      case '급여':
      case 'salary':
        return Icons.account_balance_wallet;
      case '용돈':
      case 'allowance':
        return Icons.card_giftcard;
      case '투자':
      case 'investment':
        return Icons.trending_up;
      default:
        return Icons.category;
    }
  }
}

class Category {
  final int categoryId;
  final String categoryName;
  final String categoryType;
  final String? iconName;
  final bool isDefault;
  final int displayOrder;

  Category({
    required this.categoryId,
    required this.categoryName,
    required this.categoryType,
    this.iconName,
    required this.isDefault,
    required this.displayOrder,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      categoryId: json['categoryId'],
      categoryName: json['categoryName'],
      categoryType: json['categoryType'],
      iconName: json['iconName'],
      isDefault: json['isDefault'] ?? false,
      displayOrder: json['displayOrder'] ?? 0,
    );
  }
}

class _CategoryDialog extends StatefulWidget {
  final Category? category;
  final bool isIncome;
  final Function(String name, String type, String? icon) onSave;

  const _CategoryDialog({
    this.category,
    required this.isIncome,
    required this.onSave,
  });

  @override
  State<_CategoryDialog> createState() => _CategoryDialogState();
}

class _CategoryDialogState extends State<_CategoryDialog> {
  late TextEditingController _nameController;
  String? _selectedIcon;
  
  final List<String> _availableIcons = [
    'food', 'transport', 'entertainment', 'shopping',
    'medical', 'education', 'salary', 'allowance',
    'investment', 'home', 'beauty', 'sports',
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.category?.categoryName);
    _selectedIcon = widget.category?.iconName;
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.cardBackground,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.category == null ? '카테고리 추가' : '카테고리 수정',
              style: AppTypography.h5,
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _nameController,
              style: AppTypography.body1,
              decoration: InputDecoration(
                labelText: '카테고리명',
                labelStyle: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
                enabledBorder: const UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.divider),
                ),
                focusedBorder: const UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primaryYellow),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              '아이콘 선택',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _availableIcons.map((icon) {
                final isSelected = _selectedIcon == icon;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedIcon = icon;
                    });
                  },
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                              .withOpacity(0.2)
                          : AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected
                            ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                            : AppColors.divider,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Icon(
                      _getIconData(icon),
                      color: isSelected
                          ? (widget.isIncome ? AppColors.primaryBlue : AppColors.primaryRed)
                          : AppColors.textSecondary,
                      size: 20,
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    '취소',
                    style: AppTypography.body1.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: () {
                    if (_nameController.text.isNotEmpty) {
                      widget.onSave(
                        _nameController.text,
                        widget.isIncome ? 'INCOME' : 'EXPENSE',
                        _selectedIcon,
                      );
                      Navigator.pop(context);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryYellow,
                  ),
                  child: Text(
                    '저장',
                    style: AppTypography.body1.copyWith(color: Colors.black),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconData(String icon) {
    switch (icon) {
      case 'food':
        return Icons.restaurant;
      case 'transport':
        return Icons.directions_car;
      case 'entertainment':
        return Icons.movie;
      case 'shopping':
        return Icons.shopping_bag;
      case 'medical':
        return Icons.local_hospital;
      case 'education':
        return Icons.school;
      case 'salary':
        return Icons.account_balance_wallet;
      case 'allowance':
        return Icons.card_giftcard;
      case 'investment':
        return Icons.trending_up;
      case 'home':
        return Icons.home;
      case 'beauty':
        return Icons.face;
      case 'sports':
        return Icons.sports;
      default:
        return Icons.category;
    }
  }
}