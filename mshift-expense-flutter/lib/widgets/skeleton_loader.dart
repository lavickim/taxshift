import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../constants/colors.dart';

class SkeletonLoader extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;
  
  const SkeletonLoader({
    Key? key,
    required this.width,
    required this.height,
    this.borderRadius,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.cardBackground,
      highlightColor: AppColors.cardBackground.withOpacity(0.6),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: borderRadius ?? BorderRadius.circular(8),
        ),
      ),
    );
  }
}

class TransactionListSkeleton extends StatelessWidget {
  const TransactionListSkeleton({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: 5,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                // 카테고리 아이콘
                const SkeletonLoader(
                  width: 40,
                  height: 40,
                  borderRadius: BorderRadius.all(Radius.circular(20)),
                ),
                const SizedBox(width: 12),
                // 거래 정보
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SkeletonLoader(
                        width: MediaQuery.of(context).size.width * 0.4,
                        height: 16,
                      ),
                      const SizedBox(height: 4),
                      SkeletonLoader(
                        width: MediaQuery.of(context).size.width * 0.25,
                        height: 12,
                      ),
                    ],
                  ),
                ),
                // 금액
                const SkeletonLoader(
                  width: 80,
                  height: 20,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class StatisticsCardSkeleton extends StatelessWidget {
  const StatisticsCardSkeleton({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SkeletonLoader(
            width: 100,
            height: 16,
          ),
          const SizedBox(height: 8),
          const SkeletonLoader(
            width: 150,
            height: 32,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  SkeletonLoader(
                    width: 60,
                    height: 12,
                  ),
                  SizedBox(height: 4),
                  SkeletonLoader(
                    width: 80,
                    height: 20,
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: const [
                  SkeletonLoader(
                    width: 60,
                    height: 12,
                  ),
                  SizedBox(height: 4),
                  SkeletonLoader(
                    width: 80,
                    height: 20,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class ChartSkeleton extends StatelessWidget {
  final double height;
  
  const ChartSkeleton({
    Key? key,
    this.height = 200,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SkeletonLoader(
            width: 120,
            height: 16,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(
                7,
                (index) => SkeletonLoader(
                  width: 30,
                  height: (height - 60) * (0.3 + (index * 0.1)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}