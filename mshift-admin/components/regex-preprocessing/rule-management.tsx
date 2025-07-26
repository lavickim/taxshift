'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  TestTube, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Star,
  ArrowUpDown,
  MoreHorizontal,
  Brain
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RegexRule {
  id: number;
  ruleName: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  isActive: boolean;
  testCases: number;
  successRate: number;
  usageCount: number;
  hasConflict: boolean;
  lastModified: string;
  isNew?: boolean;
}

export function RegexRuleManagement() {
  const [rules, setRules] = useState<RegexRule[]>([
    {
      id: 1,
      ruleName: "주유소 상하행선 분리",
      category: "주유소",
      inputPattern: "(\\S+)\\s*\\((상|하)\\)주\\s*(-?\\d+)",
      outputTemplate: "$1 $2행선 주유소",
      priority: 150,
      isActive: true,
      testCases: 15,
      successRate: 93.3,
      usageCount: 1247,
      hasConflict: true,
      lastModified: "2시간 전"
    },
    {
      id: 2,
      ruleName: "주식회사 표시 제거",
      category: "법인구조",
      inputPattern: "주식회사\\s*(.+)",
      outputTemplate: "$1",
      priority: 145,
      isActive: true,
      testCases: 8,
      successRate: 100,
      usageCount: 2156,
      hasConflict: false,
      lastModified: "1일 전"
    },
    {
      id: 3,
      ruleName: "Claude AI 정규화",
      category: "해외서비스",
      inputPattern: "CLAUDE\\.AI\\s+SUBSCRIPTION.*",
      outputTemplate: "Claude AI",
      priority: 140,
      isActive: true,
      testCases: 3,
      successRate: 100,
      usageCount: 89,
      hasConflict: false,
      lastModified: "30분 전",
      isNew: true
    },
    {
      id: 4,
      ruleName: "이마트 지점 분리",
      category: "대형마트",
      inputPattern: "(이마트)\\s*(\\S+점)",
      outputTemplate: "$1 $2",
      priority: 135,
      isActive: true,
      testCases: 12,
      successRate: 95.8,
      usageCount: 3421,
      hasConflict: false,
      lastModified: "3시간 전"
    },
    {
      id: 5,
      ruleName: "GS25 편의점 정규화",
      category: "편의점",
      inputPattern: "GS25\\s*(.+)",
      outputTemplate: "GS25 $1",
      priority: 130,
      isActive: false,
      testCases: 6,
      successRate: 87.5,
      usageCount: 892,
      hasConflict: false,
      lastModified: "1주 전"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const categories = ["all", "법인구조", "주유소", "대형마트", "해외서비스", "편의점", "공공기관"];
  const statusOptions = ["all", "active", "inactive"];

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.inputPattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || rule.category === selectedCategory;
    
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && rule.isActive) ||
                         (selectedStatus === "inactive" && !rule.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedRules = [...filteredRules].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return b.priority - a.priority;
      case "name":
        return a.ruleName.localeCompare(b.ruleName);
      case "usage":
        return b.usageCount - a.usageCount;
      case "success":
        return b.successRate - a.successRate;
      default:
        return 0;
    }
  });

  const handleRuleAction = (action: string, ruleId: number) => {
    console.log(`${action} rule with ID: ${ruleId}`);
    // TODO: Implement actual actions
  };

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="키워드 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "전체" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">우선순위</SelectItem>
                  <SelectItem value="name">이름</SelectItem>
                  <SelectItem value="usage">사용 횟수</SelectItem>
                  <SelectItem value="success">성공률</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 태그 필터 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">태그 필터:</span>
              {categories.slice(1).map((category) => (
                <Badge 
                  key={category} 
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category ? "all" : category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {rules.length}개 규칙 | 활성 {rules.filter(r => r.isActive).length}개 | 
          비활성 {rules.filter(r => !r.isActive).length}개 | 
          충돌 {rules.filter(r => r.hasConflict).length}개
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            새 규칙
          </Button>
          <Button size="sm" variant="outline">
            <Brain className="mr-2 h-4 w-4" />
            LLM 생성
          </Button>
          <Button size="sm" variant="outline">
            가져오기
          </Button>
          <Button size="sm" variant="outline">
            내보내기
          </Button>
        </div>
      </div>

      {/* 규칙 목록 테이블 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">상태</TableHead>
                <TableHead>규칙명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>패턴</TableHead>
                <TableHead className="text-center">우선순위</TableHead>
                <TableHead className="text-center">성공률</TableHead>
                <TableHead className="text-center">사용 횟수</TableHead>
                <TableHead className="text-center">최근 수정</TableHead>
                <TableHead className="w-[100px]">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRules.map((rule) => (
                <TableRow key={rule.id} className={rule.hasConflict ? "bg-red-50 dark:bg-red-950/20" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rule.hasConflict && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      {rule.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gray-300" />
                      )}
                      {rule.isNew && (
                        <Badge variant="secondary" className="text-xs">새</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{rule.ruleName}</div>
                    {rule.hasConflict && (
                      <div className="text-xs text-orange-600">
                        충돌: "GS칼텍스 패턴"과 67% 겹침
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {rule.inputPattern.length > 30 
                        ? `${rule.inputPattern.substring(0, 30)}...` 
                        : rule.inputPattern}
                    </code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={rule.priority >= 150 ? "default" : "secondary"}>
                      {rule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={rule.successRate >= 95 ? "default" : "secondary"}>
                      {rule.successRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {rule.usageCount.toLocaleString()}회
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {rule.lastModified}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRuleAction('edit', rule.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRuleAction('test', rule.id)}>
                          <TestTube className="mr-2 h-4 w-4" />
                          테스트
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRuleAction('copy', rule.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          복사
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRuleAction('delete', rule.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          10개씩 보기 | 1/25 페이지
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <span>...</span>
          <Button variant="outline" size="sm">
            25
          </Button>
          <Button variant="outline" size="sm">
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}