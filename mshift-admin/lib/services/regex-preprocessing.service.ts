/**
 * 정규식 전처리 시스템 서비스
 * 백엔드 API와의 통신을 담당하는 서비스 레이어
 */
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// ==================== 타입 정의 ====================

export interface RegexRule {
  id: number;
  ruleName: string;
  description?: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  isActive: boolean;
  metadataTags?: Record<string, any>;
  testCases?: TestCase[];
  testExamples?: string[];
  usageCount: number;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  description?: string;
}

export interface ProcessingResult {
  originalText: string;
  normalizedText: string;
  appliedRuleId?: number;
  appliedRuleName?: string;
  extractedMetadata?: Record<string, any>;
  processingTimeMs: number;
  success: boolean;
  errorMessage?: string;
}

export interface RuleTestResult {
  ruleId: number;
  ruleName: string;
  testResults: TestCaseResult[];
  successRate: number;
}

export interface TestCaseResult {
  input: string;
  output?: string;
  expected?: string;
  metadata?: Record<string, any>;
  processingTime: number;
  success: boolean;
  errorMessage?: string;
}

export interface CreateRuleRequest {
  ruleName: string;
  description?: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority?: number;
  metadataTags?: Record<string, any>;
  testCases?: TestCase[];
}

export interface BulkTestRequest {
  testInputs: string[];
  ruleIds?: number[];
  category?: string;
}

export interface BulkTestResult {
  totalTests: number;
  successCount: number;
  failureCount: number;
  averageProcessingTime: number;
  results: ProcessingResult[];
  performanceStats: PerformanceStats;
}

export interface PerformanceStats {
  totalRules: number;
  activeRules: number;
  processingAccuracy: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  dailyProcessingCount: number;
  errorRate: number;
  topCategories: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  ruleCount: number;
  usageCount: number;
  averageSuccessRate: number;
  avgProcessingTime: number;
}

export interface ConflictAnalysis {
  ruleId: number;
  ruleName: string;
  conflictingRuleId: number;
  conflictingRuleName: string;
  overlapPercentage: number;
  impactLevel: 'critical' | 'warning' | 'info';
  suggestedResolution: string[];
  affectedTransactionsPerDay: number;
  conflictType: 'pattern_overlap' | 'priority_conflict' | 'output_mismatch';
  testSamples: ConflictTestSample[];
}

export interface ConflictTestSample {
  input: string;
  rule1Output: string;
  rule2Output: string;
  winningRule: number;
}

export interface ConflictResolutionSuggestion {
  type:
    | 'priority_adjustment'
    | 'pattern_modification'
    | 'rule_merge'
    | 'rule_split';
  description: string;
  confidence: number;
  estimatedImprovement: number;
  implementation: string;
}

// ==================== 핵심 전처리 엔진 ====================

export class RegexPreprocessingEngine {
  private static instance: RegexPreprocessingEngine;
  private rulesCache: Map<string, RegexRule[]> = new Map();
  private patternCache: Map<string, RegExp> = new Map();

  static getInstance(): RegexPreprocessingEngine {
    if (!RegexPreprocessingEngine.instance) {
      RegexPreprocessingEngine.instance = new RegexPreprocessingEngine();
    }
    return RegexPreprocessingEngine.instance;
  }

  /**
   * 메인 전처리 메서드
   */
  async preprocess(originalText: string): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // 1. 활성 규칙 조회 (우선순위 순)
      const rules = await this.getActiveRules();

      // 2. 규칙 적용
      const result = await this.applyRules(originalText, rules);

      // 3. 처리 시간 계산
      const processingTimeMs = Date.now() - startTime;

      // 4. 로그 저장
      await this.logProcessing(originalText, { ...result, processingTimeMs });

      return { ...result, processingTimeMs };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;

      const errorResult: ProcessingResult = {
        originalText,
        normalizedText: originalText,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs,
      };

