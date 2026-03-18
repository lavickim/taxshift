import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';
import '../services/challenge_service.dart';

class MyChallengesScreen extends StatefulWidget {
  const MyChallengesScreen({Key? key}) : super(key: key);

  @override
  State<MyChallengesScreen> createState() => _MyChallengesScreenState();
}

class _MyChallengesScreenState extends State<MyChallengesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _challenges = [];
  Map<String, dynamic>? _userStats;
  bool _isLoading = true;

  final List<String> _tabs = ['진행중', '완료', '실패'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        _loadChallenges();
      }
    });
    _loadInitialData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    await Future.wait([
      _loadChallenges(),
      _loadUserStats(),
    ]);
  }

  Future<void> _loadChallenges() async {
    setState(() => _isLoading = true);

    String status;
    switch (_tabs[_tabController.index]) {
      case '진행중':
        status = 'in_progress';
        break;
      case '완료':
        status = 'completed';
        break;
      case '실패':
        status = 'failed';
        break;
      default:
        status = 'in_progress';
    }

    try {
      final response = await ChallengeService.getUserChallenges(
        1, // userId = 1
        status: status,
        page: 0,
        size: 20,
      );

      setState(() {
        _challenges = List<Map<String, dynamic>>.from(response['content'] ?? []);
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading challenges: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadUserStats() async {
    try {
      final stats = await ChallengeService.getUserStats(1); // userId = 1
      setState(() {
        _userStats = stats;
      });
    } catch (e) {
      print('Error loading user stats: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '내 챌린지',
      ),
      body: Column(
        children: [
          // 통계 카드
          if (_userStats != null) _buildStatsCard(),

          // 탭
          Container(
            color: AppColors.cardBackground,
            child: TabBar(
              controller: _tabController,
              indicatorColor: AppColors.primaryRed,
              indicatorWeight: 3,
              labelColor: AppColors.primaryRed,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: AppTypography.body1.copyWith(
                fontWeight: FontWeight.bold,
              ),
              tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
            ),
          ),

          // 챌린지 리스트
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryRed),
                  )
                : _challenges.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _challenges.length,
                        itemBuilder: (context, index) {
                          return _buildChallengeCard(_challenges[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard() {
    final level = _userStats!['level'] ?? 1;
    final title = _userStats!['title'] ?? '초보 절약러';
    final tier = _userStats!['tier'] ?? 'bronze';
    final totalPoints = _userStats!['totalPoints'] ?? 0;
    final challengesCompleted = _userStats!['challengesCompleted'] ?? 0;
    final streakDays = _userStats!['streakDays'] ?? 0;
    final badgesEarned = _userStats!['badgesEarned'] ?? 0;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _getTierColors(tier),
                  ),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    'Lv.$level',
                    style: AppTypography.h6.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.h6.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '총 $totalPoints 포인트',
                      style: AppTypography.body2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatItem(
                Icons.check_circle,
                '$challengesCompleted',
                '완료',
                AppColors.primaryGreen,
              ),
              _buildStatItem(
                Icons.local_fire_department,
                '$streakDays일',
                '연속',
                AppColors.primaryRed,
              ),
              _buildStatItem(
                Icons.emoji_events,
                '$badgesEarned',
                '뱃지',
                AppColors.primaryYellow,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.h6.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChallengeCard(Map<String, dynamic> userChallenge) {
    final challenge = userChallenge['challenge'] ?? {};
    final status = userChallenge['status'] ?? 'in_progress';
    final progress = userChallenge['progress'] ?? 0.0;
    final pointsEarned = userChallenge['pointsEarned'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getStatusColor(status).withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _getStatusColor(status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _getStatusText(status),
                  style: AppTypography.caption.copyWith(
                    color: _getStatusColor(status),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              if (status == 'completed')
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '+$pointsEarned P',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            challenge['title'] ?? '',
            style: AppTypography.h6.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            challenge['description'] ?? '',
            style: AppTypography.body2.copyWith(
              color: AppColors.textSecondary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (status == 'in_progress') ...[
            const SizedBox(height: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '진행률',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '${progress.toStringAsFixed(1)}%',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress / 100,
                    backgroundColor: AppColors.borderColor,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _getProgressColor(progress),
                    ),
                    minHeight: 8,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    String message;
    IconData icon;
    switch (_tabs[_tabController.index]) {
      case '진행중':
        message = '진행 중인 챌린지가 없습니다';
        icon = Icons.play_circle_outline;
        break;
      case '완료':
        message = '완료한 챌린지가 없습니다';
        icon = Icons.check_circle_outline;
        break;
      case '실패':
        message = '실패한 챌린지가 없습니다';
        icon = Icons.cancel_outlined;
        break;
      default:
        message = '챌린지가 없습니다';
        icon = Icons.emoji_events_outlined;
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: AppColors.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: AppTypography.body1.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  List<Color> _getTierColors(String tier) {
    switch (tier) {
      case 'diamond':
        return [Colors.cyan.shade300, Colors.blue.shade400];
      case 'platinum':
        return [Colors.grey.shade400, Colors.blueGrey.shade500];
      case 'gold':
        return [Colors.amber.shade400, Colors.orange.shade500];
      case 'silver':
        return [Colors.grey.shade500, Colors.blueGrey.shade600];
      default: // bronze
        return [Colors.brown.shade400, Colors.orange.shade700];
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'in_progress':
        return AppColors.primaryBlue;
      case 'completed':
        return AppColors.primaryGreen;
      case 'failed':
        return AppColors.primaryRed;
      case 'abandoned':
        return AppColors.textSecondary;
      default:
        return AppColors.textSecondary;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      case 'abandoned':
        return '포기';
      default:
        return status;
    }
  }

  Color _getProgressColor(double progress) {
    if (progress >= 80) {
      return AppColors.primaryGreen;
    } else if (progress >= 50) {
      return AppColors.primaryYellow;
    } else if (progress >= 20) {
      return AppColors.primaryBlue;
    } else {
      return AppColors.primaryRed;
    }
  }
}