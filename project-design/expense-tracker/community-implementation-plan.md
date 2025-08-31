# 편한가계부 커뮤니티 기능 구현 계획
## Project Chimera: 단계별 개발 로드맵

---

## 📋 프로젝트 개요

### 배경
- 기존 가계부 앱의 한계: 고독한 기록 도구에서 벗어나 소셜 금융 플랫폼으로 전환
- MZ세대 타겟: 커뮤니티 학습과 게임화 경험 선호
- 네트워크 효과: 기술적 해자에서 커뮤니티 해자로 전환

### 3대 핵심 기둥
1. **아고라(Agora)**: 동료 주도 금융 담론의 장
2. **아레나(Arena)**: 게임화된 금융 챌린지
3. **오라클(Oracle)**: 데이터 기반 신뢰도 시스템

### 성공 지표 (KPI)
- 커뮤니티 DAU/MAU 비율 > 30%
- 커뮤니티 참여 유저 90일 잔존율 > 60%
- 챌린지 참여율 > 40%
- 오라클 뱃지 획득 유저 > 20%

---

## 🏗️ Phase 1: 아고라(Agora) - 커뮤니티 기본 기능 (8주)

### Week 1-2: 백엔드 인프라 구축

#### 데이터베이스 설계
```sql
-- 커뮤니티 관련 테이블
CREATE TABLE et_community_users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(id),
    nickname VARCHAR(50) UNIQUE NOT NULL,
    profile_image_url VARCHAR(255),
    bio TEXT,
    reputation_score INT DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE et_posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT REFERENCES et_community_users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE et_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES et_posts(id),
    author_id BIGINT REFERENCES et_community_users(id),
    parent_comment_id BIGINT REFERENCES et_comments(id),
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE et_post_likes (
    user_id BIGINT REFERENCES et_community_users(id),
    post_id BIGINT REFERENCES et_posts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE et_comment_likes (
    user_id BIGINT REFERENCES et_community_users(id),
    comment_id BIGINT REFERENCES et_comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id)
);

CREATE TABLE et_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT REFERENCES et_community_users(id),
    content_type VARCHAR(20), -- 'post', 'comment'
    content_id BIGINT,
    reason VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Spring Boot Entity 구현
```java
// CommunityUser.java
@Entity
@Table(name = "et_community_users")
public class CommunityUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String nickname;
    private String profileImageUrl;
    private String bio;
    private Integer reputationScore;
    private Boolean isAnonymous;
    
    @OneToMany(mappedBy = "author")
    private List<Post> posts;
    
    // getters, setters, timestamps
}

// Post.java
@Entity
@Table(name = "et_posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "author_id")
    private CommunityUser author;
    
    private String title;
    private String content;
    private String category;
    
    @ElementCollection
    private List<String> tags;
    
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    
    @OneToMany(mappedBy = "post")
    private List<Comment> comments;
    
    // getters, setters, timestamps
}
```

### Week 3-4: API 개발

#### REST API 엔드포인트
```
POST   /api/v1/community/register     - 커뮤니티 가입
GET    /api/v1/community/profile       - 프로필 조회
PUT    /api/v1/community/profile       - 프로필 수정

GET    /api/v1/posts                   - 게시물 목록 (페이징, 필터)
GET    /api/v1/posts/{id}              - 게시물 상세
POST   /api/v1/posts                   - 게시물 작성
PUT    /api/v1/posts/{id}              - 게시물 수정
DELETE /api/v1/posts/{id}              - 게시물 삭제

POST   /api/v1/posts/{id}/like         - 게시물 추천
DELETE /api/v1/posts/{id}/like         - 추천 취소

GET    /api/v1/posts/{id}/comments     - 댓글 목록
POST   /api/v1/posts/{id}/comments     - 댓글 작성
PUT    /api/v1/comments/{id}           - 댓글 수정
DELETE /api/v1/comments/{id}           - 댓글 삭제