      await this.logProcessing(originalText, errorResult);
      return errorResult;
    }
  }

  /**
   * 정규식 규칙 적용
   */
  private async applyRules(
    text: string,
    rules: RegexRule[]
  ): Promise<Omit<ProcessingResult, 'processingTimeMs'>> {
    for (const rule of rules) {
      try {
        const pattern = this.getCompiledPattern(rule.inputPattern);
        const match = pattern.exec(text);

        if (match) {
          // 매칭된 규칙 적용
          const normalizedText = this.applyOutputTemplate(
            match,
            rule.outputTemplate
          );
          const metadata = this.extractMetadata(match, rule);

          // 사용 횟수 증가
          await this.incrementUsageCount(rule.id);

          return {
            originalText: text,
            normalizedText,
            appliedRuleId: rule.id,
            appliedRuleName: rule.ruleName,
            extractedMetadata: metadata,
            success: true,
          };
        }
      } catch (error) {
        console.warn(`Rule ${rule.id} (${rule.ruleName}) failed:`, error);
        continue;
      }
    }

    // 매칭되는 규칙이 없는 경우 기본 정규화
    return {
      originalText: text,
      normalizedText: this.defaultNormalize(text),
      success: true,
    };
  }

  /**
   * 출력 템플릿 적용
   */
  private applyOutputTemplate(
    match: RegExpExecArray,
    template: string
  ): string {
    let result = template;

    // $1, $2, ... 치환
    for (let i = 1; i < match.length; i++) {
      result = result.replace(new RegExp(`\\$${i}`, 'g'), match[i] || '');
    }

    return result.trim();
  }

  /**
   * 메타데이터 추출
   */
  private extractMetadata(
    match: RegExpExecArray,
    rule: RegexRule
  ): Record<string, any> {
    const metadata: Record<string, any> = {
      ...rule.metadataTags,
      matchedGroups: match.slice(1),
      fullMatch: match[0],
    };

    return metadata;
  }

  /**
   * 기본 정규화 (규칙이 매칭되지 않은 경우)
   */
  private defaultNormalize(text: string): string {
    return text
      .replace(/[^\w가-힣\s]/g, ' ') // 특수문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 정리
      .trim();
  }

  /**
   * 활성 규칙 조회 (캐시 포함)
   */
  private async getActiveRules(): Promise<RegexRule[]> {
    const cacheKey = 'active_rules';

    if (this.rulesCache.has(cacheKey)) {
      return this.rulesCache.get(cacheKey)!;
    }

    const rules = await prisma.regexPreprocessingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
      include: {
        category_ref: true,
      },
    });

    const formattedRules: RegexRule[] = rules.map(rule => ({
      id: Number(rule.id),
      ruleName: rule.ruleName,
      description: rule.description || undefined,
      category: rule.category,
      inputPattern: rule.inputPattern,
      outputTemplate: rule.outputTemplate,
      priority: rule.priority,
      isActive: rule.isActive,
      metadataTags: (rule.metadataTags as Record<string, any>) || undefined,
      testCases: (rule.testCases as TestCase[]) || undefined,
      testExamples: (rule.testExamples as string[]) || undefined,
      usageCount: Number(rule.usageCount),
      successRate: rule.successRate ? Number(rule.successRate) : undefined,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }));

    // 5분간 캐시
    this.rulesCache.set(cacheKey, formattedRules);
    setTimeout(() => this.rulesCache.delete(cacheKey), 5 * 60 * 1000);

    return formattedRules;
  }

  /**
   * 정규식 패턴 컴파일 (캐시 포함)
   */
  private getCompiledPattern(pattern: string): RegExp {
    if (!this.patternCache.has(pattern)) {
      this.patternCache.set(pattern, new RegExp(pattern, 'gi'));
    }
    return this.patternCache.get(pattern)!;
  }

  /**
   * 사용 횟수 증가
   */
  private async incrementUsageCount(ruleId: number): Promise<void> {
    await prisma.regexPreprocessingRule.update({
      where: { id: BigInt(ruleId) },
      data: { usageCount: { increment: 1 } },
    });
  }

  /**
   * 처리 로그 저장
   */
  private async logProcessing(
    originalText: string,
    result: ProcessingResult
  ): Promise<void> {
    try {
      await prisma.regexPreprocessingLog.create({
        data: {
          originalText,
          normalizedText: result.normalizedText,
          appliedRuleId: result.appliedRuleId
            ? BigInt(result.appliedRuleId)
            : null,
          appliedRuleName: result.appliedRuleName,
          extractedMetadata: result.extractedMetadata,
          processingTimeMs: result.processingTimeMs,
          success: result.success,
          errorMessage: result.errorMessage,
        },
      });
    } catch (error) {
      console.error('Failed to log processing:', error);
    }
  }
}

// ==================== 규칙 관리 서비스 ====================

