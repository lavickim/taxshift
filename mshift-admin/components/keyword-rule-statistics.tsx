'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Hash, 
  Tags, 
  Target, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Users, 
  Clock,
  RefreshCw
} from "lucide-react";

interface CategoryStats {
  category: string;
  keywordGroups: number;
  tagMappings: number;
  accountMappings: number;
  averageConfidence: number;
  color: string;
}

interface TagStats {
  tagName: string;
  tagCategory: string;
  keywordMappings: number;
  accountMappings: number;
  usageCount: number;
  averageConfidence: number;
  isActive: boolean;
}

interface KeywordGroupStats {
  groupName: string;
  primaryKeyword: string;
  synonymCount: number;
  category: string;
  tagMappings: number;
  confidence: number;
  isActive: boolean;
}

interface SystemOverview {
  totalKeywordGroups: number;
  totalTags: number;
  totalKeywordTagMappings: number;
  totalTagAccountMappings: number;
  averageSystemConfidence: number;
  activeRulesPercentage: number;
}

export function KeywordRuleStatistics() {
  const [loading, setLoading] = useState(false);
  const [systemOverview, setSystemOverview] = useState<SystemOverview>({
    totalKeywordGroups: 0,
    totalTags: 0,
    totalKeywordTagMappings: 0,
    totalTagAccountMappings: 0,
    averageSystemConfidence: 0,
    activeRulesPercentage: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [keywordGroupStats, setKeywordGroupStats] = useState<KeywordGroupStats[]>([]);

  useEffect(() => {
    loadAllStatistics();
  }, []);

  const loadAllStatistics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSystemOverview(),
        loadCategoryStats(),
        loadTagStats(),
        loadKeywordGroupStats()
      ]);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemOverview = async () => {
    try {
      const response = await fetch('/api/v2/tag-mapping/stats/overview');
      if (response.ok) {
        const data = await response.json();
        setSystemOverview(data);
      }
    } catch (error) {
      console.error('Error loading system overview:', error);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const response = await fetch('/api/v2/tag-mapping/stats/categories');
      if (response.ok) {
        const data = await response.json();
        setCategoryStats(data);
      } else {
        // Mock data for demonstration
        setCategoryStats([
          { category: '편의점', keywordGroups: 4, tagMappings: 4, accountMappings: 1, averageConfidence: 0.89, color: '#3B82F6' },
          { category: '주유소', keywordGroups: 4, tagMappings: 4, accountMappings: 1, averageConfidence: 0.88, color: '#EF4444' },
          { category: '음식점', keywordGroups: 2, tagMappings: 2, accountMappings: 1, averageConfidence: 0.92, color: '#10B981' },
          { category: '카페', keywordGroups: 0, tagMappings: 0, accountMappings: 1, averageConfidence: 0.85, color: '#8B5CF6' },
          { category: '온라인쇼핑', keywordGroups: 2, tagMappings: 2, accountMappings: 1, averageConfidence: 0.87, color: '#F59E0B' },
          { category: '교통', keywordGroups: 1, tagMappings: 1, accountMappings: 1, averageConfidence: 0.90, color: '#6366F1' },
          { category: '의료', keywordGroups: 0, tagMappings: 0, accountMappings: 1, averageConfidence: 0.85, color: '#EC4899' },
        ]);
      }
    } catch (error) {
      console.error('Error loading category stats:', error);
    }
  };

  const loadTagStats = async () => {
    try {
      const response = await fetch('/api/v2/tag-mapping/stats/tags');
      if (response.ok) {
        const data = await response.json();
        setTagStats(data);
      } else {
        // Mock data for demonstration
        setTagStats([
          { tagName: '편의점', tagCategory: '업종', keywordMappings: 4, accountMappings: 1, usageCount: 156, averageConfidence: 0.89, isActive: true },
          { tagName: '주유소', tagCategory: '업종', keywordMappings: 4, accountMappings: 1, usageCount: 89, averageConfidence: 0.88, isActive: true },
          { tagName: '음식점', tagCategory: '업종', keywordMappings: 2, accountMappings: 1, usageCount: 234, averageConfidence: 0.92, isActive: true },
          { tagName: '카페', tagCategory: '업종', keywordMappings: 0, accountMappings: 1, usageCount: 67, averageConfidence: 0.85, isActive: true },
          { tagName: '온라인쇼핑', tagCategory: '업종', keywordMappings: 2, accountMappings: 1, usageCount: 123, averageConfidence: 0.87, isActive: true },
          { tagName: '교통비', tagCategory: '비용', keywordMappings: 1, accountMappings: 1, usageCount: 45, averageConfidence: 0.90, isActive: true },
          { tagName: '의료비', tagCategory: '비용', keywordMappings: 0, accountMappings: 1, usageCount: 23, averageConfidence: 0.85, isActive: true },
        ]);
      }
    } catch (error) {
      console.error('Error loading tag stats:', error);
    }
  };

  const loadKeywordGroupStats = async () => {
    try {
      const response = await fetch('/api/v2/tag-mapping/stats/keyword-groups');
      if (response.ok) {
        const data = await response.json();
        setKeywordGroupStats(data);
      } else {
        // Mock data for demonstration
        setKeywordGroupStats([
          { groupName: '세븐일레븐', primaryKeyword: '세븐일레븐', synonymCount: 4, category: '편의점', tagMappings: 1, confidence: 0.92, isActive: true },
          { groupName: 'CU편의점', primaryKeyword: 'CU', synonymCount: 3, category: '편의점', tagMappings: 1, confidence: 0.90, isActive: true },
          { groupName: '이마트24', primaryKeyword: '이마트24', synonymCount: 2, category: '편의점', tagMappings: 1, confidence: 0.89, isActive: true },
          { groupName: 'GS25', primaryKeyword: 'GS25', synonymCount: 2, category: '편의점', tagMappings: 1, confidence: 0.88, isActive: true },
          { groupName: 'GS칼텍스', primaryKeyword: 'GS칼텍스', synonymCount: 3, category: '주유소', tagMappings: 1, confidence: 0.91, isActive: true },
          { groupName: 'SK에너지', primaryKeyword: 'SK에너지', synonymCount: 3, category: '주유소', tagMappings: 1, confidence: 0.90, isActive: true },
          { groupName: '현대오일뱅크', primaryKeyword: '현대오일뱅크', synonymCount: 3, category: '주유소', tagMappings: 1, confidence: 0.89, isActive: true },
          { groupName: 'S-Oil', primaryKeyword: 'S-Oil', synonymCount: 3, category: '주유소', tagMappings: 1, confidence: 0.88, isActive: true },
          { groupName: '맥도날드', primaryKeyword: '맥도날드', synonymCount: 3, category: '음식점', tagMappings: 1, confidence: 0.93, isActive: true },
          { groupName: '롯데리아', primaryKeyword: '롯데리아', synonymCount: 2, category: '음식점', tagMappings: 1, confidence: 0.91, isActive: true },
        ]);
      }
    } catch (error) {
      console.error('Error loading keyword group stats:', error);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      '편의점': '#3B82F6',
      '주유소': '#EF4444',
      '음식점': '#10B981',
      '카페': '#8B5CF6',
      '온라인쇼핑': '#F59E0B',
      '교통': '#6366F1',
      '의료': '#EC4899',
    };
    return colorMap[category] || '#6B7280';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.9) return 'default';
    if (confidence >= 0.8) return 'secondary';
    if (confidence >= 0.7) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">시스템 통계</h3>
          <p className="text-muted-foreground">
            키워드 룰 시스템의 전반적인 현황을 확인합니다.
          </p>
        </div>
        <Button onClick={loadAllStatistics} disabled={loading} variant="outline">
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          새로고침
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">키워드 그룹</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.totalKeywordGroups}</div>
            <p className="text-xs text-muted-foreground">개 그룹</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">태그</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.totalTags}</div>
            <p className="text-xs text-muted-foreground">개 태그</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">키워드-태그 매핑</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.totalKeywordTagMappings}</div>
            <p className="text-xs text-muted-foreground">개 매핑</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">태그-계정 매핑</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemOverview.totalTagAccountMappings}</div>
            <p className="text-xs text-muted-foreground">개 매핑</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 신뢰도</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemOverview.averageSystemConfidence * 100)}%</div>
            <p className="text-xs text-muted-foreground">시스템 신뢰도</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 룰 비율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(systemOverview.activeRulesPercentage)}%</div>
            <p className="text-xs text-muted-foreground">활성 상태</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.category}</span>
                    <Badge variant="secondary" className="ml-2">
                      {category.keywordGroups}개 그룹
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    신뢰도: {Math.round(category.averageConfidence * 100)}%
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">키워드 그룹</div>
                    <div className="font-medium">{category.keywordGroups}개</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">태그 매핑</div>
                    <div className="font-medium">{category.tagMappings}개</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">계정 매핑</div>
                    <div className="font-medium">{category.accountMappings}개</div>
                  </div>
                </div>
                <Progress 
                  value={category.averageConfidence * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tag Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>태그별 상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>태그명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>키워드 매핑</TableHead>
                <TableHead>계정 매핑</TableHead>
                <TableHead>사용 횟수</TableHead>
                <TableHead>평균 신뢰도</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagStats.map((tag) => (
                <TableRow key={tag.tagName}>
                  <TableCell className="font-medium">{tag.tagName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tag.tagCategory}</Badge>
                  </TableCell>
                  <TableCell>{tag.keywordMappings}</TableCell>
                  <TableCell>{tag.accountMappings}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tag.usageCount}회</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getConfidenceBadgeVariant(tag.averageConfidence)}>
                      {Math.round(tag.averageConfidence * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tag.isActive ? "default" : "secondary"}>
                      {tag.isActive ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Keyword Group Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>키워드 그룹별 상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>그룹명</TableHead>
                <TableHead>주 키워드</TableHead>
                <TableHead>동의어 수</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>태그 매핑</TableHead>
                <TableHead>신뢰도</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywordGroupStats.map((group) => (
                <TableRow key={group.groupName}>
                  <TableCell className="font-medium">{group.groupName}</TableCell>
                  <TableCell>{group.primaryKeyword}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{group.synonymCount}개</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getCategoryColor(group.category) }}
                      />
                      {group.category}
                    </div>
                  </TableCell>
                  <TableCell>{group.tagMappings}</TableCell>
                  <TableCell>
                    <Badge variant={getConfidenceBadgeVariant(group.confidence)}>
                      {Math.round(group.confidence * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}