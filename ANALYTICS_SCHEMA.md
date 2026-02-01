# Firebase Analytics Schema for KIWIMU MBTI Lab

## Collections Structure

### 1. `analytics_events` (主要事件追蹤)

**通用欄位：**
```javascript
{
  eventName: string,           // 事件名稱
  sessionId: string,           // 工作階段 ID
  userId: string | null,       // Firebase User ID (if logged in)
  timestamp: number,           // Unix timestamp (ms)
  platform: 'web' | 'line' | 'discord' | 'store',
  source: string,              // 'organic', 'qr', 'line', 'instagram', etc.
  properties: object,          // 事件特定屬性
  createdAt: Timestamp        // Firestore server timestamp
}
```

---

### 2. Event Types Schema

#### Quiz Events

**`quiz_start`**
```javascript
{
  eventName: "quiz_start",
  properties: {
    source: "direct" | "qr" | "line" | "instagram",
    campaign_id: string | null,
    referrer: string | null
  }
}
```

**`quiz_progress`**
```javascript
{
  eventName: "quiz_progress",
  properties: {
    question_number: number,      // 1-50
    total_questions: number,      // 50
    progress_percentage: number,  // 0-100
    time_spent_seconds: number | null
  }
}
```

**`quiz_abandon`**
```javascript
{
  eventName: "quiz_abandon",
  properties: {
    abandoned_at_question: number,
    total_questions: number,
    progress_percentage: number,
    time_spent_seconds: number
  }
}
```

**`quiz_complete`**
```javascript
{
  eventName: "quiz_complete",
  userId: string,
  properties: {
    mbti_type: string,           // "INFP-A"
    time_spent_seconds: number,
    completion_rate: 100
  }
}
```

---

#### Result Events

**`result_view`**
```javascript
{
  eventName: "result_view",
  userId: string,
  properties: {
    mbti_type: string
  }
}
```

**`result_share`**
```javascript
{
  eventName: "result_share",
  userId: string,
  properties: {
    platform: "line" | "instagram" | "link" | "image",
    mbti_type: string,
    share_method: string
  }
}
```

**`result_download`**
```javascript
{
  eventName: "result_download",
  properties: {
    download_format: "full" | "ig_story",
    mbti_type: string
  }
}
```

---

#### Social/Community Events

**`line_cta_click`**
```javascript
{
  eventName: "line_cta_click",
  properties: {
    cta_location: "result_page" | "compact" | "minimal",
    mbti_type: string | null
  }
}
```

**`discord_join`**
```javascript
{
  eventName: "discord_join",
  userId: string,
  properties: {
    mbti_type: string,
    platform: "web"
  }
}
```

**`discord_verify_complete`**
```javascript
{
  eventName: "discord_verify_complete",
  userId: string,
  platform: "discord",
  properties: {
    discord_id: string,
    discord_username: string,
    mbti_type: string
  }
}
```

**`discord_state_share`**
```javascript
{
  eventName: "discord_state_share",
  platform: "discord",
  properties: {
    discord_id: string,
    discord_username: string,
    emotional_state: "calm" | "storm" | "dawn" | "lost" | "thinking" | "creative",
    state_message: string,
    note: string | null
  }
}
```

---

#### O2O Events

**`qr_code_scan`**
```javascript
{
  eventName: "qr_code_scan",
  properties: {
    scan_location: string,        // "store_front", "table", "dm_card"
    campaign_id: string | null,
    campaign_content: string | null,
    source: "offline"
  }
}
```

**`task_card_generate`**
```javascript
{
  eventName: "task_card_generate",
  userId: string | null,
  properties: {
    emotional_state: "calm" | "storm" | "dawn" | "lost" | "thinking",
    mbti_type: string | null
  }
}
```

**`store_visit`**
```javascript
{
  eventName: "store_visit",
  userId: string | null,
  properties: {
    has_task_card: boolean,
    task_card_state: string | null,
    visit_type: "with_incentive" | "organic"
  }
}
```

**`reward_redemption`**
```javascript
{
  eventName: "reward_redemption",
  userId: string | null,
  properties: {
    reward_type: "sticker" | "card" | "discount",
    mbti_type: string | null
  }
}
```

---

#### User Events

**`user_login`**
```javascript
{
  eventName: "user_login",
  userId: string,
  properties: {
    login_method: "google" | "email" | "discord"
  }
}
```

**`user_signup`**
```javascript
{
  eventName: "user_signup",
  userId: string,
  properties: {
    signup_method: "google" | "email"
  }
}
```

**`profile_update`**
```javascript
{
  eventName: "profile_update",
  userId: string,
  properties: {
    updated_field: string  // "displayName", "avatar", etc.
  }
}
```

---

### 3. `user_sessions` (工作階段追蹤)