POST   /api/v1/reports                 - 신고하기
```

### Week 5-6: Flutter 프론트엔드 구현

#### 화면 구성
1. **커뮤니티 탭 추가**
   - 하단 네비게이션에 커뮤니티 아이콘 추가
   - 메인 화면에서 접근 가능

2. **커뮤니티 피드 화면**
```dart
class CommunityFeedScreen extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('커뮤니티'),
        actions: [
          IconButton(icon: Icon(Icons.search), onPressed: () {}),
          IconButton(icon: Icon(Icons.add), onPressed: () {
            Navigator.push(context, 
              MaterialPageRoute(builder: (_) => CreatePostScreen()));
          }),
        ],
      ),
      body: Column(
        children: [
          // 카테고리 탭
          CategoryTabBar(),
          // 게시물 피드
          Expanded(
            child: PostListView(),
          ),
        ],
      ),
    );
  }
}
```

3. **게시물 상세 화면**
4. **게시물 작성/수정 화면**
5. **프로필 화면**

### Week 7-8: 컨텐츠 관리 시스템

#### AI 기반 컨텐츠 필터링
- 부적절한 내용 자동 감지
- 스팸 필터링
- 키워드 기반 카테고리 자동 분류

#### 관리자 도구
- 신고 내용 검토 대시보드
- 사용자 제재 관리
- 커뮤니티 통계 모니터링

---

## 🎮 Phase 2: 아레나(Arena) - 챌린지 시스템 (6주)

### Week 9-10: 챌린지 백엔드 구축

#### 데이터베이스 설계
```sql
CREATE TABLE et_challenges (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT REFERENCES et_community_users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50), -- 'saving', 'no_spend', 'budget'
    target_amount DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    is_public BOOLEAN DEFAULT true,
    max_participants INT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE et_challenge_participants (
    id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT REFERENCES et_challenges(id),
    user_id BIGINT REFERENCES et_community_users(id),
    progress_amount DECIMAL(12,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

CREATE TABLE et_challenge_activities (
    id BIGSERIAL PRIMARY KEY,
    participant_id BIGINT REFERENCES et_challenge_participants(id),
    transaction_id BIGINT REFERENCES et_transactions(id),
    amount DECIMAL(12,2),
    activity_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Week 11-12: 챌린지 API 및 로직

#### 챌린지 관리 API
```
GET    /api/v1/challenges              - 챌린지 목록
GET    /api/v1/challenges/{id}         - 챌린지 상세
POST   /api/v1/challenges              - 챌린지 생성
PUT    /api/v1/challenges/{id}         - 챌린지 수정

POST   /api/v1/challenges/{id}/join    - 챌린지 참여
POST   /api/v1/challenges/{id}/leave   - 챌린지 탈퇴
GET    /api/v1/challenges/{id}/progress - 진행 현황

GET    /api/v1/my-challenges           - 내 챌린지 목록
GET    /api/v1/my-challenges/stats     - 내 챌린지 통계
```

#### 자동 추적 로직
- 거래 입력 시 관련 챌린지 자동 업데이트
- 일일/주간/월간 집계 배치 작업
- 완료 시 자동 알림 및 보상 지급

### Week 13-14: Flutter 챌린지 UI

#### 주요 화면
1. **챌린지 허브**
   - 참여 중인 챌린지 현황
   - 추천 챌린지 목록
   - 챌린지 생성 버튼

2. **챌린지 상세**
   - 챌린지 정보
   - 참여자 순위표
   - 진행률 차트
   - 활동 타임라인

3. **챌린지 생성**
   - 제목/설명 입력
   - 목표 설정
   - 기간 설정
   - 공개/비공개 설정

---

## 🏆 Phase 3: 오라클(Oracle) - 신뢰도 시스템 (4주)

### Week 15-16: 뱃지 시스템 백엔드

#### 데이터베이스 설계
```sql
CREATE TABLE et_badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    badge_type VARCHAR(50), -- 'oracle', 'arena', 'community'
    criteria_type VARCHAR(50), -- 'savings_rate', 'streak', 'participation'
    criteria_value JSONB,
    tier INT DEFAULT 1, -- 1: Bronze, 2: Silver, 3: Gold, 4: Platinum
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE et_user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_community_users(id),
    badge_id BIGINT REFERENCES et_badges(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    display_order INT,
    is_featured BOOLEAN DEFAULT false,
    UNIQUE(user_id, badge_id)
);

CREATE TABLE et_oracle_consent (
    user_id BIGINT PRIMARY KEY REFERENCES et_users(id),
    savings_data_consent BOOLEAN DEFAULT false,
    budget_data_consent BOOLEAN DEFAULT false,
    transaction_data_consent BOOLEAN DEFAULT false,
    consented_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 뱃지 평가 엔진
```java
@Service
public class BadgeEvaluationService {
    
    @Scheduled(cron = "0 0 2 * * *") // 매일 새벽 2시
    public void evaluateBadges() {
        // 1. 저축률 기반 뱃지
        evaluateSavingsRateBadges();
        
        // 2. 연속 기록 뱃지
        evaluateStreakBadges();
        
        // 3. 예산 준수 뱃지
        evaluateBudgetComplianceBadges();
        
        // 4. 커뮤니티 활동 뱃지
        evaluateCommunityBadges();
        
        // 5. 챌린지 완료 뱃지
        evaluateChallengeBadges();
    }
    
    private void evaluateSavingsRateBadges() {
        // 상위 1%, 5%, 10% 저축률 사용자 선정
        // 뱃지 자동 부여
    }
}
```

### Week 17-18: 프라이버시 및 UI 통합

#### 명시적 동의 시스템
1. **Opt-in 플로우**
   - 최초 커뮤니티 진입 시 안내
   - 데이터 활용 범위 명확히 고지
   - 언제든 철회 가능

2. **데이터 익명화**
   - 개인 식별 정보 제거
   - 통계적 집계만 활용
   - 암호화 저장

#### UI 통합
1. **프로필 뱃지 표시**
   - 대표 뱃지 선택 기능
   - 뱃지 컬렉션 뷰
   - 획득 조건 안내

2. **게시물/댓글 뱃지**
   - 작성자명 옆 뱃지 아이콘
   - 호버/탭 시 상세 정보

---

## 📊 구현 우선순위 및 일정

### 전체 일정: 18주 (약 4.5개월)

| Phase | 기능 | 기간 | 우선순위 | 예상 임팩트 |
|-------|------|------|----------|------------|
| 1 | 아고라 (커뮤니티) | 8주 | 높음 | DAU +30% |
| 2 | 아레나 (챌린지) | 6주 | 중간 | 리텐션 +20% |
| 3 | 오라클 (신뢰도) | 4주 | 낮음 | 신뢰도 +40% |

### 단계별 출시 전략
1. **Phase 1 베타**: 선별된 1,000명 사용자 대상
2. **Phase 1 정식**: 전체 사용자 오픈
3. **Phase 2 베타**: 커뮤니티 활성 사용자 대상
4. **Phase 2 정식**: 전체 오픈
5. **Phase 3**: 옵트인 방식으로 점진적 확대

---

## 🔧 기술 스택

### 백엔드
- Spring Boot 3.2.7 + Java 21
- PostgreSQL + Redis
- Spring Security (커뮤니티 권한 관리)
- AWS S3 (이미지 업로드)
- ElasticSearch (검색 기능)

### 프론트엔드
- Flutter 3.35.1
- Provider/Riverpod (상태 관리)
- cached_network_image (이미지 캐싱)
- flutter_quill (리치 텍스트 에디터)

### AI/ML
- OpenAI API (컨텐츠 모더레이션)
- TensorFlow Lite (온디바이스 스팸 필터)

---

## 📈 성과 측정

### Phase 1 목표 (아고라)
- 일 평균 게시물: 100개+
- 일 평균 댓글: 500개+
- 커뮤니티 MAU: 10,000명+

### Phase 2 목표 (아레나)
- 월간 챌린지 생성: 50개+
- 챌린지 참여율: 40%+
- 챌린지 완료율: 30%+

### Phase 3 목표 (오라클)
- 동의 사용자: 20%+
- 뱃지 획득 사용자: 15%+
- 프로필 조회 증가: +50%

---

## ⚠️ 리스크 관리

### 기술적 리스크
- **확장성**: 급격한 사용자 증가 대비 인프라 오토스케일링
- **성능**: 피드 알고리즘 최적화, 캐싱 전략
- **보안**: 개인정보 보호, SQL 인젝션 방지

### 운영적 리스크
- **컨텐츠 관리**: 24시간 모니터링 체계 구축
- **커뮤니티 문화**: 초기 시드 유저 선별 및 가이드라인
- **법적 이슈**: 금융 정보 관련 컴플라이언스

### 비즈니스 리스크
- **기존 사용자 이탈**: 점진적 롤아웃으로 리스크 최소화
- **수익 모델**: 프리미엄 기능과 연계한 수익화
- **경쟁사 대응**: 빠른 실행과 네트워크 효과 구축

---

## 📝 체크리스트

### Phase 1 체크리스트
- [ ] 데이터베이스 스키마 생성
- [ ] Entity 및 Repository 구현
- [ ] Service 레이어 구현
- [ ] REST API 구현
- [ ] Flutter 커뮤니티 탭 추가
- [ ] 피드 화면 구현
- [ ] 게시물 CRUD 구현
- [ ] 댓글 시스템 구현
- [ ] 추천 시스템 구현
- [ ] 신고 기능 구현
- [ ] 컨텐츠 모더레이션 구현
- [ ] 베타 테스트
- [ ] 정식 출시

### Phase 2 체크리스트
- [ ] 챌린지 데이터베이스 설계
- [ ] 챌린지 백엔드 로직
- [ ] 자동 추적 시스템
- [ ] 챌린지 UI 구현
- [ ] 보상 시스템 구현
- [ ] 알림 시스템 연동

### Phase 3 체크리스트
- [ ] 뱃지 시스템 설계
- [ ] 평가 엔진 구현
- [ ] 동의 시스템 구현
- [ ] 프라이버시 보호
- [ ] UI 통합

---

**문서 버전**: V1.0  
**작성일**: 2025년 8월 31일  
**다음 검토일**: 2025년 9월 7일