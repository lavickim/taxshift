import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';
import '../services/community_service.dart';

class PostDetailScreen extends StatefulWidget {
  final int postId;
  
  const PostDetailScreen({
    Key? key,
    required this.postId,
  }) : super(key: key);

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final TextEditingController _commentController = TextEditingController();
  bool _isLoading = true;
  Map<String, dynamic>? _post;
  bool _isLiked = false;
  int _likeCount = 0;
  List<Map<String, dynamic>> _comments = [];
  
  @override
  void initState() {
    super.initState();
    _loadPost();
  }
  
  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }
  
  Future<void> _loadPost() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final post = await CommunityService.getPost(widget.postId);
      setState(() {
        _post = post;
        _isLiked = post['isLiked'] ?? false;
        _likeCount = post['likeCount'] ?? 0;
        _comments = List<Map<String, dynamic>>.from(post['comments'] ?? []);
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading post: $e');
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('게시물을 불러올 수 없습니다'),
            backgroundColor: AppColors.primaryRed,
          ),
        );
        Navigator.pop(context);
      }
    }
  }
  
  Future<void> _toggleLike() async {
    setState(() {
      _isLiked = !_isLiked;
      _likeCount += _isLiked ? 1 : -1;
    });
    
    try {
      await CommunityService.likePost(widget.postId);
    } catch (e) {
      print('Error liking post: $e');
      // 실패 시 원래 상태로 복구
      setState(() {
        _isLiked = !_isLiked;
        _likeCount += _isLiked ? 1 : -1;
      });
    }
  }
  
  Future<void> _addComment() async {
    if (_commentController.text.trim().isEmpty) return;
    
    final commentText = _commentController.text;
    _commentController.clear();
    FocusScope.of(context).unfocus();
    
    try {
      final comment = await CommunityService.createComment(
        postId: widget.postId,
        content: commentText,
      );
      
      setState(() {
        _comments.insert(0, comment);
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('댓글이 작성되었습니다'),
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      print('Error creating comment: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('댓글 작성에 실패했습니다'),
          backgroundColor: AppColors.primaryRed,
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: CustomAppBar(
          title: '',
          showBackButton: true,
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.primaryRed),
        ),
      );
    }
    
    if (_post == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: CustomAppBar(
          title: '',
          showBackButton: true,
        ),
        body: const Center(
          child: Text('게시물을 찾을 수 없습니다'),
        ),
      );
    }
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '',
        showBackButton: true,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: AppColors.textPrimary),
            color: AppColors.cardBackground,
            onSelected: (value) {
              if (value == 'report') {
                _showReportDialog();
              } else if (value == 'share') {
                // 공유 기능
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'share',
                child: Text('공유하기'),
              ),
              const PopupMenuItem(
                value: 'report',
                child: Text('신고하기'),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // 게시물 내용
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 게시물 본문
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: AppColors.cardBackground,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 작성자 정보
                        Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.primaryRed.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  (_post!['author'] ?? '익명')[0],
                                  style: AppTypography.h5.copyWith(
                                    color: AppColors.primaryRed,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _post!['author'] ?? '익명',
                                    style: AppTypography.body1.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    _post!['timeAgo'] ?? '방금',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primaryBlue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                _post!['category'] ?? '기타',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.primaryBlue,
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // 제목
                        Text(
                          _post!['title'] ?? '',
                          style: AppTypography.h4.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // 내용
                        Text(
                          _post!['content'] ?? '',
                          style: AppTypography.body1.copyWith(
                            height: 1.6,
                          ),
                        ),
                        
                        // 이미지 (있는 경우)
                        if (_post!['hasImage'] == true) ...[
                          const SizedBox(height: 16),
                          Container(
                            height: 200,
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(
                              child: Icon(
                                Icons.image,
                                size: 60,
                                color: AppColors.textSecondary.withOpacity(0.3),
                              ),
                            ),
                          ),
                        ],
                        
                        const SizedBox(height: 20),
                        
                        // 조회수
                        Row(
                          children: [
                            Icon(
                              Icons.remove_red_eye_outlined,
                              size: 16,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '조회 ${_post!['viewCount'] ?? 0}',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 12),
                        
                        // 좋아요 버튼
                        Row(
                          children: [
                            InkWell(
                              onTap: _toggleLike,
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: _isLiked 
                                      ? AppColors.primaryRed.withOpacity(0.1)
                                      : AppColors.background,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: _isLiked 
                                        ? AppColors.primaryRed
                                        : AppColors.divider,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      _isLiked 
                                          ? Icons.favorite
                                          : Icons.favorite_border,
                                      size: 20,
                                      color: _isLiked 
                                          ? AppColors.primaryRed
                                          : AppColors.textSecondary,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '추천 $_likeCount',
                                      style: AppTypography.body2.copyWith(
                                        color: _isLiked 
                                            ? AppColors.primaryRed
                                            : AppColors.textSecondary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 20,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '댓글 ${_comments.length}',
                              style: AppTypography.body2.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // 댓글 섹션
                  Container(
                    color: AppColors.cardBackground,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            '댓글 ${_comments.length}개',
                            style: AppTypography.h5.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const Divider(height: 1, color: AppColors.divider),
                        
                        // 댓글 리스트
                        if (_comments.isEmpty)
                          Padding(
                            padding: const EdgeInsets.all(32),
                            child: Center(
                              child: Text(
                                '첫 번째 댓글을 작성해보세요!',
                                style: AppTypography.body2.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          )
                        else
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _comments.length,
                            separatorBuilder: (context, index) => 
                                const Divider(height: 1, color: AppColors.divider),
                            itemBuilder: (context, index) {
                              final comment = _comments[index];
                              return _buildCommentItem(comment);
                            },
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // 댓글 입력창
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).viewInsets.bottom + 12,
            ),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  offset: const Offset(0, -1),
                  blurRadius: 4,
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: '댓글을 입력하세요...',
                      hintStyle: AppTypography.body2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                    ),
                    style: AppTypography.body2,
                    maxLines: null,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _addComment,
                  icon: Icon(
                    Icons.send,
                    color: AppColors.primaryRed,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCommentItem(Map<String, dynamic> comment) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.primaryBlue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                (comment['author'] ?? '익명')[0],
                style: AppTypography.caption.copyWith(
                  color: AppColors.primaryBlue,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      comment['author'] ?? '익명',
                      style: AppTypography.body2.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      comment['timeAgo'] ?? '방금',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  comment['content'] ?? '',
                  style: AppTypography.body2,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    InkWell(
                      onTap: () {
                        // 댓글 좋아요
                      },
                      child: Row(
                        children: [
                          Icon(
                            (comment['isLiked'] ?? false)
                                ? Icons.thumb_up
                                : Icons.thumb_up_outlined,
                            size: 16,
                            color: (comment['isLiked'] ?? false)
                                ? AppColors.primaryBlue
                                : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${comment['likeCount'] ?? 0}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      '답글',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  void _showReportDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: const Text('게시물 신고'),
        content: const Text('이 게시물을 신고하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              '취소',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('신고가 접수되었습니다'),
                ),
              );
            },
            child: Text(
              '신고',
              style: TextStyle(color: AppColors.primaryRed),
            ),
          ),
        ],
      ),
    );
  }
}