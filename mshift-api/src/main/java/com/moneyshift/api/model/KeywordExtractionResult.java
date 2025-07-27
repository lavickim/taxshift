package com.moneyshift.api.model;

import java.math.BigDecimal;
import java.util.List;

/**
 * 키워드 추출 결과 모델
 * D3 키워드 그래프 시스템용
 */
public class KeywordExtractionResult {
    private String industryName;
    private List<ExtractedKeyword> extractedKeywords;
    private List<String> recommendedTags;
    private long processingTimeMs;
    private String extractionMethod;

    // 기본 생성자
    public KeywordExtractionResult() {}

    // 생성자
    public KeywordExtractionResult(String industryName, List<ExtractedKeyword> extractedKeywords) {
        this.industryName = industryName;
        this.extractedKeywords = extractedKeywords;
        this.extractionMethod = "nlp";
    }

    // 내부 클래스: 추출된 키워드
    public static class ExtractedKeyword {
        private String keyword;
        private String category;
        private BigDecimal confidence;
        private String reason; // 추출 근거

        public ExtractedKeyword() {}

        public ExtractedKeyword(String keyword, String category, BigDecimal confidence) {
            this.keyword = keyword;
            this.category = category;
            this.confidence = confidence;
        }

        public ExtractedKeyword(String keyword, String category, BigDecimal confidence, String reason) {
            this.keyword = keyword;
            this.category = category;
            this.confidence = confidence;
            this.reason = reason;
        }

        // Getters and Setters
        public String getKeyword() {
            return keyword;
        }

        public void setKeyword(String keyword) {
            this.keyword = keyword;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public BigDecimal getConfidence() {
            return confidence;
        }

        public void setConfidence(BigDecimal confidence) {
            this.confidence = confidence;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        @Override
        public String toString() {
            return "ExtractedKeyword{" +
                    "keyword='" + keyword + '\'' +
                    ", category='" + category + '\'' +
                    ", confidence=" + confidence +
                    ", reason='" + reason + '\'' +
                    '}';
        }
    }

    // Getters and Setters
    public String getIndustryName() {
        return industryName;
    }

    public void setIndustryName(String industryName) {
        this.industryName = industryName;
    }

    public List<ExtractedKeyword> getExtractedKeywords() {
        return extractedKeywords;
    }

    public void setExtractedKeywords(List<ExtractedKeyword> extractedKeywords) {
        this.extractedKeywords = extractedKeywords;
    }

    public List<String> getRecommendedTags() {
        return recommendedTags;
    }

    public void setRecommendedTags(List<String> recommendedTags) {
        this.recommendedTags = recommendedTags;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public String getExtractionMethod() {
        return extractionMethod;
    }

    public void setExtractionMethod(String extractionMethod) {
        this.extractionMethod = extractionMethod;
    }

    @Override
    public String toString() {
        return "KeywordExtractionResult{" +
                "industryName='" + industryName + '\'' +
                ", extractedKeywords=" + extractedKeywords +
                ", recommendedTags=" + recommendedTags +
                ", processingTimeMs=" + processingTimeMs +
                ", extractionMethod='" + extractionMethod + '\'' +
                '}';
    }
}