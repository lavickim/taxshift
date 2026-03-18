import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../models/daily_memo.dart';
import '../services/daily_memo_service.dart';
import '../widgets/memo_dialog.dart';

class MemoListView extends StatefulWidget {
  final DateTime selectedDate;
  final int userId;
  
  const MemoListView({
    Key? key,
    required this.selectedDate,
    required this.userId,
  }) : super(key: key);

  @override
  State<MemoListView> createState() => _MemoListViewState();
}

class _MemoListViewState extends State<MemoListView> {
  final DailyMemoService _memoService = DailyMemoService();
  List<DailyMemo> _memos = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadMemos();
  }
  
  @override
  void didUpdateWidget(MemoListView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedDate.year != widget.selectedDate.year ||
        oldWidget.selectedDate.month != widget.selectedDate.month) {
      _loadMemos();
    }
  }
  
  Future<void> _loadMemos() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      print('Loading memos for ${widget.selectedDate.year}/${widget.selectedDate.month}');
      final memos = await _memoService.getMemosByMonth(
        widget.userId,
        widget.selectedDate.year,
        widget.selectedDate.month,
      );
      
      print('Loaded ${memos.length} memos');
      setState(() {
        _memos = memos..sort((a, b) => b.memoDate.compareTo(a.memoDate));
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading memos: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _showMemoDialog(DateTime date, DailyMemo? existingMemo) {
    showDialog(
      context: context,
      builder: (context) => MemoDialog(
        date: date,
        existingMemo: existingMemo,
        userId: widget.userId,
      ),
    ).then((result) {
      if (result != null || (result == null && existingMemo != null)) {
        _loadMemos();
      }
    });
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.note_alt_outlined,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16),
          Text(
            '${widget.selectedDate.month}월의 메모가 없습니다',
            style: AppTypography.body1.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '캘린더에서 날짜를 선택하여\n메모를 작성해보세요',
            textAlign: TextAlign.center,
            style: AppTypography.caption.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }
  
  String _getWeekdayName(int weekday) {
    const weekdays = ['', '월', '화', '수', '목', '금', '토', '일'];
    return weekdays[weekday];
  }
  
  String _getMoodEmoji(String? mood) {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😡';
      case 'tired': return '😴';
      case 'excited': return '🤗';
      case 'peaceful': return '😌';
      case 'thoughtful': return '🤔';
      case 'anxious': return '😰';
      default: return '';
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryRed),
      );
    }
    
    if (_memos.isEmpty) {
      return _buildEmptyState();
    }
    
    return Column(
      children: [
        // 헤더
        Container(
          padding: const EdgeInsets.all(16),
          color: AppColors.cardBackground,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${widget.selectedDate.year}년 ${widget.selectedDate.month}월 메모',
                style: AppTypography.h5,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primaryRed.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_memos.length}개',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.primaryRed,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // 메모 리스트
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: _memos.length,
            itemBuilder: (context, index) {
              final memo = _memos[index];
              final isToday = DateFormat('yyyy-MM-dd').format(memo.memoDate) == 
                             DateFormat('yyyy-MM-dd').format(DateTime.now());
              
              return GestureDetector(
                onTap: () => _showMemoDialog(memo.memoDate, memo),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.cardBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isToday 
                          ? AppColors.primaryRed.withOpacity(0.5)
                          : AppColors.divider,
                      width: isToday ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 메모 헤더
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Color(int.parse('0xFF${memo.color?.substring(1) ?? "4A90E2"}')).withOpacity(0.1),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(11),
                          ),
                        ),
                        child: Row(
                          children: [
                            // 날짜
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isToday 
                                    ? AppColors.primaryRed
                                    : Color(int.parse('0xFF${memo.color?.substring(1) ?? "4A90E2"}')),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    '${memo.memoDate.day}',
                                    style: AppTypography.h5.copyWith(
                                      color: Colors.white,
                                      height: 1,
                                    ),
                                  ),
                                  Text(
                                    _getWeekdayName(memo.memoDate.weekday),
                                    style: AppTypography.caption.copyWith(
                                      color: Colors.white.withOpacity(0.9),
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            
                            // 제목
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      if (memo.isImportant) ...[
                                        const Icon(
                                          Icons.star,
                                          size: 16,
                                          color: Colors.amber,
                                        ),
                                        const SizedBox(width: 4),
                                      ],
                                      Expanded(
                                        child: Text(
                                          memo.title ?? '제목 없음',
                                          style: AppTypography.body1.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (memo.mood != null) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      _getMoodEmoji(memo.mood),
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            
                            // 화살표
                            Icon(
                              Icons.chevron_right,
                              color: AppColors.textTertiary,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                      
                      // 메모 내용
                      if (memo.content != null && memo.content!.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                          child: Text(
                            memo.content!,
                            style: AppTypography.body2.copyWith(
                              color: AppColors.textSecondary,
                              height: 1.4,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ] else ...[
                        const SizedBox(height: 8),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}