import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const CustomAppBar(
        title: '더보기',
        showBackButton: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection(
            title: '관리',
            items: [
              _MenuItem(
                icon: Icons.category,
                title: '카테고리 관리',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.label,
                title: '태그 관리',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.repeat,
                title: '반복 거래',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: '데이터',
            items: [
              _MenuItem(
                icon: Icons.backup,
                title: '백업 및 복원',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.download,
                title: '데이터 내보내기',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.upload,
                title: '데이터 가져오기',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: '설정',
            items: [
              _MenuItem(
                icon: Icons.notifications,
                title: '알림 설정',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.lock,
                title: '보안 설정',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.palette,
                title: '테마 설정',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.language,
                title: '언어 설정',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: '정보',
            items: [
              _MenuItem(
                icon: Icons.help,
                title: '도움말',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.privacy_tip,
                title: '개인정보 처리방침',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.description,
                title: '이용약관',
                onTap: () {},
              ),
              _MenuItem(
                icon: Icons.info,
                title: '앱 정보',
                subtitle: '버전 1.0.0',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            child: ElevatedButton(
              onPressed: () {
                // 로그아웃 처리
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.cardBackground,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                '로그아웃',
                style: AppTypography.body1.copyWith(
                  color: AppColors.primaryRed,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> items,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: items,
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppColors.divider, width: 0.5),
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: AppColors.textSecondary,
                size: 24,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.body1,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppColors.textTertiary,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}