'use client';

import React, { useEffect, useState } from 'react';

import { Edit, Loader2, Plus, RefreshCw, TestTube, Trash2 } from 'lucide-react';
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

// Types
interface KeywordGroup {
  id: number;
  groupName: string;
  primaryKeyword: string;
  synonyms: string[];
  category: string;
  confidenceBase: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TagMapping {
  id: number;
  keywordGroupId: number;
  tagId: number;
  tagName: string;
  confidenceScore: number;
  priority: number;
  contextRules: any;
  isActive: boolean;
}

interface FormData {
  groupName: string;
  primaryKeyword: string;
  synonyms: string;
  category: string;
  confidenceBase: number;
}

interface TagMappingFormData {
  keywordGroupId: number;
  tagId: number;
  confidenceScore: number;
  priority: number;
  contextRules: string;
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

const KeywordPatternManagement: React.FC = () => {
  // State for keyword groups
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [tagMappings, setTagMappings] = useState<TagMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTagMappingDialog, setShowTagMappingDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<KeywordGroup | null>(null);
  const [selectedGroupForMapping, setSelectedGroupForMapping] = useState<
    number | null
  >(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    groupName: '',
    primaryKeyword: '',
    synonyms: '',
    category: '',
    confidenceBase: 70,
  });

  const [tagMappingFormData, setTagMappingFormData] =
    useState<TagMappingFormData>({
      keywordGroupId: 0,
      tagId: 0,
      confidenceScore: 80,
      priority: 1,
      contextRules: '',
    });

  // Load data on component mount
  useEffect(() => {
    loadKeywordGroups();
    loadTagMappings();
  }, []);

