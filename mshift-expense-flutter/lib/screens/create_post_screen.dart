import 'package:flutter/material.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../widgets/custom_app_bar.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({Key? key}) : super(key: key);

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  String _selectedCategory = '절약노하우';
  bool _hasImage = false;
  
  final List<String> _categories = [
    '절약노하우',
    '짠테크',
    '목돈마련',
    '투자',
    '부업',
    '자유게시판',
  ];
  
  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }
  
  void _submitPost() {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('제목을 입력해주세요'),
          backgroundColor: AppColors.primaryRed,
        ),
      );
      return;
    }
    
    if (_contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('내용을 입력해주세요'),
          backgroundColor: AppColors.primaryRed,
        ),
      );
      return;
    }
    
    // Mock 저장
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('게시물이 작성되었습니다'),
        backgroundColor: AppColors.primaryBlue,
      ),
    );
    
    Navigator.pop(context);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: '게시물 작성',
        showBackButton: true,
        actions: [
          TextButton(
            onPressed: _submitPost,
            child: Text(
              '완료',
              style: AppTypography.body1.copyWith(
                color: AppColors.primaryRed,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 카테고리 선택
            Container(
              padding: const EdgeInsets.all(16),
              color: AppColors.cardBackground,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '카테고리',
                    style: AppTypography.body1.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedCategory,
                        isExpanded: true,
                        dropdownColor: AppColors.cardBackground,
                        style: AppTypography.body2,
                        icon: const Icon(
                          Icons.arrow_drop_down,
                          color: AppColors.textSecondary,
                        ),
                        items: _categories.map((category) {
                          return DropdownMenuItem(
                            value: category,
                            child: Text(category),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedCategory = value!;
                          });
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 8),
            
            // 제목 입력
            Container(
              padding: const EdgeInsets.all(16),
              color: AppColors.cardBackground,
              child: TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: '제목을 입력하세요',
                  hintStyle: AppTypography.h5.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  border: InputBorder.none,
                ),
                style: AppTypography.h5.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
              ),
            ),
            
            const Divider(height: 1, color: AppColors.divider),
            
            // 내용 입력
            Container(
              color: AppColors.cardBackground,
              constraints: BoxConstraints(
                minHeight: MediaQuery.of(context).size.height * 0.4,
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _contentController,
                  decoration: InputDecoration(
                    hintText: '내용을 입력하세요\n\n절약 노하우, 재테크 팁, 목표 달성 경험 등\n다른 사용자들과 공유하고 싶은 이야기를 자유롭게 작성해주세요.',
                    hintStyle: AppTypography.body1.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                    border: InputBorder.none,
                  ),
                  style: AppTypography.body1.copyWith(
                    height: 1.6,
                  ),
                  maxLines: null,
                  keyboardType: TextInputType.multiline,
                ),
              ),
            ),
            
            // 이미지 첨부
            if (_hasImage) ...[
              const SizedBox(height: 8),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                height: 200,
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Icon(
                        Icons.image,
                        size: 60,
                        color: AppColors.textSecondary.withOpacity(0.3),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: IconButton(
                        onPressed: () {
                          setState(() {
                            _hasImage = false;
                          });
                        },
                        icon: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            size: 16,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
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
            IconButton(
              onPressed: () {
                setState(() {
                  _hasImage = true;
                });
              },
              icon: Icon(
                Icons.photo_camera,
                color: _hasImage ? AppColors.primaryBlue : AppColors.textSecondary,
              ),
            ),
            IconButton(
              onPressed: () {
                setState(() {
                  _hasImage = true;
                });
              },
              icon: Icon(
                Icons.image,
                color: _hasImage ? AppColors.primaryBlue : AppColors.textSecondary,
              ),
            ),
            const Spacer(),
            Text(
              '${_titleController.text.length + _contentController.text.length}자',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}