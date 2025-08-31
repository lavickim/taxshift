import 'package:flutter/material.dart';
import '../widgets/bottom_navigation.dart';
import '../widgets/dual_floating_buttons.dart';
import '../utils/animations.dart';
import 'home_screen.dart';
import 'statistics_screen.dart';
import 'challenge_list_screen.dart';
import 'community_feed_screen.dart';
import 'assets_screen.dart';
import 'more_screen.dart';
import 'add_transaction_screen.dart';
import 'add_transfer_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    const HomeScreen(),
    const StatisticsScreen(),
    const ChallengeListScreen(),
    const CommunityFeedScreen(),
    const AssetsScreen(),
    const MoreScreen(),
  ];

  void _navigateToAddTransaction(bool isIncome) {
    Navigator.push(
      context,
      ScalePageRoute(
        page: AddTransactionScreen(
          isIncome: isIncome,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigation(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      floatingActionButton: _currentIndex == 0
          ? DualFloatingButtons(
              onIncomePressed: () => _navigateToAddTransaction(true),
              onExpensePressed: () => _navigateToAddTransaction(false),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}