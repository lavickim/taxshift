'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Sparkles, Wand2, CheckCircle, AlertTriangle, 
  Info, Lightbulb, Code, TestTube, Target, Zap,
  FileText, TrendingUp, Shield
} from "lucide-react";

interface GeneratedRule {
  ruleName: string;
  description: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  confidence: number;
  testCases: TestCase[];
  metadataTags: Record<string, any>;
}

interface TestCase {
  id: string;
  input: string;
  expected: string;
}

interface PatternSuggestion {
  type: 'optimization' | 'alternative' | 'conflict_resolution';
  title: string;
  description: string;
  pattern: string;
  reasoning: string;
}

interface PatternAnalysis {
  complexity: 'low' | 'medium' | 'high';
  potentialConflicts: string[];
  estimatedAccuracy: number;
  performanceImpact: 'minimal' | 'moderate' | 'significant';
  recommendations: string[];
}

export function RegexLLMGenerator() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sampleInputs, setSampleInputs] = useState('');
  const [expectedOutputs, setExpectedOutputs] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<GeneratedRule[]>([]);
  const [suggestions, setSuggestions] = useState<PatternSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);

  const categories = [
    { value: '법인구조', label: '법인구조 (주식회사, (주), (유) 등)' },
    { value: '주유소', label: '주유소 (브랜드별, 상하행선)' },
    { value: '마트', label: '마트 (대형마트, 백화점)' },
    { value: '해외서비스', label: '해외서비스 (구독, 결제)' },
    { value: '공공기관', label: '공공기관 (정부, 공단)' },
    { value: '카페', label: '카페 (커피전문점)' },
    { value: '편의점', label: '편의점' },
    { value: '기타', label: '기타' }
  ];

  const sampleData = {
    '법인구조': {
      inputs: '주식회사 삼성전자\n(주)네이버\n(유)부자마트\n주식회사코드쉬프트',
      outputs: '삼성전자\n네이버\n부자마트\n코드쉬프트',
      context: '다양한 형태의 법인 표시자를 제거하여 핵심 업체명만 추출합니다.'
    },
    '주유소': {
      inputs: 'Shell 강남(상)주\nGS칼텍스 서울(하)주\nSK에너지 부산직영',
      outputs: 'Shell 강남 상행선 주유소\nGS칼텍스 서울 하행선 주유소\nSK에너지 부산',
      context: '주유소 거래에서 상하행선 구분과 브랜드명을 표준화합니다.'
    },
    '해외서비스': {
      inputs: 'CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA\nNETFLIX COM BILL MONTHLY\nSPOTIFY PREMIUM',
      outputs: 'Claude AI\n넷플릭스\nSpotify',
      context: '해외 구독 서비스의 복잡한 거래명을 서비스명으로 단순화합니다.'
    }
  };

  const loadSampleData = (selectedCategory: string) => {
    const sample = sampleData[selectedCategory as keyof typeof sampleData];
    if (sample) {
      setSampleInputs(sample.inputs);
      setExpectedOutputs(sample.outputs);
      setContext(sample.context);
    }
  };

  const generatePatterns = async () => {
    if (!category || !description || !sampleInputs) {
      alert('카테고리, 설명, 샘플 입력은 필수입니다.');
      return;
    }

    setIsGenerating(true);
    setGeneratedRules([]);
    setSuggestions([]);
    setAnalysis(null);

    try {
      const response = await fetch('/api/regex-preprocessing/llm-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          description,
          sampleInputs: sampleInputs.split('\n').filter(s => s.trim()),
          expectedOutputs: expectedOutputs ? expectedOutputs.split('\n').filter(s => s.trim()) : undefined,
          context: context || undefined
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedRules(result.data.generatedRules);
        setSuggestions(result.data.suggestions);
        setAnalysis(result.data.analysisResult);
      } else {
        alert(`패턴 생성 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Pattern generation failed:', error);
      alert('패턴 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyRule = async (rule: GeneratedRule) => {
    try {
      const response = await fetch('/api/regex-preprocessing/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ruleName: rule.ruleName,
          description: rule.description,
          category: rule.category,
          inputPattern: rule.inputPattern,
          outputTemplate: rule.outputTemplate,
          priority: rule.priority,
          metadataTags: rule.metadataTags,
          testCases: rule.testCases
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`규칙 "${rule.ruleName}"이 성공적으로 추가되었습니다.`);
      } else {
        alert(`규칙 추가 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Rule creation failed:', error);
      alert('규칙 생성 중 오류가 발생했습니다.');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (impact: string) => {
    switch (impact) {
      case 'minimal': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'significant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI 패턴 생성기
            <Badge variant="default">
              <Sparkles className="h-3 w-3 mr-1" />
              LLM 지원
            </Badge>
          </CardTitle>
          <CardDescription>
            거래 문자열 샘플을 분석하여 자동으로 정규식 패턴을 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select value={category} onValueChange={(value) => {
                setCategory(value);
                loadSampleData(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">규칙 설명 *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="생성할 패턴의 목적을 설명하세요"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleInputs">샘플 입력 (한 줄에 하나씩) *</Label>
            <Textarea
              id="sampleInputs"
              value={sampleInputs}
              onChange={(e) => setSampleInputs(e.target.value)}
              placeholder="정규화하고 싶은 거래 문자열들을 입력하세요..."
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedOutputs">기대 출력 (선택사항)</Label>
            <Textarea
              id="expectedOutputs"
              value={expectedOutputs}
              onChange={(e) => setExpectedOutputs(e.target.value)}
              placeholder="원하는 출력 형태를 입력하세요..."
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">추가 컨텍스트 (선택사항)</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="패턴 생성에 도움이 될 추가 정보를 입력하세요..."
              rows={3}
            />
          </div>

          <Button 
            onClick={generatePatterns} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                AI가 패턴을 생성하는 중...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                패턴 생성
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 생성 결과 */}
      {(generatedRules.length > 0 || analysis) && (
        <>
          {/* 분석 결과 */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  패턴 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${getComplexityColor(analysis.complexity)}`}>
                      {analysis.complexity.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">복잡도</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.estimatedAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">예상 정확도</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${getPerformanceColor(analysis.performanceImpact)}`}>
                      {analysis.performanceImpact.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">성능 영향도</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysis.potentialConflicts.length}
                    </div>
                    <div className="text-sm text-gray-600">잠재적 충돌</div>
                  </div>
                </div>

                {analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      권장사항
                    </h4>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 생성된 규칙들 */}
          {generatedRules.map((rule, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {rule.ruleName}
                    <Badge variant="outline">
                      신뢰도: {(rule.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <Button onClick={() => applyRule(rule)} size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    규칙 적용
                  </Button>
                </CardTitle>
                <CardDescription>
                  {rule.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">입력 패턴</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                      {rule.inputPattern}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">출력 템플릿</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                      {rule.outputTemplate}
                    </div>
                  </div>
                </div>

                {rule.testCases.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      테스트 케이스
                    </h4>
                    <div className="space-y-2">
                      {rule.testCases.slice(0, 3).map((testCase, idx) => (
                        <div key={idx} className="text-sm border rounded p-3 bg-gray-50">
                          <div className="font-mono text-gray-800 mb-1">
                            입력: {testCase.input}
                          </div>
                          <div className="font-mono text-green-700">
                            출력: {testCase.expected}
                          </div>
                        </div>
                      ))}
                      {rule.testCases.length > 3 && (
                        <div className="text-sm text-gray-500 text-center">
                          ... 및 {rule.testCases.length - 3}개 추가 테스트 케이스
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* 개선 제안 */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  개선 제안
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {suggestion.type === 'optimization' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                        {suggestion.type === 'alternative' && <FileText className="h-4 w-4 text-green-500" />}
                        {suggestion.type === 'conflict_resolution' && <Shield className="h-4 w-4 text-orange-500" />}
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {suggestion.description}
                      </p>
                      {suggestion.pattern && (
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mb-2">
                          {suggestion.pattern}
                        </div>
                      )}
                      <p className="text-xs text-gray-600">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}