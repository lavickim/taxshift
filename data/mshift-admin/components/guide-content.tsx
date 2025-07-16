"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function GuideContent() {
  const [guideContent, setGuideContent] = useState<string>("");

  // 가이드 문서 로드
  const loadGuideContent = async () => {
    try {
      const response = await fetch("/docs/regex-usage-guide.md");
      const text = await response.text();
      setGuideContent(text);
    } catch (error) {
      console.error("가이드 문서 로드 오류:", error);
    }
  };

  useEffect(() => {
    loadGuideContent();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>MoneyShift AI 사용 가이드</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {guideContent ? (
            <div className="prose prose-slate prose-sm max-w-none dark:prose-invert dark:text-gray-100 dark:bg-gray-900/20 p-6 rounded-lg [&_h1]:dark:text-white [&_h2]:dark:text-gray-100 [&_h3]:dark:text-gray-200 [&_code]:dark:bg-gray-800 [&_code]:dark:text-gray-200 [&_pre]:dark:bg-gray-800 [&_strong]:dark:text-white">
              <ReactMarkdown>{guideContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">
                가이드 문서를 로드하고 있습니다...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}