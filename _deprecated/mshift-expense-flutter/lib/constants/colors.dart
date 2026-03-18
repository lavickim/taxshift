import 'package:flutter/material.dart';

class AppColors {
  // 기본 배경색
  static const Color background = Color(0xFF000000); // 검정 배경
  static const Color cardBackground = Color(0xFF1A1A1A); // 카드 배경
  static const Color surfaceBackground = Color(0xFF0D0D0D); // 표면 배경
  
  // 주요 색상
  static const Color primaryRed = Color(0xFFFF5757); // 빨간색 (지출)
  static const Color primaryBlue = Color(0xFF4A90E2); // 파란색 (수입)
  static const Color primaryGreen = Color(0xFF4CAF50); // 초록색 (성공/확인)
  static const Color primaryYellow = Color(0xFFFFC107); // 노란색 (경고/강조)
  static const Color primaryPurple = Color(0xFF9C27B0); // 보라색 (특별/프리미엄)
  
  // 텍스트 색상
  static const Color textPrimary = Color(0xFFFFFFFF); // 주요 텍스트
  static const Color textSecondary = Color(0xFFB3B3B3); // 보조 텍스트
  static const Color textTertiary = Color(0xFF808080); // 3차 텍스트
  static const Color textDisabled = Color(0xFF4D4D4D); // 비활성 텍스트
  
  // 구분선
  static const Color divider = Color(0xFF2A2A2A); // 구분선
  static const Color border = Color(0xFF333333); // 테두리
  static const Color borderColor = Color(0xFF333333); // 테두리 (별칭)
  
  // Surface 색상
  static const Color surface = Color(0xFF1A1A1A); // 표면 색상 (cardBackground와 동일)
  
  // 카테고리 색상
  static const List<Color> categoryColors = [
    Color(0xFFFF5757), // 빨간색
    Color(0xFF4A90E2), // 파란색
    Color(0xFF4CAF50), // 초록색
    Color(0xFFFFC107), // 노란색
    Color(0xFF9C27B0), // 보라색
    Color(0xFF00BCD4), // 청록색
    Color(0xFFFF9800), // 오렌지색
    Color(0xFF795548), // 갈색
    Color(0xFF607D8B), // 블루그레이
    Color(0xFFE91E63), // 핑크
  ];
  
  // 그라데이션
  static const LinearGradient incomeGradient = LinearGradient(
    colors: [Color(0xFF4A90E2), Color(0xFF357ABD)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient expenseGradient = LinearGradient(
    colors: [Color(0xFFFF5757), Color(0xFFD64545)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}