import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTypography {
  // 헤딩
  static TextStyle h1 = GoogleFonts.notoSansKr(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    height: 1.3,
  );
  
  static TextStyle h2 = GoogleFonts.notoSansKr(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
    height: 1.3,
  );
  
  static TextStyle h3 = GoogleFonts.notoSansKr(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    letterSpacing: -0.2,
    height: 1.4,
  );
  
  static TextStyle h4 = GoogleFonts.notoSansKr(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );
  
  // 본문
  static TextStyle bodyLarge = GoogleFonts.notoSansKr(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
    height: 1.5,
  );
  
  static TextStyle body = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
    height: 1.5,
  );
  
  static TextStyle bodySmall = GoogleFonts.notoSansKr(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
    height: 1.5,
  );
  
  // 버튼
  static TextStyle button = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    letterSpacing: 0.5,
    height: 1.4,
  );
  
  static TextStyle buttonLarge = GoogleFonts.notoSansKr(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    letterSpacing: 0.5,
    height: 1.4,
  );
  
  // 캡션
  static TextStyle caption = GoogleFonts.notoSansKr(
    fontSize: 11,
    fontWeight: FontWeight.normal,
    color: AppColors.textTertiary,
    height: 1.4,
  );
  
  // 금액
  static TextStyle amountLarge = GoogleFonts.notoSansKr(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    height: 1.3,
  );
  
  static TextStyle amountMedium = GoogleFonts.notoSansKr(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.3,
  );
  
  static TextStyle amountSmall = GoogleFonts.notoSansKr(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.4,
  );
  
  // 수입/지출 금액
  static TextStyle incomeAmount = GoogleFonts.notoSansKr(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.primaryBlue,
    height: 1.4,
  );
  
  static TextStyle expenseAmount = GoogleFonts.notoSansKr(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.primaryRed,
    height: 1.4,
  );
  
  // 탭 레이블
  static TextStyle tabLabel = GoogleFonts.notoSansKr(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
    height: 1.4,
  );
  
  static TextStyle tabLabelActive = GoogleFonts.notoSansKr(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );
  
  // 캘린더
  static TextStyle calendarDay = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
    height: 1.4,
  );
  
  static TextStyle calendarDayInactive = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textDisabled,
    height: 1.4,
  );
  
  static TextStyle calendarToday = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: AppColors.primaryYellow,
    height: 1.4,
  );
  
  static TextStyle calendarWeekday = GoogleFonts.notoSansKr(
    fontSize: 11,
    fontWeight: FontWeight.normal,
    color: AppColors.textTertiary,
    height: 1.4,
  );

  // 추가 스타일 (호환성을 위해)
  static TextStyle h5 = GoogleFonts.notoSansKr(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    height: 1.4,
  );

  static TextStyle h6 = GoogleFonts.notoSansKr(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
    height: 1.4,
  );

  static TextStyle body1 = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    letterSpacing: 0.0,
    height: 1.5,
  );

  static TextStyle body2 = GoogleFonts.notoSansKr(
    fontSize: 14,
    fontWeight: FontWeight.w300,
    color: AppColors.textSecondary,
    letterSpacing: 0.0,
    height: 1.5,
  );
}