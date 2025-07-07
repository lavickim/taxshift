"use client";

import { useState } from "react";

export function GeminiTest() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!prompt.trim()) {
      alert("프롬프트를 입력해주세요!");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setResponse("인증이 필요합니다. 다시 로그인해주세요.");
        return;
      }

      if (res.status === 403) {
        setResponse(`접근 권한이 없습니다: ${data.message || data.error}`);
        return;
      }

      if (data.success) {
        setResponse(data.response);
      } else {
        setResponse(`Error: ${data.error}\n${data.details || ""}`);
      }
    } catch (error) {
      setResponse(`Network Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-card border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Gemini API 테스트</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            프롬프트 입력:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Gemini에게 질문하고 싶은 내용을 입력하세요..."
            className="w-full h-24 p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors"
        >
          {loading ? "생성 중..." : "Gemini API 테스트"}
        </button>

        <div>
          <label htmlFor="response" className="block text-sm font-medium mb-2">
            응답:
          </label>
          <textarea
            id="response"
            value={response}
            readOnly
            placeholder="여기에 Gemini의 응답이 표시됩니다..."
            className="w-full h-64 p-3 border border-border rounded-md resize-none bg-muted/50 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
} 