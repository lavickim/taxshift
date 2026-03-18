import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../screens/add_transfer_screen.dart';

class DualFloatingButtons extends StatefulWidget {
  final VoidCallback onIncomePressed;
  final VoidCallback onExpensePressed;

  const DualFloatingButtons({
    Key? key,
    required this.onIncomePressed,
    required this.onExpensePressed,
  }) : super(key: key);

  @override
  State<DualFloatingButtons> createState() => _DualFloatingButtonsState();
}

class _DualFloatingButtonsState extends State<DualFloatingButtons> 
    with SingleTickerProviderStateMixin {
  bool isExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      isExpanded = !isExpanded;
      if (isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  void _navigateToTransfer() {
    _toggleExpanded();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AddTransferScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.bottomRight,
      children: [
        // 이체 버튼
        AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, -210 * _animation.value),
              child: Opacity(
                opacity: _animation.value,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.cardBackground,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        '이체',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: 'transfer',
                      onPressed: _navigateToTransfer,
                      backgroundColor: AppColors.surface,
                      child: const Icon(Icons.swap_horiz, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        // 수입 버튼
        AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, -140 * _animation.value),
              child: Opacity(
                opacity: _animation.value,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.cardBackground,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        '수입',
                        style: TextStyle(
                          color: AppColors.primaryBlue,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: 'income',
                      onPressed: () {
                        _toggleExpanded();
                        widget.onIncomePressed();
                      },
                      backgroundColor: AppColors.primaryBlue,
                      child: const Icon(Icons.add, color: Colors.white),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        // 지출 버튼
        AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, -70 * _animation.value),
              child: Opacity(
                opacity: _animation.value,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.cardBackground,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        '지출',
                        style: TextStyle(
                          color: AppColors.primaryRed,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: 'expense',
                      onPressed: () {
                        _toggleExpanded();
                        widget.onExpensePressed();
                      },
                      backgroundColor: AppColors.primaryRed,
                      child: const Icon(Icons.remove, color: Colors.white),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        // 메인 버튼
        FloatingActionButton(
          heroTag: 'main',
          onPressed: _toggleExpanded,
          backgroundColor: isExpanded ? AppColors.textTertiary : AppColors.primaryYellow,
          child: AnimatedRotation(
            duration: const Duration(milliseconds: 200),
            turns: isExpanded ? 0.125 : 0,
            child: Icon(
              Icons.add,
              color: isExpanded ? AppColors.textPrimary : Colors.black,
            ),
          ),
        ),
      ],
    );
  }
}