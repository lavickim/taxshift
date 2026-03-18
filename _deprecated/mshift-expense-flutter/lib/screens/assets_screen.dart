import '../config/api_config.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'dart:convert';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class AssetsScreen extends StatefulWidget {
  const AssetsScreen({Key? key}) : super(key: key);

  @override
  State<AssetsScreen> createState() => _AssetsScreenState();
}

class _AssetsScreenState extends State<AssetsScreen> {
  List<Asset> assets = [];
  double totalBalance = 0;
  bool isLoading = false;
  String get baseUrl => ApiConfig.baseUrl;
  final int userId = 1;

  @override
  void initState() {
    super.initState();
    loadAssets();
  }

  Future<void> loadAssets() async {
    setState(() {
      isLoading = true;
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
          assets = data.map((item) => Asset.fromJson(item)).toList();
          totalBalance = assets.fold(0, (sum, asset) => sum + asset.balance);
        });
      }
    } catch (e) {
      print('Error loading assets: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,###');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '자산',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppColors.textPrimary),
            onPressed: _showAddAssetDialog,
          ),
        ],
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primaryYellow),
            )
          : Column(
              children: [
                // 총 자산 헤더
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: AppColors.cardBackground,
                    border: Border(
                      bottom: BorderSide(color: AppColors.divider, width: 1),
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '총 자산',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        formatter.format(totalBalance),
                        style: AppTypography.h2.copyWith(
                          color: totalBalance >= 0
                              ? AppColors.primaryBlue
                              : AppColors.primaryRed,
                        ),
                      ),
                    ],
                  ),
                ),
                // 자산 목록
                Expanded(
                  child: assets.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: assets.length,
                          itemBuilder: (context, index) {
                            final asset = assets[index];
                            return _buildAssetCard(asset);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildAssetCard(Asset asset) {
    final formatter = NumberFormat('#,###');
    final icon = _getAssetIcon(asset.assetType);
    final color = _getAssetColor(asset.assetType);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider, width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _showAssetDetailDialog(asset),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        asset.assetName,
                        style: AppTypography.body1,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _getAssetTypeName(asset.assetType),
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      formatter.format(asset.balance),
                      style: AppTypography.body1.copyWith(
                        color: asset.balance >= 0
                            ? AppColors.textPrimary
                            : AppColors.primaryRed,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (asset.isDefault)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryYellow.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '기본',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.primaryYellow,
                            fontSize: 10,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.account_balance_wallet,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16),
          Text(
            '등록된 자산이 없습니다',
            style: AppTypography.body1.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: _showAddAssetDialog,
            child: Text(
              '자산 추가하기',
              style: AppTypography.body1.copyWith(
                color: AppColors.primaryYellow,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddAssetDialog() {
    showDialog(
      context: context,
      builder: (context) => _AddAssetDialog(
        onAssetAdded: () {
          loadAssets();
        },
      ),
    );
  }

  void _showAssetDetailDialog(Asset asset) {
    showDialog(
      context: context,
      builder: (context) => _AssetDetailDialog(
        asset: asset,
        onAssetUpdated: loadAssets,
      ),
    );
  }

  IconData _getAssetIcon(String type) {
    switch (type) {
      case 'CASH':
        return Icons.money;
      case 'BANK':
        return Icons.account_balance;
      case 'CARD':
        return Icons.credit_card;
      case 'INVESTMENT':
        return Icons.trending_up;
      default:
        return Icons.account_balance_wallet;
    }
  }

  Color _getAssetColor(String type) {
    switch (type) {
      case 'CASH':
        return AppColors.primaryGreen;
      case 'BANK':
        return AppColors.primaryBlue;
      case 'CARD':
        return AppColors.primaryYellow;
      case 'INVESTMENT':
        return AppColors.primaryRed;
      default:
        return AppColors.textSecondary;
    }
  }

  String _getAssetTypeName(String type) {
    switch (type) {
      case 'CASH':
        return '현금';
      case 'BANK':
        return '은행';
      case 'CARD':
        return '카드';
      case 'INVESTMENT':
        return '투자';
      default:
        return '기타';
    }
  }
}

class Asset {
  final int assetId;
  final String assetName;
  final String assetType;
  final double balance;
  final bool isDefault;

  Asset({
    required this.assetId,
    required this.assetName,
    required this.assetType,
    required this.balance,
    required this.isDefault,
  });

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      assetId: json['assetId'] ?? 0,
      assetName: json['assetName'] ?? '',
      assetType: json['assetType'] ?? '',
      balance: (json['balance'] ?? 0).toDouble(),
      isDefault: json['isDefault'] ?? false,
    );
  }
}

class _AddAssetDialog extends StatefulWidget {
  final VoidCallback onAssetAdded;

  const _AddAssetDialog({required this.onAssetAdded});

  @override
  State<_AddAssetDialog> createState() => _AddAssetDialogState();
}

class _AddAssetDialogState extends State<_AddAssetDialog> {
  final _nameController = TextEditingController();
  final _balanceController = TextEditingController();
  String _selectedType = 'BANK';
  bool _isDefault = false;

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
            Text('자산 추가', style: AppTypography.h5),
            const SizedBox(height: 24),
            TextField(
              controller: _nameController,
              style: AppTypography.body1,
              decoration: InputDecoration(
                labelText: '자산명',
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
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedType,
              dropdownColor: AppColors.cardBackground,
              style: AppTypography.body1,
              decoration: InputDecoration(
                labelText: '자산 유형',
                labelStyle: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              items: const [
                DropdownMenuItem(value: 'CASH', child: Text('현금')),
                DropdownMenuItem(value: 'BANK', child: Text('은행')),
                DropdownMenuItem(value: 'CARD', child: Text('카드')),
                DropdownMenuItem(value: 'INVESTMENT', child: Text('투자')),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedType = value!;
                });
              },
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _balanceController,
              keyboardType: TextInputType.number,
              style: AppTypography.body1,
              decoration: InputDecoration(
                labelText: '초기 잔액',
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
            const SizedBox(height: 16),
            CheckboxListTile(
              value: _isDefault,
              onChanged: (value) {
                setState(() {
                  _isDefault = value!;
                });
              },
              title: Text(
                '기본 자산으로 설정',
                style: AppTypography.body2,
              ),
              controlAffinity: ListTileControlAffinity.leading,
              activeColor: AppColors.primaryYellow,
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
                  onPressed: _saveAsset,
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

  Future<void> _saveAsset() async {
    if (_nameController.text.isEmpty) return;

    try {
      final response = await http.post(
        Uri.parse('' + ApiConfig.baseUrl + '/api/v1/assets'),
        headers: {'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'},
        body: json.encode({
          'userId': 1,
          'assetName': _nameController.text,
          'assetType': _selectedType,
          'balance': double.tryParse(_balanceController.text) ?? 0,
          'isDefault': _isDefault,
        }),
      );

      if (response.statusCode == 201) {
        widget.onAssetAdded();
        Navigator.pop(context);
      }
    } catch (e) {
      print('Error saving asset: $e');
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _balanceController.dispose();
    super.dispose();
  }
}

class _AssetDetailDialog extends StatelessWidget {
  final Asset asset;
  final VoidCallback onAssetUpdated;

  const _AssetDetailDialog({
    required this.asset,
    required this.onAssetUpdated,
  });

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat('#,###');

    return Dialog(
      backgroundColor: AppColors.cardBackground,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getAssetIcon(asset.assetType),
                  color: _getAssetColor(asset.assetType),
                  size: 32,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(asset.assetName, style: AppTypography.h5),
                      Text(
                        _getAssetTypeName(asset.assetType),
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '현재 잔액',
                    style: AppTypography.body1.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    formatter.format(asset.balance),
                    style: AppTypography.h5.copyWith(
                      color: asset.balance >= 0
                          ? AppColors.primaryBlue
                          : AppColors.primaryRed,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    '닫기',
                    style: AppTypography.body1.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getAssetIcon(String type) {
    switch (type) {
      case 'CASH':
        return Icons.money;
      case 'BANK':
        return Icons.account_balance;
      case 'CARD':
        return Icons.credit_card;
      case 'INVESTMENT':
        return Icons.trending_up;
      default:
        return Icons.account_balance_wallet;
    }
  }

  Color _getAssetColor(String type) {
    switch (type) {
      case 'CASH':
        return AppColors.primaryGreen;
      case 'BANK':
        return AppColors.primaryBlue;
      case 'CARD':
        return AppColors.primaryYellow;
      case 'INVESTMENT':
        return AppColors.primaryRed;
      default:
        return AppColors.textSecondary;
    }
  }

  String _getAssetTypeName(String type) {
    switch (type) {
      case 'CASH':
        return '현금';
      case 'BANK':
        return '은행';
      case 'CARD':
        return '카드';
      case 'INVESTMENT':
        return '투자';
      default:
        return '기타';
    }
  }
}