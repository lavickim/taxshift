import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'screens/main_screen.dart';
import 'constants/colors.dart';
import 'constants/typography.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ko_KR', null);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '편한가계부',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.background,
        primaryColor: AppColors.primaryYellow,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.background,
          selectedItemColor: AppColors.primaryYellow,
          unselectedItemColor: AppColors.textTertiary,
          type: BottomNavigationBarType.fixed,
        ),
        textTheme: TextTheme(
          displayLarge: AppTypography.h1,
          displayMedium: AppTypography.h2,
          displaySmall: AppTypography.h3,
          headlineMedium: AppTypography.h4,
          headlineSmall: AppTypography.h5,
          titleLarge: AppTypography.h6,
          bodyLarge: AppTypography.body1,
          bodyMedium: AppTypography.body2,
          labelSmall: AppTypography.caption,
        ),
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primaryYellow,
          secondary: AppColors.primaryBlue,
          surface: AppColors.cardBackground,
          background: AppColors.background,
          error: AppColors.primaryRed,
        ),
      ),
      home: const MainScreen(),
    );
  }
}