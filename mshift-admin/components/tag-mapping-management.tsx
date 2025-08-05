'use client';

import React, { useEffect, useState } from 'react';

import {
  Edit,
  Hash,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { KeywordRuleStatistics } from './keyword-rule-statistics';
import { KeywordRuleTest } from './keyword-rule-test';

// Types
interface KeywordGroup {
  id: number;
  groupName: string;
  primaryKeyword: string;
  synonyms: string[];
  category: string;
  confidenceBase: number;
  isActive: boolean;
}

interface Tag {
  id: number;
  tagName: string;
  tagDescription?: string;
  category: string;
  isActive: boolean;
}

interface KeywordTagMapping {
  id: number;
  keywordGroupId: number;
  keywordGroup?: KeywordGroup;
  tagId: number;
  tag?: Tag;
  confidenceScore: number;
  priority: number;
  contextRules: any;
  isActive: boolean;
  usageCount: number;
  createdAt?: string;
}

interface TagAccountMapping {
  id: number;
  tagId: number;
  tag?: Tag;
  accountCode: string;
  accountName: string;
  mappingCondition: any;
  isDefault: boolean;
  priority: number;
  confidenceBoost: number;
  createdAt?: string;
}

interface MappingStats {
  totalKeywordTagMappings: number;
  totalTagAccountMappings: number;
  averageConfidence: number;
  topUsedMappings: any[];
}

interface FormData {
  groupName: string;
  primaryKeyword: string;
  synonyms: string;
  category: string;
  confidenceBase: number;
}

const CATEGORIES = [
  '음식점',
  '편의점',
  '주유소',
  '카페',
  '쇼핑',
  '교통',
  '의료',
  '교육',
  '생활서비스',
  '기타',
];

const TagMappingManagement: React.FC = () => {
  // State
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [keywordTagMappings, setKeywordTagMappings] = useState<
    KeywordTagMapping[]
  >([]);
  const [tagAccountMappings, setTagAccountMappings] = useState<
    TagAccountMapping[]
  >([]);
  const [mappingStats, setMappingStats] = useState<MappingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataSourceInfo, setDataSourceInfo] = useState({
    keywordGroups: {
      source: 'unknown',
      responseTime: 0,
      lastUpdated: null as Date | null,
    },
    tags: {
      source: 'unknown',
      responseTime: 0,
      lastUpdated: null as Date | null,
    },
    keywordTagMappings: {
      source: 'unknown',
      responseTime: 0,
      lastUpdated: null as Date | null,
    },
    tagAccountMappings: {
      source: 'unknown',
      responseTime: 0,
      lastUpdated: null as Date | null,
    },
  });

  // Modal states
  const [showCreateKTDialog, setShowCreateKTDialog] = useState(false);
  const [showCreateTADialog, setShowCreateTADialog] = useState(false);
  const [showEditKTDialog, setShowEditKTDialog] = useState(false);
  const [showEditTADialog, setShowEditTADialog] = useState(false);
  const [editingKTMapping, setEditingKTMapping] =
    useState<KeywordTagMapping | null>(null);
  const [editingTAMapping, setEditingTAMapping] =
    useState<TagAccountMapping | null>(null);

  // Keyword group modal states
  const [showCreateKGDialog, setShowCreateKGDialog] = useState(false);
  const [showEditKGDialog, setShowEditKGDialog] = useState(false);
  const [editingKGGroup, setEditingKGGroup] = useState<KeywordGroup | null>(
    null
  );

  // Form data
  const [ktFormData, setKTFormData] = useState({
    keywordGroupId: '',
    tagId: '',
    confidenceScore: 80,
    priority: 1,
    contextRules: '',
  });

  const [taFormData, setTAFormData] = useState({
    tagId: '',
    accountCode: '',
    accountName: '',
    mappingCondition: '',
    isDefault: false,
    priority: 1,
    confidenceBoost: 0,
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKeywordGroups(),
        loadTags(),
        loadKeywordTagMappings(),
        loadTagAccountMappings(),
        loadMappingStats(),
      ]);
    } catch (error) {
      console.error('Load all data error:', error);
      toast.error('데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadKeywordGroups = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/v2/tag-mapping-mgmt/keyword-groups');
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setKeywordGroups(data);

        // 응답 헤더에서 데이터 소스 정보 추출
        const dataSource = response.headers.get('X-Data-Source') || 'api';
        setDataSourceInfo(prev => ({
          ...prev,
          keywordGroups: {
            source: dataSource,
            responseTime,
            lastUpdated: new Date(),
          },
        }));
      }
    } catch (error) {
      console.error('Load keyword groups error:', error);
    }
  };

  const loadTags = async () => {
    try {
      // Get tags from tag-account-mappings data
      const response = await fetch(
        '/api/v2/tag-mapping-mgmt/tag-account-mappings'
      );
      if (response.ok) {
        const mappings = await response.json();
        if (Array.isArray(mappings)) {
          const uniqueTags = mappings
            .map((mapping: any) => mapping.tag)
            .filter((tag: any) => tag && tag.id) // Remove null/undefined tags and tags without id
            .filter(
              (tag: any, index: number, self: any[]) =>
                index === self.findIndex((t: any) => t && t.id === tag.id)
            )
            .map((tag: any) => ({
              id: tag.id,
              tagName: tag.tagName,
              tagDescription: tag.description,
              category: tag.tagCategory,
              isActive: tag.isActive,
            }));
          setTags(uniqueTags);
          console.log('Loaded tags:', uniqueTags.length);
        } else {
          console.log('No mappings data received');
          setTags([]);
        }
      } else {
        console.error('Failed to load tags:', response.status);
        setTags([]);
      }
    } catch (error) {
      console.error('Load tags error:', error);
      setTags([]);
    }
  };

  const loadKeywordTagMappings = async () => {
    const startTime = Date.now();
    try {
      // For now, we'll use the first keyword group to get keyword-tag mappings
      // In a real implementation, this would load all keyword-tag mappings
      const response = await fetch(
        '/api/v2/tag-mapping-mgmt/keyword-tag-mappings'
      );
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setKeywordTagMappings(data);
          console.log('Loaded keyword-tag mappings:', data.length);
        } else {
          console.log('No keyword-tag mappings data received');
          setKeywordTagMappings([]);
        }

        const dataSource = response.headers.get('X-Data-Source') || 'database';
        setDataSourceInfo(prev => ({
          ...prev,
          keywordTagMappings: {
            source: dataSource,
            responseTime,
            lastUpdated: new Date(),
          },
        }));
      } else {
        console.error('Failed to load keyword-tag mappings:', response.status);
        setKeywordTagMappings([]);
      }
    } catch (error) {
      console.error('Load keyword-tag mappings error:', error);
      setKeywordTagMappings([]);
    }
  };

  const loadTagAccountMappings = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(
        '/api/v2/tag-mapping-mgmt/tag-account-mappings'
      );
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setTagAccountMappings(data);
        console.log('Loaded tag-account mappings:', data.length);

        const dataSource = response.headers.get('X-Data-Source') || 'database';
        setDataSourceInfo(prev => ({
          ...prev,
          tagAccountMappings: {
            source: dataSource,
            responseTime,
            lastUpdated: new Date(),
          },
        }));
      } else {
        console.error('Failed to load tag-account mappings:', response.status);
        setTagAccountMappings([]);
      }
    } catch (error) {
      console.error('Load tag-account mappings error:', error);
      setTagAccountMappings([]);
    }
  };

  const loadMappingStats = async () => {
    try {
      // Calculate stats from mapping data directly
      const response = await fetch(
        '/api/v2/tag-mapping-mgmt/mappings?source=database'
      );
      if (response.ok) {
        const mappingsData = await response.json();
        const mappings = Array.isArray(mappingsData) ? mappingsData : [];
        const totalMappings = mappings.length;
        const avgConfidence =
          mappings.length > 0
            ? mappings.reduce(
                (sum: number, mapping: any) => sum + mapping.confidenceScore,
                0
              ) / mappings.length
            : 0;

        const topUsedMappings = mappings
          .sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 5)
          .map((mapping: any) => ({
            keywordGroup: mapping.keywordGroup?.groupName || 'Unknown',
            tag: mapping.tag?.tagName || 'Unknown',
            usageCount: mapping.usageCount || 0,
            confidence: mapping.confidenceScore || 0,
          }));

        setMappingStats({
          totalKeywordTagMappings: totalMappings,
          totalTagAccountMappings: tagAccountMappings.length,
          averageConfidence: avgConfidence,
          topUsedMappings: topUsedMappings,
        });

        console.log('Calculated mapping stats:', {
          totalMappings,
          avgConfidence: avgConfidence.toFixed(2),
          topUsedCount: topUsedMappings.length,
        });
      } else {
        console.error('Failed to load mappings for stats:', response.status);
        setMappingStats({
          totalKeywordTagMappings: 0,
          totalTagAccountMappings: 0,
          averageConfidence: 0,
          topUsedMappings: [],
        });
      }
    } catch (error) {
      console.error('Load mapping stats error:', error);
      setMappingStats({
        totalKeywordTagMappings: 0,
        totalTagAccountMappings: 0,
        averageConfidence: 0,
        topUsedMappings: [],
      });
    }
  };

  const handleCreateKeywordTagMapping = async () => {
    if (!ktFormData.keywordGroupId || !ktFormData.tagId) {
      toast.error('키워드 그룹과 태그를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        keywordGroupId: parseInt(ktFormData.keywordGroupId),
        tagId: parseInt(ktFormData.tagId),
        confidenceScore: ktFormData.confidenceScore / 100,
        priority: ktFormData.priority,
        contextRules: ktFormData.contextRules
          ? JSON.parse(ktFormData.contextRules)
          : null,
      };

      const response = await fetch('/api/v2/tag-mapping-mgmt/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('키워드-태그 매핑이 성공적으로 생성되었습니다.');
        resetKTForm();
        setShowCreateKTDialog(false);
        loadKeywordTagMappings();
      } else {
        const error = await response.json();
        toast.error(`매핑 생성 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('매핑 생성 중 오류가 발생했습니다.');
      console.error('Create KT mapping error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTagAccountMapping = async () => {
    if (
      !taFormData.tagId ||
      !taFormData.accountCode ||
      !taFormData.accountName
    ) {
      toast.error('필수 필드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        tagId: parseInt(taFormData.tagId),
        accountCode: taFormData.accountCode,
        accountName: taFormData.accountName,
        mappingCondition: taFormData.mappingCondition
          ? JSON.parse(taFormData.mappingCondition)
          : null,
        isDefault: taFormData.isDefault,
        priority: taFormData.priority,
        confidenceBoost: taFormData.confidenceBoost / 100,
      };

      const response = await fetch(
        '/api/v2/tag-mapping-mgmt/tag-account-mappings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        toast.success('태그-계정과목 매핑이 성공적으로 생성되었습니다.');
        resetTAForm();
        setShowCreateTADialog(false);
        loadTagAccountMappings();
      } else {
        const error = await response.json();
        toast.error(`매핑 생성 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('매핑 생성 중 오류가 발생했습니다.');
      console.error('Create TA mapping error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetKTForm = () => {
    setKTFormData({
      keywordGroupId: '',
      tagId: '',
      confidenceScore: 80,
      priority: 1,
      contextRules: '',
    });
  };

  const resetTAForm = () => {
    setTAFormData({
      tagId: '',
      accountCode: '',
      accountName: '',
      mappingCondition: '',
      isDefault: false,
      priority: 1,
      confidenceBoost: 0,
    });
  };

  // 데이터 소스 배지 컴포넌트
  const DataSourceBadge = ({
    sourceInfo,
    label,
  }: {
    sourceInfo: any;
    label: string;
  }) => {
    const getSourceColor = (source: string) => {
      const colors = {
        cache: 'bg-green-100 text-green-800',
        database: 'bg-blue-100 text-blue-800',
        api: 'bg-purple-100 text-purple-800',
        unknown: 'bg-gray-100 text-gray-800',
      };
      return colors[source as keyof typeof colors] || colors.unknown;
    };

    const getSourceIcon = (source: string) => {
      const icons = {
        cache: '⚡',
        database: '🗄️',
        api: '🔌',
        unknown: '❓',
      };
      return icons[source as keyof typeof icons] || icons.unknown;
    };

    return (
      <div className='flex items-center gap-2 text-xs'>
        <Badge className={getSourceColor(sourceInfo.source)}>
          {getSourceIcon(sourceInfo.source)} {sourceInfo.source}
        </Badge>
        <span className='text-muted-foreground'>
          {sourceInfo.responseTime}ms
        </span>
        {sourceInfo.lastUpdated && (
          <span className='text-muted-foreground'>
            {new Date(sourceInfo.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>키워드 룰 관리</h2>
          <p className='text-muted-foreground'>
            키워드 그룹, 태그 매핑, 계정과목 연결을 통합 관리합니다.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={loadAllData} disabled={loading} variant='outline'>
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='mr-2 h-4 w-4' />
            )}
            새로고침
          </Button>
        </div>
      </div>

      <Tabs defaultValue='keyword-groups' className='w-full'>
        <TabsList>
          <TabsTrigger value='keyword-groups'>키워드 그룹</TabsTrigger>
          <TabsTrigger value='keyword-tag'>키워드 → 태그</TabsTrigger>
          <TabsTrigger value='tag-account'>태그 → 계정과목</TabsTrigger>
          <TabsTrigger value='test'>룰 테스트</TabsTrigger>
          <TabsTrigger value='statistics'>통계</TabsTrigger>
        </TabsList>

        {/* Keyword Groups Tab */}
        <TabsContent value='keyword-groups' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>키워드 그룹 관리</CardTitle>
                  <DataSourceBadge
                    sourceInfo={dataSourceInfo.keywordGroups}
                    label='키워드 그룹'
                  />
                </div>
                <Dialog
                  open={showCreateKGDialog}
                  onOpenChange={setShowCreateKGDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      키워드 그룹 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>새 키워드 그룹 생성</DialogTitle>
                    </DialogHeader>
                    <div className='py-8 text-center text-muted-foreground'>
                      키워드 그룹 생성 기능은 구현 예정입니다.
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setShowCreateKGDialog(false)}
                      >
                        취소
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>그룹명</TableHead>
                      <TableHead>주 키워드</TableHead>
                      <TableHead>동의어</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>신뢰도</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordGroups.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='py-8 text-center text-muted-foreground'
                        >
                          등록된 키워드 그룹이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      keywordGroups.map(group => (
                        <TableRow key={group.id}>
                          <TableCell className='font-medium'>
                            {group.groupName}
                          </TableCell>
                          <TableCell>{group.primaryKeyword}</TableCell>
                          <TableCell>
                            <div className='flex flex-wrap gap-1'>
                              {group.synonyms
                                .slice(0, 3)
                                .map((synonym, index) => (
                                  <Badge
                                    key={index}
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {synonym}
                                  </Badge>
                                ))}
                              {group.synonyms.length > 3 && (
                                <Badge variant='outline' className='text-xs'>
                                  +{group.synonyms.length - 3}개
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{group.category}</TableCell>
                          <TableCell>
                            {Math.round(group.confidenceBase * 100)}%
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={group.isActive ? 'default' : 'secondary'}
                            >
                              {group.isActive ? '활성' : '비활성'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2'>
                              <Button size='sm' variant='outline'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='outline'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyword → Tag Mappings */}
        <TabsContent value='keyword-tag' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <Hash className='h-5 w-5' />
                    키워드 → 태그 매핑
                  </CardTitle>
                  <DataSourceBadge
                    sourceInfo={dataSourceInfo.keywordTagMappings}
                    label='키워드-태그 매핑'
                  />
                </div>
                <Dialog
                  open={showCreateKTDialog}
                  onOpenChange={setShowCreateKTDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      매핑 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>새 키워드-태그 매핑 생성</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>키워드 그룹 *</Label>
                          <Select
                            value={ktFormData.keywordGroupId}
                            onValueChange={value =>
                              setKTFormData(prev => ({
                                ...prev,
                                keywordGroupId: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='키워드 그룹 선택' />
                            </SelectTrigger>
                            <SelectContent>
                              {keywordGroups.map(group => (
                                <SelectItem
                                  key={group.id}
                                  value={group.id.toString()}
                                >
                                  {group.groupName} ({group.primaryKeyword})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label>태그 *</Label>
                          <Select
                            value={ktFormData.tagId}
                            onValueChange={value =>
                              setKTFormData(prev => ({ ...prev, tagId: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='태그 선택' />
                            </SelectTrigger>
                            <SelectContent>
                              {tags.map(tag => (
                                <SelectItem
                                  key={tag.id}
                                  value={tag.id.toString()}
                                >
                                  {tag.tagName} ({tag.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>신뢰도 (%)</Label>
                          <Input
                            type='number'
                            min='0'
                            max='100'
                            value={ktFormData.confidenceScore}
                            onChange={e =>
                              setKTFormData(prev => ({
                                ...prev,
                                confidenceScore: parseInt(e.target.value) || 80,
                              }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>우선순위</Label>
                          <Input
                            type='number'
                            min='1'
                            value={ktFormData.priority}
                            onChange={e =>
                              setKTFormData(prev => ({
                                ...prev,
                                priority: parseInt(e.target.value) || 1,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label>컨텍스트 규칙 (JSON)</Label>
                        <Textarea
                          placeholder='{"time": "evening", "amount_min": 5000}'
                          value={ktFormData.contextRules}
                          onChange={e =>
                            setKTFormData(prev => ({
                              ...prev,
                              contextRules: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => {
                          resetKTForm();
                          setShowCreateKTDialog(false);
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleCreateKeywordTagMapping}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : null}
                        생성
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>키워드 그룹</TableHead>
                      <TableHead>태그</TableHead>
                      <TableHead>신뢰도</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>사용 횟수</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordTagMappings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='py-8 text-center text-muted-foreground'
                        >
                          등록된 키워드-태그 매핑이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      keywordTagMappings.map(mapping => (
                        <TableRow key={mapping.id}>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {mapping.keywordGroup?.groupName}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {mapping.keywordGroup?.primaryKeyword}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='secondary'>
                              {mapping.tag?.tagName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {Math.round(mapping.confidenceScore * 100)}%
                          </TableCell>
                          <TableCell>{mapping.priority}</TableCell>
                          <TableCell>{mapping.usageCount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                mapping.isActive ? 'default' : 'secondary'
                              }
                            >
                              {mapping.isActive ? '활성' : '비활성'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2'>
                              <Button size='sm' variant='outline'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='outline'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tag → Account Mappings */}
        <TabsContent value='tag-account' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <Target className='h-5 w-5' />
                    태그 → 계정과목 매핑
                  </CardTitle>
                  <DataSourceBadge
                    sourceInfo={dataSourceInfo.tagAccountMappings}
                    label='태그-계정과목 매핑'
                  />
                </div>
                <Dialog
                  open={showCreateTADialog}
                  onOpenChange={setShowCreateTADialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      매핑 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>새 태그-계정과목 매핑 생성</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='space-y-2'>
                        <Label>태그 *</Label>
                        <Select
                          value={taFormData.tagId}
                          onValueChange={value =>
                            setTAFormData(prev => ({ ...prev, tagId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='태그 선택' />
                          </SelectTrigger>
                          <SelectContent>
                            {tags.map(tag => (
                              <SelectItem
                                key={tag.id}
                                value={tag.id.toString()}
                              >
                                {tag.tagName} ({tag.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>계정과목 코드 *</Label>
                          <Input
                            placeholder='예: 602'
                            value={taFormData.accountCode}
                            onChange={e =>
                              setTAFormData(prev => ({
                                ...prev,
                                accountCode: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>계정과목명 *</Label>
                          <Input
                            placeholder='예: 지급수수료'
                            value={taFormData.accountName}
                            onChange={e =>
                              setTAFormData(prev => ({
                                ...prev,
                                accountName: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-3 gap-4'>
                        <div className='space-y-2'>
                          <Label>우선순위</Label>
                          <Input
                            type='number'
                            min='1'
                            value={taFormData.priority}
                            onChange={e =>
                              setTAFormData(prev => ({
                                ...prev,
                                priority: parseInt(e.target.value) || 1,
                              }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>신뢰도 향상 (%)</Label>
                          <Input
                            type='number'
                            min='0'
                            max='100'
                            value={taFormData.confidenceBoost}
                            onChange={e =>
                              setTAFormData(prev => ({
                                ...prev,
                                confidenceBoost: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>기본 매핑</Label>
                          <div className='mt-2 flex items-center space-x-2'>
                            <Switch
                              checked={taFormData.isDefault}
                              onCheckedChange={checked =>
                                setTAFormData(prev => ({
                                  ...prev,
                                  isDefault: checked,
                                }))
                              }
                            />
                            <span className='text-sm'>
                              {taFormData.isDefault ? '예' : '아니오'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label>매핑 조건 (JSON)</Label>
                        <Textarea
                          placeholder='{"amount_min": 10000, "time": "business_hours"}'
                          value={taFormData.mappingCondition}
                          onChange={e =>
                            setTAFormData(prev => ({
                              ...prev,
                              mappingCondition: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => {
                          resetTAForm();
                          setShowCreateTADialog(false);
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleCreateTagAccountMapping}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : null}
                        생성
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>태그</TableHead>
                    <TableHead>계정과목 코드</TableHead>
                    <TableHead>계정과목명</TableHead>
                    <TableHead>우선순위</TableHead>
                    <TableHead>기본 매핑</TableHead>
                    <TableHead>신뢰도 향상</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagAccountMappings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className='py-8 text-center text-muted-foreground'
                      >
                        등록된 태그-계정과목 매핑이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tagAccountMappings.map(mapping => (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <Badge variant='secondary'>
                            {mapping.tag?.tagName}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-mono'>
                          {mapping.accountCode}
                        </TableCell>
                        <TableCell>{mapping.accountName}</TableCell>
                        <TableCell>{mapping.priority}</TableCell>
                        <TableCell>
                          <Badge
                            variant={mapping.isDefault ? 'default' : 'outline'}
                          >
                            {mapping.isDefault ? '기본' : '조건부'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          +{Math.round(mapping.confidenceBoost * 100)}%
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button size='sm' variant='outline'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button size='sm' variant='outline'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rule Test Tab */}
        <TabsContent value='test' className='space-y-4'>
          <KeywordRuleTest />
        </TabsContent>

        {/* Statistics */}
        <TabsContent value='statistics' className='space-y-4'>
          <KeywordRuleStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TagMappingManagement;
