import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';
import '../services/challenge_service.dart';
import 'challenge_detail_screen.dart';
import 'my_challenges_screen.dart';

class ChallengeListScreen extends StatefulWidget {
  const ChallengeListScreen({Key? key}) : super(key: key);

  @override
  State<ChallengeListScreen> createState() => _ChallengeListScreenState();
}

class _ChallengeListScreenState extends State<ChallengeListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _challenges = [];
  Map<String, dynamic>? _userLevel;
  bool _isLoading = true;

  final List<String> _categories = [
    '인기',
    '신규',
    '절약',
    '저축',
    '소비습관',
    '투자',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _categories.length, vsync: this);
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
      _loadUserLevel(),
    ]);
  }

  Future<void> _loadChallenges() async {
    setState(() => _isLoading = true);

    try {
      String? category;
      String sort = 'recent';

      switch (_categories[_tabController.index]) {
        case '인기':
          sort = 'popular';
          break;
        case '신규':
          sort = 'recent';
          break;
        case '절약':
        case '저축':
        case '소비습관':
        case '투자':
          category = _categories[_tabController.index];
          break;
      }

      final response = await ChallengeService.getChallenges(
        category: category,
        sort: sort,
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

  Future<void> _loadUserLevel() async {
    try {
      final level = await ChallengeService.getUserLevel(1); // userId = 1
      setState(() {
        _userLevel = level;
      });
    } catch (e) {
      print('Error loading user level: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '챌린지',
        actions: [
          IconButton(
            icon: const Icon(Icons.emoji_events, color: AppColors.primaryYellow),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyChallengesScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 사용자 레벨 정보
          if (_userLevel != null) _buildUserLevelCard(),

          // 카테고리 탭
          Container(
            color: AppColors.cardBackground,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              indicatorColor: AppColors.primaryRed,
              indicatorWeight: 3,
              labelColor: AppColors.primaryRed,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: AppTypography.body1.copyWith(
                fontWeight: FontWeight.bold,
              ),
              tabs: _categories.map((cat) => Tab(text: cat)).toList(),
            ),
          ),

          // 챌린지 리스트
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryRed),
                  )
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

  Widget _buildUserLevelCard() {
    final level = _userLevel!['currentLevel'] ?? 1;
    final exp = _userLevel!['currentExp'] ?? 0;
    final requiredExp = _userLevel!['requiredExpForNextLevel'] ?? 100;
    final title = _userLevel!['title'] ?? '초보 절약러';
    final tier = _userLevel!['tier'] ?? 'bronze';
    final points = _userLevel!['totalPoints'] ?? 0;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: _getTierColors(tier),
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    'Lv.$level',
                    style: AppTypography.h5.copyWith(
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
                      style: AppTypography.h5.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$points 포인트',
                      style: AppTypography.body2.copyWith(
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                _getTierIcon(tier),
                size: 32,
                color: Colors.white,
              ),
            ],
          ),
          const SizedBox(height: 16),
          // 경험치 바
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '다음 레벨까지',
                    style: AppTypography.caption.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  Text(
                    '$exp / $requiredExp',
                    style: AppTypography.caption.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: exp / requiredExp,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChallengeCard(Map<String, dynamic> challenge) {
    final difficulty = challenge['difficultyLevel'] ?? 1;
    final points = challenge['points'] ?? 0;
    final participants = challenge['participantCount'] ?? 0;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChallengeDetailScreen(
              challengeId: challenge['id'],
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.borderColor,
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
                    color: _getCategoryColor(challenge['category']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    challenge['category'] ?? '기타',
                    style: AppTypography.caption.copyWith(
                      color: _getCategoryColor(challenge['category']),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ...List.generate(
                  difficulty,
                  (index) => Icon(
                    Icons.star,
                    size: 14,
                    color: AppColors.primaryYellow,
                  ),
                ),
                const Spacer(),
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
                    '+$points P',
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
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.people,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  '$participants명 참여중',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 16),
                Icon(
                  Icons.schedule,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  _getChallengeTypeText(challenge['challengeType']),
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
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

  IconData _getTierIcon(String tier) {
    switch (tier) {
      case 'diamond':
        return Icons.diamond;
      case 'platinum':
        return Icons.workspace_premium;
      case 'gold':
        return Icons.military_tech;
      case 'silver':
        return Icons.verified;
      default:
        return Icons.shield;
    }
  }

  Color _getCategoryColor(String? category) {
    switch (category) {
      case '절약':
        return AppColors.primaryGreen;
      case '저축':
        return AppColors.primaryBlue;
      case '소비습관':
        return AppColors.primaryPurple;
      case '투자':
        return AppColors.primaryYellow;
      default:
        return AppColors.textSecondary;
    }
  }

  String _getChallengeTypeText(String? type) {
    switch (type) {
      case 'daily':
        return '일일 챌린지';
      case 'weekly':
        return '주간 챌린지';
      case 'monthly':
        return '월간 챌린지';
      default:
        return '커스텀 챌린지';
    }
  }
}