import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';
import '../services/challenge_service.dart';

class ChallengeDetailScreen extends StatefulWidget {
  final int challengeId;

  const ChallengeDetailScreen({
    Key? key,
    required this.challengeId,
  }) : super(key: key);

  @override
  State<ChallengeDetailScreen> createState() => _ChallengeDetailScreenState();
}

class _ChallengeDetailScreenState extends State<ChallengeDetailScreen> {
  Map<String, dynamic>? _challenge;
  bool _isLoading = true;
  bool _isJoined = false;

  @override
  void initState() {
    super.initState();
    _loadChallenge();
  }

  Future<void> _loadChallenge() async {
    try {
      final challenge = await ChallengeService.getChallenge(widget.challengeId);
      setState(() {
        _challenge = challenge;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading challenge: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _joinChallenge() async {
    try {
      await ChallengeService.joinChallenge(widget.challengeId, 1); // userId = 1
      setState(() {
        _isJoined = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('챌린지에 참여했습니다!'),
          backgroundColor: AppColors.primaryGreen,
        ),
      );
    } catch (e) {
      print('Error joining challenge: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('이미 참여중인 챌린지입니다'),
          backgroundColor: AppColors.primaryRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '챌린지 상세',
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primaryRed),
            )
          : _challenge == null
              ? const Center(
                  child: Text('챌린지를 불러올 수 없습니다'),
                )
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      _buildInfo(),
                      _buildGoal(),
                      _buildRules(),
                      _buildParticipants(),
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
      bottomNavigationBar: _challenge != null
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: _isJoined ? null : _joinChallenge,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isJoined
                        ? AppColors.borderColor
                        : AppColors.primaryRed,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    _isJoined ? '참여 중' : '챌린지 참여하기',
                    style: AppTypography.h6.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildHeader() {
    final difficulty = _challenge!['difficultyLevel'] ?? 1;
    final points = _challenge!['points'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryRed.withOpacity(0.8),
            AppColors.primaryPurple.withOpacity(0.8),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  _challenge!['category'] ?? '기타',
                  style: AppTypography.body2.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ...List.generate(
                difficulty,
                (index) => Icon(
                  Icons.star,
                  size: 18,
                  color: AppColors.primaryYellow,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            _challenge!['title'] ?? '',
            style: AppTypography.h4.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _challenge!['description'] ?? '',
            style: AppTypography.body1.copyWith(
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '+$points 포인트',
              style: AppTypography.h6.copyWith(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfo() {
    final participants = _challenge!['participantCount'] ?? 0;
    final completionRate = _challenge!['completionRate'] ?? 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: _buildInfoCard(
              icon: Icons.people,
              title: '참여자',
              value: '$participants명',
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildInfoCard(
              icon: Icons.check_circle,
              title: '완료율',
              value: '${completionRate.toStringAsFixed(1)}%',
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildInfoCard(
              icon: Icons.schedule,
              title: '기간',
              value: _getChallengeTypeText(_challenge!['challengeType']),
              color: AppColors.primaryPurple,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.body2.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGoal() {
    final targetAmount = _challenge!['targetAmount'];
    final targetCount = _challenge!['targetCount'];
    final targetDays = _challenge!['targetDays'];

    if (targetAmount == null && targetCount == null) return const SizedBox();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '목표',
            style: AppTypography.h6.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          if (targetAmount != null)
            _buildGoalItem(
              Icons.attach_money,
              '목표 금액',
              '${targetAmount.toStringAsFixed(0)}원',
            ),
          if (targetCount != null)
            _buildGoalItem(
              Icons.flag,
              '목표 횟수',
              '$targetCount회',
            ),
          if (targetDays != null)
            _buildGoalItem(
              Icons.calendar_today,
              '목표 기간',
              '$targetDays일',
            ),
        ],
      ),
    );
  }

  Widget _buildGoalItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppTypography.body2.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: AppTypography.body2.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRules() {
    final rules = _challenge!['rules'];
    if (rules == null || rules == '{}') return const SizedBox();

    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryRed.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.primaryRed.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.rule,
                color: AppColors.primaryRed,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                '챌린지 규칙',
                style: AppTypography.h6.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryRed,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _parseRules(rules),
            style: AppTypography.body2.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParticipants() {
    final participants = _challenge!['participantCount'] ?? 0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '참여자 ($participants명)',
            style: AppTypography.h6.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            height: 60,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: participants > 10 ? 10 : participants,
              itemBuilder: (context, index) {
                return Container(
                  width: 50,
                  height: 50,
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    color: _getRandomColor(index),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '참여자',
                      style: AppTypography.caption.copyWith(
                        color: Colors.white,
                        fontSize: 8,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _getChallengeTypeText(String? type) {
    switch (type) {
      case 'daily':
        return '일일';
      case 'weekly':
        return '주간';
      case 'monthly':
        return '월간';
      default:
        return '커스텀';
    }
  }

  String _parseRules(String rules) {
    // JSON 문자열 파싱하여 읽기 쉬운 형태로 변환
    try {
      if (rules.contains('max_daily_expense')) {
        return '• 하루 최대 지출 제한이 있습니다';
      } else if (rules.contains('max_weekly_expense')) {
        return '• 일주일 최대 지출 제한이 있습니다';
      } else if (rules.contains('monthly_saving_goal')) {
        return '• 월별 저축 목표를 달성해야 합니다';
      } else if (rules.contains('forbidden_categories')) {
        return '• 특정 카테고리 지출이 금지됩니다';
      } else if (rules.contains('daily_saving')) {
        return '• 매일 일정 금액을 저축해야 합니다';
      }
    } catch (e) {
      print('Error parsing rules: $e');
    }
    return '• 챌린지 규칙을 확인하세요';
  }

  Color _getRandomColor(int index) {
    final colors = [
      AppColors.primaryRed,
      AppColors.primaryBlue,
      AppColors.primaryGreen,
      AppColors.primaryPurple,
      AppColors.primaryYellow,
    ];
    return colors[index % colors.length];
  }
}