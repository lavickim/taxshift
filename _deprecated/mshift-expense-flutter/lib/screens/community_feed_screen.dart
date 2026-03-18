import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';
import '../services/community_service.dart';
import 'create_post_screen.dart';
import 'post_detail_screen.dart';

class CommunityFeedScreen extends StatefulWidget {
  const CommunityFeedScreen({Key? key}) : super(key: key);

  @override
  State<CommunityFeedScreen> createState() => _CommunityFeedScreenState();
}

class _CommunityFeedScreenState extends State<CommunityFeedScreen> 
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedTabIndex = 0;
  bool _isLoading = false;
  List<Map<String, dynamic>> _posts = [];
  int _currentPage = 0;
  bool _hasMore = true;
  
  final List<String> _tabs = [
    '추천',
    '최신',
    '절약노하우',
    '짠테크',
    '목돈마련',
    '투자',
    '부업',
  ];
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _selectedTabIndex = _tabController.index;
          _currentPage = 0;
          _posts = [];
          _hasMore = true;
        });
        _loadPosts();
      }
    });
    _loadPosts();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  Future<void> _loadPosts({bool loadMore = false}) async {
    if (_isLoading || (!loadMore && _posts.isNotEmpty)) return;
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final category = _tabs[_selectedTabIndex];
      final sort = category == '추천' ? 'popular' : 'latest';
      
      final response = await CommunityService.getPosts(
        category: category == '추천' || category == '최신' ? null : category,
        sort: sort,
        page: loadMore ? _currentPage + 1 : 0,
        size: 10,
      );
      
      final List<dynamic> content = response['content'] ?? [];
      
      setState(() {
        if (loadMore) {
          _posts.addAll(content.cast<Map<String, dynamic>>());
          _currentPage++;
        } else {
          _posts = content.cast<Map<String, dynamic>>();
          _currentPage = 0;
        }
        _hasMore = !(response['last'] ?? true);
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading posts: $e');
      setState(() {
        _isLoading = false;
      });
      
      // 에러 시 토스트 메시지 표시
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('게시물을 불러올 수 없습니다'),
            backgroundColor: AppColors.primaryRed,
          ),
        );
      }
    }
  }
  
  Future<void> _refreshPosts() async {
    setState(() {
      _currentPage = 0;
      _posts = [];
      _hasMore = true;
    });
    await _loadPosts();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '커뮤니티',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppColors.textPrimary),
            onPressed: () {
              // 검색 기능
            },
          ),
          IconButton(
            icon: const Icon(Icons.edit_note, color: AppColors.textPrimary),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const CreatePostScreen(),
                ),
              );
              
              if (result == true) {
                _refreshPosts();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
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
              tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
            ),
          ),
          
          // 게시물 리스트
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _tabs.map((tab) => _buildPostList()).toList(),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildPostList() {
    if (_isLoading && _posts.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryRed),
      );
    }
    
    if (_posts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.article_outlined,
              size: 64,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              '아직 게시물이 없습니다',
              style: AppTypography.body1.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '첫 번째 게시물을 작성해보세요!',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _refreshPosts,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryRed,
              ),
              child: const Text('새로고침'),
            ),
          ],
        ),
      );
    }
    
    return RefreshIndicator(
      color: AppColors.primaryRed,
      onRefresh: _refreshPosts,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _posts.length + (_hasMore ? 1 : 0),
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          if (index == _posts.length) {
            // 더 보기 버튼
            return Center(
              child: _isLoading
                  ? const CircularProgressIndicator(color: AppColors.primaryRed)
                  : TextButton(
                      onPressed: () => _loadPosts(loadMore: true),
                      child: Text(
                        '더 보기',
                        style: TextStyle(color: AppColors.primaryRed),
                      ),
                    ),
            );
          }
          
          final post = _posts[index];
          return _buildPostCard(post);
        },
      ),
    );
  }
  
  Widget _buildPostCard(Map<String, dynamic> post) {
    // 시간 표시 변환
    String timeAgo = post['timeAgo'] ?? '방금';
    
    return GestureDetector(
      onTap: () async {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PostDetailScreen(postId: post['id']),
          ),
        );
        
        if (result == true) {
          _refreshPosts();
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 작성자 정보
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primaryRed.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      (post['author'] ?? '익명')[0],
                      style: AppTypography.body2.copyWith(
                        color: AppColors.primaryRed,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post['author'] ?? '익명',
                        style: AppTypography.body2.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        timeAgo,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    post['category'] ?? '기타',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.primaryBlue,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // 제목
            Text(
              post['title'] ?? '',
              style: AppTypography.h5.copyWith(
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            const SizedBox(height: 8),
            
            // 내용 미리보기
            Text(
              post['content'] ?? '',
              style: AppTypography.body2.copyWith(
                color: AppColors.textSecondary,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            
            // 이미지 썸네일 (있는 경우)
            if (post['hasImage'] == true) ...[
              const SizedBox(height: 12),
              Container(
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Icon(
                    Icons.image,
                    size: 40,
                    color: AppColors.textSecondary.withOpacity(0.3),
                  ),
                ),
              ),
            ],
            
            const SizedBox(height: 12),
            
            // 좋아요, 댓글
            Row(
              children: [
                Icon(
                  post['isLiked'] == true 
                      ? Icons.favorite
                      : Icons.favorite_border,
                  size: 18,
                  color: post['isLiked'] == true
                      ? AppColors.primaryRed
                      : AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  '${post['likeCount'] ?? 0}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 16),
                Icon(
                  Icons.chat_bubble_outline,
                  size: 18,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  '${post['commentCount'] ?? 0}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.remove_red_eye_outlined,
                  size: 16,
                  color: AppColors.textSecondary.withOpacity(0.5),
                ),
                const SizedBox(width: 4),
                Text(
                  '${post['viewCount'] ?? 0}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}