class DailyMemo {
  final int? memoId;
  final int userId;
  final DateTime memoDate;
  final String? title;
  final String? content;
  final String? color;
  final String? mood;
  final bool isImportant;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  DailyMemo({
    this.memoId,
    required this.userId,
    required this.memoDate,
    this.title,
    this.content,
    this.color = '#4A90E2',
    this.mood,
    this.isImportant = false,
    this.createdAt,
    this.updatedAt,
  });

  factory DailyMemo.fromJson(Map<String, dynamic> json) {
    return DailyMemo(
      memoId: json['memoId'],
      userId: json['userId'],
      memoDate: DateTime.parse(json['memoDate']),
      title: json['title'],
      content: json['content'],
      color: json['color'] ?? '#4A90E2',
      mood: json['mood'],
      isImportant: json['isImportant'] ?? false,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (memoId != null) 'memoId': memoId,
      'userId': userId,
      'memoDate': memoDate.toIso8601String().split('T')[0],
      'title': title,
      'content': content,
      'color': color,
      'mood': mood,
      'isImportant': isImportant,
    };
  }

  DailyMemo copyWith({
    int? memoId,
    int? userId,
    DateTime? memoDate,
    String? title,
    String? content,
    String? color,
    String? mood,
    bool? isImportant,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DailyMemo(
      memoId: memoId ?? this.memoId,
      userId: userId ?? this.userId,
      memoDate: memoDate ?? this.memoDate,
      title: title ?? this.title,
      content: content ?? this.content,
      color: color ?? this.color,
      mood: mood ?? this.mood,
      isImportant: isImportant ?? this.isImportant,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}