```javascript
{
  sessionId: string,           // Unique session ID
  userId: string | null,       // User ID if logged in
  deviceId: string,            // Browser fingerprint
  startTime: Timestamp,
  endTime: Timestamp | null,
  platform: string,            // "web", "mobile"
  browser: string,             // "Chrome", "Safari"
  source: string,              // Campaign source
  campaignId: string | null,
  eventsCount: number,         // Number of events in this session
  quizCompleted: boolean,
  resultViewed: boolean,
  socialJoined: boolean,
  storeVisited: boolean
}
```

---

### 4. `daily_metrics` (每日彙總)

```javascript
{
  date: string,                // "2026-01-23"
  totalVisits: number,
  quizStarts: number,
  quizCompletions: number,
  completionRate: number,      // Percentage
  socialJoins: {
    line: number,
    discord: number,
    total: number
  },
  o2o: {
    qrScans: number,
    taskCards: number,
    storeVisits: number,
    redemptions: number
  },
  mbtiDistribution: {
    INFP: number,
    ENFP: number,
    // ... 16 types
  },
  topSources: [
    { source: "organic", count: number },
    { source: "qr", count: number },
    // ...
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 5. `user_journey` (用戶旅程追蹤)

記錄每個用戶的完整旅程：

```javascript
{
  userId: string,
  mbtiType: string,
  journeyStages: {
    discovered: {
      timestamp: Timestamp,
      source: string,
      campaign: string | null
    },
    quizStarted: {
      timestamp: Timestamp | null
    },
    quizCompleted: {
      timestamp: Timestamp | null,
      timeSpent: number
    },
    resultViewed: {
      timestamp: Timestamp | null
    },
    socialJoined: {
      line: Timestamp | null,
      discord: Timestamp | null
    },
    storeVisited: {
      first: Timestamp | null,
      count: number,
      lastVisit: Timestamp | null
    }
  },
  totalEvents: number,
  lastActive: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Indexes (需要建立的索引)

### `analytics_events`
```
1. eventName + timestamp (DESC)
2. userId + timestamp (DESC)
3. platform + timestamp (DESC)
4. eventName + userId + timestamp (DESC)
5. source + timestamp (DESC)
```

### `user_sessions`
```
1. userId + startTime (DESC)
2. source + startTime (DESC)
3. startTime (DESC)
```

### `daily_metrics`
```
1. date (DESC)
```

### `user_journey`
```
1. userId
2. mbtiType + lastActive (DESC)
3. lastActive (DESC)
```

---

## Security Rules

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Analytics events - write only for authenticated users, read for admins
    match /analytics_events/{eventId} {
      allow create: if true; // Allow all creates (from web/discord)
      allow read: if isAdmin();
      allow update, delete: if false;
    }
    
    // User sessions - similar to analytics_events
    match /user_sessions/{sessionId} {
      allow create: if true;
      allow read: if isAdmin();
      allow update: if request.auth != null;
      allow delete: if false;
    }
    
    // Daily metrics - read only for admins
    match /daily_metrics/{date} {
      allow read: if isAdmin();
      allow write: if isServer(); // Only server can write
    }
    
    // User journey - users can read their own
    match /user_journey/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || isAdmin());
      allow write: if isServer();
    }
    
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isServer() {
      // Server-side operations should use Firebase Admin SDK
      return request.auth.token.admin == true;
    }
  }
}
```

---

## Usage Examples

### Web Application

```typescript
// When quiz starts
import { trackQuizStart } from './utils/analytics';

trackQuizStart('qr', 'spring-2026');

// When quiz completes
trackQuizComplete('INFP-A', 180, userId);
```

### Discord Bot

```javascript
// When user verifies
await db.collection('analytics_events').add({
  eventName: 'discord_verify_complete',
  userId: firebaseUserId,
  discordId: discordUserId,
  mbtiType: 'INFP-A',
  timestamp: Date.now(),
  platform: 'discord'
});
```

### BigQuery Export (Optional)

Enable automatic export to BigQuery for advanced analytics:
```
Project > Firestore > Export to BigQuery
```

---

## Dashboard Queries

### Top MBTI Types This Week
```javascript
db.collection('analytics_events')
  .where('eventName', '==', 'quiz_complete')
  .where('timestamp', '>=', startOfWeek)
  .get()
  .then(snapshot => {
    // Group by mbti_type
  });
```

### Conversion Funnel
```javascript
const funnelStages = [
  'quiz_start',
  'quiz_complete',
  'discord_join',
  'store_visit'
];

// Count each stage
```

### User Retention Cohort
```javascript
db.collection('user_journey')
  .where('journeyStages.quizCompleted.timestamp', '>=', cohortStart)
  .where('lastActive', '>=', retentionCheck)
  .get();
```

---

**這個 schema 現在已經準備好了！** ✅

所有追蹤都會自動儲存到 Firestore，可以用於：
1. Real-time Dashboard
2. BigQuery 深度分析
3. 用戶旅程優化
4. A/B 測試評估
