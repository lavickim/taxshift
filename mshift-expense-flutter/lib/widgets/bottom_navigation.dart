import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';

class BottomNavigation extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.divider,
            width: 1,
          ),
        ),
      ),
      child: BottomNavigationBar(
        backgroundColor: AppColors.background,
        type: BottomNavigationBarType.fixed,
        currentIndex: currentIndex,
        onTap: onTap,
        selectedItemColor: AppColors.primaryYellow,
        unselectedItemColor: AppColors.textTertiary,
        selectedLabelStyle: AppTypography.caption,
        unselectedLabelStyle: AppTypography.caption,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today, size: 24),
            label: '가계부',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.pie_chart, size: 24),
            label: '통계',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline, size: 24),
            label: '커뮤니티',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet, size: 24),
            label: '자산',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.more_horiz, size: 24),
            label: '더보기',
          ),
        ],
      ),
    );
  }
}