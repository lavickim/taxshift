import 'package:flutter/material.dart';
import '../models/daily_memo.dart';
import '../constants/colors.dart';
import '../constants/typography.dart';
import '../services/daily_memo_service.dart';

class MemoDialog extends StatefulWidget {
  final DateTime date;
  final DailyMemo? existingMemo;
  final int userId;

  const MemoDialog({
    Key? key,
    required this.date,
    this.existingMemo,
    required this.userId,
  }) : super(key: key);

  @override
  State<MemoDialog> createState() => _MemoDialogState();
}

class _MemoDialogState extends State<MemoDialog> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  final DailyMemoService _memoService = DailyMemoService();
  
  String _selectedColor = '#4A90E2';
  String? _selectedMood;
  bool _isImportant = false;
  bool _isSaving = false;
  
  final List<String> _colors = [
    '#4A90E2', // Blue
    '#50C878', // Green
    '#FFB84D', // Orange
    '#FF6B6B', // Red
    '#9B59B6', // Purple
    '#00CED1', // Cyan
    '#FFB6C1', // Pink
    '#808080', // Gray
  ];
  
  final List<Map<String, dynamic>> _moods = [
    {'emoji': '😊', 'value': 'happy'},
    {'emoji': '😔', 'value': 'sad'},
    {'emoji': '😡', 'value': 'angry'},
    {'emoji': '😴', 'value': 'tired'},
    {'emoji': '🤗', 'value': 'excited'},
    {'emoji': '😌', 'value': 'peaceful'},
    {'emoji': '🤔', 'value': 'thoughtful'},
    {'emoji': '😰', 'value': 'anxious'},
  ];

  @override
  void initState() {
    super.initState();
    if (widget.existingMemo != null) {
      _titleController.text = widget.existingMemo!.title ?? '';
      _contentController.text = widget.existingMemo!.content ?? '';
      _selectedColor = widget.existingMemo!.color ?? '#4A90E2';
      _selectedMood = widget.existingMemo!.mood;
      _isImportant = widget.existingMemo!.isImportant;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _saveMemo() async {
    if (_contentController.text.isEmpty && _titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('제목이나 내용을 입력해주세요')),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    final memo = DailyMemo(
      memoId: widget.existingMemo?.memoId,
      userId: widget.userId,
      memoDate: widget.date,
      title: _titleController.text.isEmpty ? null : _titleController.text,
      content: _contentController.text.isEmpty ? null : _contentController.text,
      color: _selectedColor,
      mood: _selectedMood,
      isImportant: _isImportant,
    );

    final result = await _memoService.createOrUpdateMemo(memo);

    setState(() {
      _isSaving = false;
    });

    if (result != null) {
      Navigator.of(context).pop(result);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('메모 저장에 실패했습니다')),
      );
    }
  }

  Future<void> _deleteMemo() async {
    if (widget.existingMemo == null) return;

    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('메모 삭제'),
        content: const Text('이 메모를 삭제하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('삭제', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _memoService.deleteMemo(widget.userId, widget.date);
      if (success) {
        Navigator.of(context).pop(null);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('메모 삭제에 실패했습니다')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(20),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
            constraints: const BoxConstraints(
              maxHeight: 600,
              maxWidth: 400,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF333333), width: 1),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Color(int.parse('0xFF${_selectedColor.substring(1)}')),
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(16),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${widget.date.year}년 ${widget.date.month}월 ${widget.date.day}일',
                        style: AppTypography.body1.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Row(
                        children: [
                          if (widget.existingMemo != null)
                            IconButton(
                              icon: const Icon(Icons.delete_outline),
                              color: Colors.white,
                              onPressed: _deleteMemo,
                            ),
                          IconButton(
                            icon: const Icon(Icons.close),
                            color: Colors.white,
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title input
                        TextField(
                          controller: _titleController,
                          style: AppTypography.h3.copyWith(
                            color: Colors.white,
                          ),
                          decoration: InputDecoration(
                            hintText: '제목',
                            hintStyle: AppTypography.h3.copyWith(
                              color: const Color(0xFF666666),
                            ),
                            border: InputBorder.none,
                          ),
                        ),
                        const SizedBox(height: 8),
                        
                        // Content input
                        TextField(
                          controller: _contentController,
                          style: AppTypography.body1.copyWith(
                            color: Colors.white,
                          ),
                          maxLines: 8,
                          decoration: InputDecoration(
                            hintText: '오늘의 메모를 작성해주세요...',
                            hintStyle: AppTypography.body1.copyWith(
                              color: const Color(0xFF666666),
                            ),
                            border: InputBorder.none,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Color selector
                        Text(
                          '색상',
                          style: AppTypography.body2.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: _colors.map((color) {
                            final isSelected = color == _selectedColor;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedColor = color;
                                });
                              },
                              child: Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: Color(int.parse('0xFF${color.substring(1)}')),
                                  shape: BoxShape.circle,
                                  border: isSelected
                                      ? Border.all(color: Colors.black, width: 2)
                                      : null,
                                ),
                                child: isSelected
                                    ? const Icon(
                                        Icons.check,
                                        color: Colors.white,
                                        size: 16,
                                      )
                                    : null,
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),
                        
                        // Mood selector
                        Text(
                          '기분',
                          style: AppTypography.body2.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: _moods.map((mood) {
                            final isSelected = mood['value'] == _selectedMood;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedMood = 
                                      isSelected ? null : mood['value'];
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primaryRed.withOpacity(0.2)
                                      : const Color(0xFF2A2A2A),
                                  borderRadius: BorderRadius.circular(8),
                                  border: isSelected
                                      ? Border.all(color: AppColors.primaryRed)
                                      : Border.all(color: const Color(0xFF333333)),
                                ),
                                child: Text(
                                  mood['emoji'],
                                  style: const TextStyle(fontSize: 24),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),
                        
                        // Important checkbox
                        Row(
                          children: [
                            Checkbox(
                              value: _isImportant,
                              onChanged: (value) {
                                setState(() {
                                  _isImportant = value ?? false;
                                });
                              },
                              activeColor: AppColors.primaryRed,
                              checkColor: Colors.white,
                            ),
                            Text(
                              '중요한 날',
                              style: AppTypography.body2.copyWith(
                                color: Colors.white,
                              ),
                            ),
                            if (_isImportant)
                              const Padding(
                                padding: EdgeInsets.only(left: 8),
                                child: Icon(
                                  Icons.star,
                                  color: Colors.amber,
                                  size: 20,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Save button
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E1E1E),
                    border: Border(
                      top: BorderSide(color: Color(0xFF333333)),
                    ),
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveMemo,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryRed,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              '저장',
                              style: AppTypography.button.copyWith(
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
    );
  }
}