  const loadKeywordGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v2/tag-mapping-mgmt/keyword-groups');
      if (response.ok) {
        const data = await response.json();
        setKeywordGroups(data);
      } else {
        const error = await response.json();
        toast.error(`키워드 그룹 로드 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('키워드 그룹 로드 중 오류가 발생했습니다.');
      console.error('Load keyword groups error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTagMappings = async () => {
    try {
      // Load all tag mappings (placeholder - would need proper endpoint)
      setTagMappings([]);
    } catch (error) {
      console.error('Load tag mappings error:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.groupName || !formData.primaryKeyword || !formData.category) {
      toast.error('필수 필드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const synonymsArray = formData.synonyms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const requestData = {
        groupName: formData.groupName,
        primaryKeyword: formData.primaryKeyword,
        synonyms: synonymsArray,
        category: formData.category,
        confidenceBase: formData.confidenceBase / 100,
      };

      const response = await fetch('/api/v2/tag-mapping-mgmt/keyword-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('키워드 그룹이 성공적으로 생성되었습니다.');
        resetForm();
        setShowCreateDialog(false);
        loadKeywordGroups();
      } else {
        const error = await response.json();
        toast.error(`키워드 그룹 생성 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('키워드 그룹 생성 중 오류가 발생했습니다.');
      console.error('Create group error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async () => {
    if (
      !editingGroup ||
      !formData.groupName ||
      !formData.primaryKeyword ||
      !formData.category
    ) {
      toast.error('필수 필드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const synonymsArray = formData.synonyms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const requestData = {
        groupName: formData.groupName,
        primaryKeyword: formData.primaryKeyword,
        synonyms: synonymsArray,
        category: formData.category,
        confidenceBase: formData.confidenceBase / 100,
        isActive: true,
      };

      const response = await fetch(
        `/api/v2/tag-mapping-mgmt/keyword-groups/${editingGroup.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        toast.success('키워드 그룹이 성공적으로 수정되었습니다.');
        resetForm();
        setShowEditDialog(false);
        setEditingGroup(null);
        loadKeywordGroups();
      } else {
        const error = await response.json();
        toast.error(`키워드 그룹 수정 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('키워드 그룹 수정 중 오류가 발생했습니다.');
      console.error('Edit group error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!confirm(`"${groupName}" 키워드 그룹을 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/v2/tag-mapping-mgmt/keyword-groups/${groupId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        toast.success('키워드 그룹이 성공적으로 삭제되었습니다.');
        loadKeywordGroups();
      } else {
        const error = await response.json();
        toast.error(`키워드 그룹 삭제 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('키워드 그룹 삭제 중 오류가 발생했습니다.');
      console.error('Delete group error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/v2/tag-mapping-mgmt/refresh-cache', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('캐시가 성공적으로 새로고침되었습니다.');
        loadKeywordGroups();
      } else {
        const error = await response.json();
        toast.error(`캐시 새로고침 실패: ${error.error}`);
      }
    } catch (error) {
      toast.error('캐시 새로고침 중 오류가 발생했습니다.');
      console.error('Refresh cache error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      groupName: '',
      primaryKeyword: '',
      synonyms: '',
      category: '',
      confidenceBase: 70,
    });
  };

  const openEditDialog = (group: KeywordGroup) => {
    setEditingGroup(group);
    setFormData({
      groupName: group.groupName,
      primaryKeyword: group.primaryKeyword,
      synonyms: group.synonyms.join(', '),
      category: group.category,
      confidenceBase: group.confidenceBase * 100,
    });
    setShowEditDialog(true);
  };

  const openTagMappingDialog = (groupId: number) => {
    setSelectedGroupForMapping(groupId);
    setTagMappingFormData({
      keywordGroupId: groupId,
      tagId: 0,
      confidenceScore: 80,
      priority: 1,
      contextRules: '',
    });
    setShowTagMappingDialog(true);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            키워드 패턴 관리
          </h2>
          <p className='text-muted-foreground'>
            키워드 그룹과 태그 매핑을 관리합니다.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={handleRefreshCache}
            disabled={refreshing}
            variant='outline'
          >
            {refreshing ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='mr-2 h-4 w-4' />
            )}
            캐시 새로고침
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='groupName'>그룹명 *</Label>
                    <Input
                      id='groupName'
                      placeholder='예: 편의점 체인'
                      value={formData.groupName}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          groupName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='category'>카테고리 *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='카테고리 선택' />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='primaryKeyword'>주 키워드 *</Label>
                  <Input
                    id='primaryKeyword'
                    placeholder='예: 세븐일레븐'
                    value={formData.primaryKeyword}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        primaryKeyword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='synonyms'>동의어 (쉼표로 구분)</Label>
                  <Textarea
                    id='synonyms'
                    placeholder='예: 7-eleven, 7일레븐, 세븐'
                    value={formData.synonyms}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        synonyms: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confidenceBase'>기본 신뢰도 (%)</Label>
                  <Input
                    id='confidenceBase'
                    type='number'
                    min='0'
                    max='100'
                    value={formData.confidenceBase}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        confidenceBase: parseInt(e.target.value) || 70,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(false);
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleCreateGroup} disabled={loading}>
                  {loading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : null}
                  생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue='keyword-groups' className='w-full'>
        <TabsList>
          <TabsTrigger value='keyword-groups'>키워드 그룹</TabsTrigger>
          <TabsTrigger value='tag-mappings'>태그 매핑</TabsTrigger>
          <TabsTrigger value='statistics'>통계</TabsTrigger>
        </TabsList>

        <TabsContent value='keyword-groups' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>키워드 그룹 목록</CardTitle>
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
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => openEditDialog(group)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => openTagMappingDialog(group.id)}
                              >
                                <TestTube className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  handleDeleteGroup(group.id, group.groupName)
                                }
                              >
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

        <TabsContent value='tag-mappings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>태그 매핑 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='py-8 text-center text-muted-foreground'>
                태그 매핑 관리 기능은 구현 예정입니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='statistics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>키워드 패턴 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='py-8 text-center text-muted-foreground'>
                통계 기능은 구현 예정입니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>키워드 그룹 수정</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-groupName'>그룹명 *</Label>
                <Input
                  id='edit-groupName'
                  value={formData.groupName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      groupName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-category'>카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-primaryKeyword'>주 키워드 *</Label>
              <Input
                id='edit-primaryKeyword'
                value={formData.primaryKeyword}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    primaryKeyword: e.target.value,
                  }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-synonyms'>동의어 (쉼표로 구분)</Label>
              <Textarea
                id='edit-synonyms'
                value={formData.synonyms}
                onChange={e =>
                  setFormData(prev => ({ ...prev, synonyms: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-confidenceBase'>기본 신뢰도 (%)</Label>
              <Input
                id='edit-confidenceBase'
                type='number'
                min='0'
                max='100'
                value={formData.confidenceBase}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    confidenceBase: parseInt(e.target.value) || 70,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                resetForm();
                setShowEditDialog(false);
                setEditingGroup(null);
              }}
            >
              취소
            </Button>
            <Button onClick={handleEditGroup} disabled={loading}>
              {loading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Mapping Dialog */}
      <Dialog
        open={showTagMappingDialog}
        onOpenChange={setShowTagMappingDialog}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>태그 매핑 생성</DialogTitle>
          </DialogHeader>
          <div className='py-8 text-center text-muted-foreground'>
            태그 매핑 생성 기능은 구현 예정입니다.
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowTagMappingDialog(false)}
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KeywordPatternManagement;