export class RegexRuleManagementService {
  private static instance: RegexRuleManagementService;

  static getInstance(): RegexRuleManagementService {
    if (!RegexRuleManagementService.instance) {
      RegexRuleManagementService.instance = new RegexRuleManagementService();
    }
    return RegexRuleManagementService.instance;
  }

  /**
   * 규칙 목록 조회
   */
  async getRules(filters?: {
    category?: string;
    active?: boolean;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<RegexRule[]> {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    const orderBy: any = {};
    switch (filters?.sortBy) {
      case 'priority':
        orderBy.priority = 'desc';
        break;
      case 'usage':
        orderBy.usageCount = 'desc';
        break;
      case 'name':
        orderBy.ruleName = 'asc';
        break;
      default:
        orderBy.priority = 'desc';
    }

    const rules = await prisma.regexPreprocessingRule.findMany({
      where,
      orderBy,
      take: filters?.limit,
      skip: filters?.offset,
      include: {
        category_ref: true,
      },
    });

    return rules.map(rule => ({
      id: Number(rule.id),
      ruleName: rule.ruleName,
      description: rule.description || undefined,
      category: rule.category,
      inputPattern: rule.inputPattern,
      outputTemplate: rule.outputTemplate,
      priority: rule.priority,
      isActive: rule.isActive,
      metadataTags: (rule.metadataTags as Record<string, any>) || undefined,
      testCases: (rule.testCases as TestCase[]) || undefined,
      testExamples: (rule.testExamples as string[]) || undefined,
      usageCount: Number(rule.usageCount),
      successRate: rule.successRate ? Number(rule.successRate) : undefined,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }));
  }

  /**
   * 규칙 생성
   */
  async createRule(request: CreateRuleRequest): Promise<RegexRule> {
    // 1. 정규식 패턴 검증
    this.validateRegexPattern(request.inputPattern);

    // 2. 테스트 케이스 검증
    if (request.testCases) {
      await this.validateTestCases(
        request.inputPattern,
        request.outputTemplate,
        request.testCases
      );
    }

    // 3. 규칙 저장
    const rule = await prisma.regexPreprocessingRule.create({
      data: {
        ruleName: request.ruleName,
        description: request.description,
        category: request.category,
        inputPattern: request.inputPattern,
        outputTemplate: request.outputTemplate,
        priority: request.priority || 100,
        metadataTags: request.metadataTags,
        testCases: request.testCases,
      },
      include: {
        category_ref: true,
      },
    });

    // 4. 캐시 무효화
    this.invalidateCache();

    return {
      id: Number(rule.id),
      ruleName: rule.ruleName,
      description: rule.description || undefined,
      category: rule.category,
      inputPattern: rule.inputPattern,
      outputTemplate: rule.outputTemplate,
      priority: rule.priority,
      isActive: rule.isActive,
      metadataTags: (rule.metadataTags as Record<string, any>) || undefined,
      testCases: (rule.testCases as TestCase[]) || undefined,
      testExamples: (rule.testExamples as string[]) || undefined,
      usageCount: Number(rule.usageCount),
      successRate: rule.successRate ? Number(rule.successRate) : undefined,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }

  /**
   * 규칙 테스트 실행
   */
  async testRule(
    ruleId: number,
    testInputs: string[]
  ): Promise<RuleTestResult> {
    const rule = await prisma.regexPreprocessingRule.findUnique({
      where: { id: BigInt(ruleId) },
    });

    if (!rule) {
      throw new Error('Rule not found');
    }

    const results: TestCaseResult[] = [];
    const engine = RegexPreprocessingEngine.getInstance();

    for (const input of testInputs) {
      const startTime = Date.now();

      try {
        const pattern = new RegExp(rule.inputPattern, 'gi');
        const match = pattern.exec(input);

        if (match) {
          const output = this.applyTemplate(match, rule.outputTemplate);
          const metadata = {
            matchedGroups: match.slice(1),
            fullMatch: match[0],
          };

          results.push({
            input,
            output,
            metadata,
            processingTime: Date.now() - startTime,
            success: true,
          });
        } else {
          results.push({
            input,
            processingTime: Date.now() - startTime,
            success: false,
            errorMessage: 'Pattern did not match',
          });
        }
      } catch (error) {
        results.push({
          input,
          processingTime: Date.now() - startTime,
          success: false,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;

    return {
      ruleId,
      ruleName: rule.ruleName,
      testResults: results,
      successRate,
    };
  }

  /**
   * 규칙 조회 (ID로)
   */
  async getRuleById(id: number): Promise<RegexRule | null> {
    const rule = await prisma.regexPreprocessingRule.findUnique({
      where: { id: BigInt(id) },
      include: {
        category_ref: true,
      },
    });

    if (!rule) {
      return null;
    }

    return {
      id: Number(rule.id),
      ruleName: rule.ruleName,
      description: rule.description || undefined,
      category: rule.category,
      inputPattern: rule.inputPattern,
      outputTemplate: rule.outputTemplate,
      priority: rule.priority,
      isActive: rule.isActive,
      metadataTags: (rule.metadataTags as Record<string, any>) || undefined,
      testCases: (rule.testCases as TestCase[]) || undefined,
      testExamples: (rule.testExamples as string[]) || undefined,
      usageCount: Number(rule.usageCount),
      successRate: rule.successRate ? Number(rule.successRate) : undefined,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }

  /**
   * 규칙 수정
   */
  async updateRule(
    id: number,
    request: Partial<CreateRuleRequest>
  ): Promise<RegexRule> {
    // 1. 기존 규칙 존재 확인
    const existingRule = await prisma.regexPreprocessingRule.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRule) {
      throw new Error('Rule not found');
    }

    // 2. 정규식 패턴 검증 (패턴이 변경된 경우)
    if (
      request.inputPattern &&
      request.inputPattern !== existingRule.inputPattern
    ) {
      this.validateRegexPattern(request.inputPattern);
    }

    // 3. 테스트 케이스 검증 (패턴이나 템플릿이 변경된 경우)
    if (request.testCases && (request.inputPattern || request.outputTemplate)) {
      const pattern = request.inputPattern || existingRule.inputPattern;
      const template = request.outputTemplate || existingRule.outputTemplate;
      await this.validateTestCases(pattern, template, request.testCases);
    }

    // 4. 규칙 업데이트
    const updatedRule = await prisma.regexPreprocessingRule.update({
      where: { id: BigInt(id) },
      data: {
        ...(request.ruleName && { ruleName: request.ruleName }),
        ...(request.description !== undefined && {
          description: request.description,
        }),
        ...(request.category && { category: request.category }),
        ...(request.inputPattern && { inputPattern: request.inputPattern }),
        ...(request.outputTemplate && {
          outputTemplate: request.outputTemplate,
        }),
        ...(request.priority !== undefined && { priority: request.priority }),
        ...(request.isActive !== undefined && { isActive: request.isActive }),
        ...(request.metadataTags !== undefined && {
          metadataTags: request.metadataTags,
        }),
        ...(request.testCases !== undefined && {
          testCases: request.testCases,
        }),
        updatedAt: new Date(),
      },
      include: {
        category_ref: true,
      },
    });

    // 5. 캐시 무효화
    this.invalidateCache();

    return {
      id: Number(updatedRule.id),
      ruleName: updatedRule.ruleName,
      description: updatedRule.description || undefined,
      category: updatedRule.category,
      inputPattern: updatedRule.inputPattern,
      outputTemplate: updatedRule.outputTemplate,
      priority: updatedRule.priority,
      isActive: updatedRule.isActive,
      metadataTags:
        (updatedRule.metadataTags as Record<string, any>) || undefined,
      testCases: (updatedRule.testCases as TestCase[]) || undefined,
      usageCount: Number(updatedRule.usageCount),
      successRate: updatedRule.successRate
        ? Number(updatedRule.successRate)
        : undefined,
      createdAt: updatedRule.createdAt.toISOString(),
      updatedAt: updatedRule.updatedAt.toISOString(),
    };
  }

  /**
   * 규칙 삭제
   */
  async deleteRule(id: number): Promise<void> {
    // 1. 기존 규칙 존재 확인
    const existingRule = await prisma.regexPreprocessingRule.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRule) {
      throw new Error('Rule not found');
    }

    // 2. 관련 로그 데이터도 함께 삭제 (cascade)
    await prisma.$transaction([
      // 로그 데이터 삭제
      prisma.regexPreprocessingLog.deleteMany({
        where: { appliedRuleId: BigInt(id) },
      }),
      // 규칙 삭제
      prisma.regexPreprocessingRule.delete({
        where: { id: BigInt(id) },
      }),
    ]);

    // 3. 캐시 무효화
    this.invalidateCache();
  }

  /**
   * 카테고리별 규칙 조회
   */
  async getRulesByCategory(category: string): Promise<RegexRule[]> {
    const rules = await prisma.regexPreprocessingRule.findMany({
      where: { category },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        category_ref: true,
      },
    });

    return rules.map(rule => ({
      id: Number(rule.id),
      ruleName: rule.ruleName,
      description: rule.description || undefined,
      category: rule.category,
      inputPattern: rule.inputPattern,
      outputTemplate: rule.outputTemplate,
      priority: rule.priority,
      isActive: rule.isActive,
      metadataTags: (rule.metadataTags as Record<string, any>) || undefined,
      testCases: (rule.testCases as TestCase[]) || undefined,
      testExamples: (rule.testExamples as string[]) || undefined,
      usageCount: Number(rule.usageCount),
      successRate: rule.successRate ? Number(rule.successRate) : undefined,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }));
  }

  /**
   * 정규식 패턴 검증
   */
  private validateRegexPattern(pattern: string): void {
    try {
      new RegExp(pattern);
    } catch (error) {
      throw new Error(
        `Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // ReDoS 위험 패턴 검사
    const dangerousPatterns = [
      /(\.\*){2,}/, // 중첩된 .* 패턴
      /(\+\*|\*\+)/, // +* 또는 *+ 조합
      /((\w\+\*)|(\w\*\+))/, // word character와 +* 조합
    ];

    for (const dangerous of dangerousPatterns) {
      if (dangerous.test(pattern)) {
        throw new Error(
          'Potentially dangerous regex pattern detected (ReDoS risk)'
        );
      }
    }
  }

  /**
   * 테스트 케이스 검증
   */
  private async validateTestCases(
    pattern: string,
    template: string,
    testCases: TestCase[]
  ): Promise<void> {
    const regex = new RegExp(pattern, 'gi');

    for (const testCase of testCases) {
      const match = regex.exec(testCase.input);
      if (match) {
        const output = this.applyTemplate(match, template);
        if (output !== testCase.expected) {
          console.warn(
            `Test case validation warning: expected "${testCase.expected}", got "${output}"`
          );
        }
      }
    }
  }

  /**
   * 템플릿 적용
   */
  private applyTemplate(match: RegExpExecArray, template: string): string {
    let result = template;
    for (let i = 1; i < match.length; i++) {
      result = result.replace(new RegExp(`\\$${i}`, 'g'), match[i] || '');
    }
    return result.trim();
  }

  /**
   * 캐시 무효화
   */
  private invalidateCache(): void {
    const engine = RegexPreprocessingEngine.getInstance();
    // @ts-expect-error - private 메서드 접근
    engine.rulesCache.clear();
  }
}

// ==================== 성능 통계 서비스 ====================

export class RegexPerformanceService {
  static async getPerformanceStats(
    period: string = '7d'
  ): Promise<PerformanceStats> {
    const periodDate = this.getPeriodDate(period);

    // 병렬로 통계 데이터 수집
    const [totalRules, activeRules, recentLogs, categoryStats] =
      await Promise.all([
        prisma.regexPreprocessingRule.count(),
        prisma.regexPreprocessingRule.count({ where: { isActive: true } }),
        prisma.regexPreprocessingLog.findMany({
          where: { createdAt: { gte: periodDate } },
          select: {
            success: true,
            processingTimeMs: true,
            appliedRuleName: true,
          },
        }),
        this.getCategoryStats(periodDate),
      ]);

    const successCount = recentLogs.filter(log => log.success).length;
    const totalLogs = recentLogs.length;
    const processingAccuracy =
      totalLogs > 0 ? (successCount / totalLogs) * 100 : 0;

    const avgProcessingTime =
      recentLogs.length > 0
        ? recentLogs.reduce(
            (sum, log) => sum + (log.processingTimeMs || 0),
            0
          ) / recentLogs.length
        : 0;

    const errorRate =
      totalLogs > 0 ? ((totalLogs - successCount) / totalLogs) * 100 : 0;

    return {
      totalRules,
      activeRules,
      processingAccuracy,
      averageProcessingTime: avgProcessingTime,
      cacheHitRate: 85, // TODO: Redis에서 실제 히트율 계산
      dailyProcessingCount: totalLogs,
      errorRate,
      topCategories: categoryStats,
    };
  }

  private static getPeriodDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private static async getCategoryStats(since: Date): Promise<CategoryStats[]> {
    const stats = await prisma.regexPreprocessingRule.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { usageCount: true },
      _avg: { successRate: true },
      where: { isActive: true },
    });

    return stats.map(stat => ({
      category: stat.category,
      ruleCount: stat._count.id,
      usageCount: Number(stat._sum.usageCount) || 0,
      averageSuccessRate: Number(stat._avg.successRate) || 0,
      avgProcessingTime: 0, // TODO: 로그에서 계산
    }));
  }
}

// ==================== 충돌 감지 서비스 ====================

export class RegexConflictDetectionService {
  private static instance: RegexConflictDetectionService;

  static getInstance(): RegexConflictDetectionService {
    if (!RegexConflictDetectionService.instance) {
      RegexConflictDetectionService.instance =
        new RegexConflictDetectionService();
    }
    return RegexConflictDetectionService.instance;
  }

  /**
   * 모든 활성 규칙에 대한 충돌 분석 수행
   */
  async analyzeAllConflicts(): Promise<ConflictAnalysis[]> {
    const rules = await prisma.regexPreprocessingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    const conflicts: ConflictAnalysis[] = [];

    // 모든 규칙 쌍에 대해 충돌 검사
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];

        const conflict = await this.analyzeRulePairConflict(rule1, rule2);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts.sort((a, b) => b.overlapPercentage - a.overlapPercentage);
  }

  /**
   * 두 규칙 간의 충돌 분석
   */
  private async analyzeRulePairConflict(
    rule1: any,
    rule2: any
  ): Promise<ConflictAnalysis | null> {
    try {
      // 테스트 샘플 생성 (기존 테스트 케이스 + 자동 생성)
      const testSamples = await this.generateTestSamples(rule1, rule2);

      if (testSamples.length === 0) {
        return null;
      }

      // 패턴 겹침 분석
      const overlapInfo = this.analyzePatternOverlap(rule1, rule2, testSamples);

      if (overlapInfo.overlapPercentage < 10) {
        return null; // 10% 미만 겹침은 무시
      }

      // 충돌 유형 및 심각도 결정
      const impactLevel = this.determineImpactLevel(
        overlapInfo.overlapPercentage,
        rule1.priority,
        rule2.priority
      );
      const conflictType = this.determineConflictType(
        rule1,
        rule2,
        overlapInfo
      );

      // 해결 방안 제안
      const suggestedResolution = this.generateResolutionSuggestions(
        rule1,
        rule2,
        overlapInfo,
        conflictType
      );

      return {
        ruleId: Number(rule1.id),
        ruleName: rule1.ruleName,
        conflictingRuleId: Number(rule2.id),
        conflictingRuleName: rule2.ruleName,
        overlapPercentage: overlapInfo.overlapPercentage,
        impactLevel,
        suggestedResolution,
        affectedTransactionsPerDay: overlapInfo.affectedCount,
        conflictType,
        testSamples: overlapInfo.conflictSamples,
      };
    } catch (error) {
      console.error(
        `Error analyzing conflict between rules ${rule1.id} and ${rule2.id}:`,
        error
      );
      return null;
    }
  }

  /**
   * 테스트 샘플 생성
   */
  private async generateTestSamples(rule1: any, rule2: any): Promise<string[]> {
    const samples: string[] = [];

    // 1. 각 규칙의 기존 테스트 케이스 활용
    if (rule1.testCases) {
      const testCases = Array.isArray(rule1.testCases)
        ? rule1.testCases
        : JSON.parse(rule1.testCases || '[]');
      samples.push(...testCases.map((tc: any) => tc.input));
    }

    if (rule2.testCases) {
      const testCases = Array.isArray(rule2.testCases)
        ? rule2.testCases
        : JSON.parse(rule2.testCases || '[]');
      samples.push(...testCases.map((tc: any) => tc.input));
    }

    // 2. 최근 처리 로그에서 샘플 추출
    const recentLogs = await prisma.regexPreprocessingLog.findMany({
      where: {
        OR: [{ appliedRuleId: rule1.id }, { appliedRuleId: rule2.id }],
      },
      select: { originalText: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    samples.push(...recentLogs.map(log => log.originalText));

    // 3. 카테고리별 공통 패턴 생성
    if (rule1.category === rule2.category) {
      const categorySpecificSamples = this.generateCategorySpecificSamples(
        rule1.category
      );
      samples.push(...categorySpecificSamples);
    }

    // 중복 제거 및 유효한 샘플만 반환
    return [...new Set(samples)]
      .filter(s => s && s.trim().length > 0)
      .slice(0, 100);
  }

  /**
   * 카테고리별 특화 테스트 샘플 생성
   */
  private generateCategorySpecificSamples(category: string): string[] {
    const sampleMap: Record<string, string[]> = {
      법인구조: [
        '주식회사 테스트기업',
        '(주)샘플회사',
        '(유)한국상사',
        '사단법인 테스트협회',
        '주식회사테스트',
        '(주) 공백테스트',
      ],
      주유소: [
        'GS칼텍스 서울(상)주',
        'Shell 강남(하)주',
        'SK에너지 부산(상)주',
        '현대오일뱅크 대구(하)주',
        'GS칼텍스셀프 직영점',
        'S-OIL 고속도로주유소',
      ],
      해외서비스: [
        'NETFLIX COM BILL',
        'CLAUDE.AI SUBSCRIPTION',
        'GOOGLE PAYMENT KOREA',
        'AMAZON PRIME VIDEO',
        'SPOTIFY PREMIUM',
        'MICROSOFT OFFICE 365',
      ],
      카페: [
        '스타벅스 강남역점',
        '이디야커피 홍대점',
        '할리스커피 신촌',
        '카페베네 명동',
        '투썸플레이스 강남',
        '빽다방 신림점',
      ],
    };

    return sampleMap[category] || [];
  }

  /**
   * 패턴 겹침 분석
   */
  private analyzePatternOverlap(
    rule1: any,
    rule2: any,
    testSamples: string[]
  ): {
    overlapPercentage: number;
    affectedCount: number;
    conflictSamples: ConflictTestSample[];
  } {
    const conflictSamples: ConflictTestSample[] = [];
    let overlapCount = 0;

    for (const sample of testSamples) {
      try {
        const regex1 = new RegExp(rule1.inputPattern, 'gi');
        const regex2 = new RegExp(rule2.inputPattern, 'gi');

        const match1 = regex1.exec(sample);
        const match2 = regex2.exec(sample);

        // 두 패턴 모두 매칭되는 경우
        if (match1 && match2) {
          overlapCount++;

          // 출력 결과 계산
          const output1 = this.applyTemplate(match1, rule1.outputTemplate);
          const output2 = this.applyTemplate(match2, rule2.outputTemplate);

          // 우선순위가 높은 규칙이 승리
          const winningRule =
            rule1.priority >= rule2.priority
              ? Number(rule1.id)
              : Number(rule2.id);

          conflictSamples.push({
            input: sample,
            rule1Output: output1,
            rule2Output: output2,
            winningRule,
          });
        }
      } catch (error) {
        // 정규식 오류는 무시
        continue;
      }
    }

    const overlapPercentage =
      testSamples.length > 0 ? (overlapCount / testSamples.length) * 100 : 0;

    return {
      overlapPercentage,
      affectedCount: Math.round(overlapCount * 10), // 추정치 (일일 처리량 기준)
      conflictSamples: conflictSamples.slice(0, 10), // 최대 10개 샘플만
    };
  }

  /**
   * 템플릿 적용
   */
  private applyTemplate(match: RegExpExecArray, template: string): string {
    let result = template;
    for (let i = 1; i < match.length; i++) {
      result = result.replace(new RegExp(`\\$${i}`, 'g'), match[i] || '');
    }
    return result.trim();
  }

  /**
   * 충돌 심각도 결정
   */
  private determineImpactLevel(
    overlapPercentage: number,
    priority1: number,
    priority2: number
  ): 'critical' | 'warning' | 'info' {
    // 높은 겹침률이고 우선순위가 비슷한 경우
    if (overlapPercentage >= 70 && Math.abs(priority1 - priority2) <= 10) {
      return 'critical';
    }

    // 중간 정도 겹침이거나 우선순위 차이가 있는 경우
    if (overlapPercentage >= 40 || Math.abs(priority1 - priority2) <= 5) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * 충돌 유형 결정
   */
  private determineConflictType(
    rule1: any,
    rule2: any,
    overlapInfo: any
  ): 'pattern_overlap' | 'priority_conflict' | 'output_mismatch' {
    // 우선순위가 같거나 매우 비슷한 경우
    if (Math.abs(rule1.priority - rule2.priority) <= 5) {
      return 'priority_conflict';
    }

    // 출력이 다른 경우가 많은 경우
    const differentOutputs = overlapInfo.conflictSamples.filter(
      (sample: ConflictTestSample) => sample.rule1Output !== sample.rule2Output
    ).length;

    if (differentOutputs / overlapInfo.conflictSamples.length > 0.7) {
      return 'output_mismatch';
    }

    return 'pattern_overlap';
  }

  /**
   * 해결 방안 제안
   */
  private generateResolutionSuggestions(
    rule1: any,
    rule2: any,
    overlapInfo: any,
    conflictType: string
  ): string[] {
    const suggestions: string[] = [];

    switch (conflictType) {
      case 'priority_conflict':
        suggestions.push(
          `우선순위 조정: "${rule1.ruleName}"과 "${rule2.ruleName}"의 우선순위를 10 이상 차이나게 설정`
        );
        suggestions.push('더 구체적인 규칙을 높은 우선순위로 설정');
        break;

      case 'output_mismatch':
        suggestions.push('출력 템플릿 통일 검토');
        suggestions.push('규칙 통합 또는 분리 고려');
        suggestions.push('더 구체적인 패턴으로 분리');
        break;

      case 'pattern_overlap':
        suggestions.push('패턴을 더 구체적으로 수정하여 겹침 최소화');
        suggestions.push('제외 조건(negative lookahead) 추가 고려');
        suggestions.push('카테고리 재분류 검토');
        break;
    }

    // 공통 제안
    if (overlapInfo.overlapPercentage > 80) {
      suggestions.push('두 규칙을 하나로 통합하는 것을 고려');
    }

    if (rule1.category === rule2.category) {
      suggestions.push('같은 카테고리 내에서 패턴 세분화');
    }

    return suggestions;
  }

  /**
   * 특정 규칙의 충돌 분석
   */
  async analyzeRuleConflicts(ruleId: number): Promise<ConflictAnalysis[]> {
    const targetRule = await prisma.regexPreprocessingRule.findUnique({
      where: { id: BigInt(ruleId) },
    });

    if (!targetRule) {
      throw new Error('Rule not found');
    }

    const otherRules = await prisma.regexPreprocessingRule.findMany({
      where: {
        isActive: true,
        id: { not: BigInt(ruleId) },
      },
      orderBy: { priority: 'desc' },
    });

    const conflicts: ConflictAnalysis[] = [];

    for (const otherRule of otherRules) {
      const conflict = await this.analyzeRulePairConflict(
        targetRule,
        otherRule
      );
      if (conflict) {
        conflicts.push(conflict);
      }
    }

    return conflicts.sort((a, b) => b.overlapPercentage - a.overlapPercentage);
  }
}

// ==================== 기본 카테고리 데이터 초기화 ====================

export async function initializeDefaultCategories(): Promise<void> {
  const defaultCategories = [
    {
      name: '법인구조',
      description: '법인 형태 표시자 정규화',
      icon: 'building',
      color: '#3B82F6',
    },
    {
      name: '주유소',
      description: '주유소 거래 정규화',
      icon: 'fuel',
      color: '#EF4444',
    },
    {
      name: '마트',
      description: '대형마트/백화점 정규화',
      icon: 'shopping-cart',
      color: '#10B981',
    },
    {
      name: '해외서비스',
      description: '해외 서비스 거래 정규화',
      icon: 'globe',
      color: '#8B5CF6',
    },
    {
      name: '공공기관',
      description: '정부/공공기관 거래 정규화',
      icon: 'landmark',
      color: '#F59E0B',
    },
    {
      name: '카페',
      description: '카페/커피전문점 정규화',
      icon: 'coffee',
      color: '#8B4513',
    },
    {
      name: '편의점',
      description: '편의점 거래 정규화',
      icon: 'store',
      color: '#06B6D4',
    },
    { name: '기타', description: '기타 패턴', icon: 'tag', color: '#6B7280' },
  ];

  for (const category of defaultCategories) {
    await prisma.regexPreprocessingCategory.upsert({
      where: { categoryName: category.name },
      update: {},
      create: {
        categoryName: category.name,
        description: category.description,
        iconName: category.icon,
        colorHex: category.color,
        displayOrder: defaultCategories.indexOf(category),
      },
    });
  }
}
