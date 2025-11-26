# 🛠️ AgentX - Complete Tools Reference

**All 23 autonomous tools available to the AI agent**

The agent uses these tools to perform actions autonomously. When you interact with AgentX, the LLM (GPT-OSS-120B) intelligently selects and executes the appropriate tools based on your request.

---

## 📋 Overview

| Category | Tools Count | Purpose |
|----------|-------------|---------|
| **Resume Management** | 4 | Create, read, update resumes and add courses |
| **Certificate Generation** | 2 | Generate official certificates instantly |
| **Contract Management** | 4 | View, renew, update employment contracts |
| **Appointment Scheduling** | 3 | Book, cancel, view labor office appointments |
| **Ticket System** | 3 | Create, check, close support tickets |
| **Proactive Actions** | 3 | Fetch events, create alerts, mark as acted |
| **Prediction & Feedback** | 4 | Predict needs, record feedback, analyze sentiment |
| **TOTAL** | **23** | **Fully autonomous AI agent toolkit** |

---

## 🔧 Tool Categories

### 1️⃣ Resume Management Tools (4)

#### `getResume`
**Purpose**: Fetch user's complete resume data  
**When agent uses it**: Before any resume operations to see current data  
**Returns**:
- Job title (Arabic)
- Experience years
- Education level
- Professional summary
- Skills array
- Associated courses

**Example agent behavior**:
```
User: "وش مكتوب في سيرتي؟"
Agent decision: → Call getResume
Agent response: "سيرتك الذاتية: مهندس برمجيات، 5 سنوات خبرة..."
```

---

#### `createResume`
**Purpose**: Create new resume for user  
**When agent uses it**: When user has no resume yet  
**Required**: job_title (Arabic)  
**Optional**: experience_years, education, summary, skills array

**Example agent behavior**:
```
User: "ابي اسوي سيرة ذاتية، انا مهندس AI"
Agent decision: → Call createResume
Agent executes: createResume({job_title: "مهندس ذكاء اصطناعي"})
Agent response: "تم إنشاء سيرتك الذاتية بنجاح ✅"
```

---

#### `updateResume`
**Purpose**: Update specific resume fields  
**When agent uses it**: User wants to modify existing resume  
**Updateable fields**:
- `job_title` - Job title in Arabic
- `experience_years` - Years of experience (0-50)
- `education` - Education level in Arabic
- `summary` - Professional summary in Arabic
- `skills` - Array of skills in Arabic

**Agent workflow**:
1. Calls `getResume` first to see current data
2. Shows user current values
3. Calls `updateResume` with only changed fields
4. Automatically creates tracking ticket

**Example agent behavior**:
```
User: "حدث سنوات خبرتي تصير 10"
Agent step 1: → Call getResume (current = 5 years)
Agent step 2: → Call updateResume({experience_years: 10})
Agent step 3: → Call createTicket (auto-tracking)
Agent response: "تم تحديث خبرتك من 5 إلى 10 سنوات ✅"
```

---

#### `addCourse`
**Purpose**: Add training course to resume  
**When agent uses it**: User mentions completed courses or training  
**Parameters**:
- `course_name` - Course name in Arabic (required)
- `provider` - Institution/provider in Arabic (required)
- `completion_date` - Date in YYYY-MM-DD (optional)

**Example agent behavior**:
```
User: "خذت دورة في Python من معهد AI"
Agent decision: → Call addCourse
Agent executes: addCourse({
  course_name: "Python",
  provider: "معهد الذكاء الاصطناعي"
})
Agent response: "تم إضافة الدورة لسيرتك الذاتية ✅"
```

---

### 2️⃣ Certificate Tools (2)

#### `createCertificate`
**Purpose**: Generate official certificates instantly  
**When agent uses it**: User requests official documents  
**Certificate types**:
- `salary_definition` - Salary certificate (شهادة تعريف براتب)
- `service_certificate` - Service certificate (شهادة خدمة)
- `labor_license` - Labor license (ترخيص عمل)

**Agent workflow**:
1. Validates user has active contract
2. Generates certificate content
3. Stores in database
4. Creates tracking ticket

**Example agent behavior**:
```
User: "ابي شهادة راتب"
Agent step 1: → Call getContracts (verify active contract)
Agent step 2: → Call createCertificate({type: "salary_definition"})
Agent response: "تم إصدار شهادة الراتب بنجاح ✅ رقم الشهادة: #12345"
```

---

#### `getCertificates`
**Purpose**: Retrieve all user's issued certificates  
**When agent uses it**: User asks to see previous certificates  
**Returns**: Array of certificates with type, issue date, content, certificate number

**Example agent behavior**:
```
User: "وش الشهادات اللي طلعتها قبل؟"
Agent decision: → Call getCertificates
Agent response: "عندك 3 شهادات:
  1. شهادة راتب - 2025-10-15
  2. شهادة خدمة - 2025-09-20
  3. ترخيص عمل - 2025-08-10"
```

---

### 3️⃣ Contract Management Tools (4)

#### `getContracts`
**Purpose**: Fetch employment contract details  
**When agent uses it**: Before any contract operations  
**Returns**:
- Employer name
- Position
- Monthly salary
- Start date
- End date
- Status (active/expired/renewed)

**Example agent behavior**:
```
User: "وش تفاصيل عقدي؟"
Agent decision: → Call getContracts
Agent response: "عقدك الحالي:
  - الجهة: شركة ABC
  - المسمى: مهندس برمجيات
  - الراتب: 15,000 ريال
  - تاريخ الانتهاء: 2026-12-31"
```

---

#### `checkContractExpiry`
**Purpose**: Check if contract is expiring soon (within 30 days)  
**When agent uses it**: Proactive monitoring or user inquiry  
**Returns**: Expiry status, days remaining, expiry date

**Example agent behavior**:
```
User: "متى ينتهي عقدي؟"
Agent decision: → Call checkContractExpiry
Agent response: "عقدك ينتهي خلال 15 يوم (2025-12-10) ⚠️
  هل ترغب بتجديده الآن؟"
```

---

#### `renewContract`
**Purpose**: Extend contract end date autonomously  
**When agent uses it**: User requests renewal OR contract expiring soon  
**Parameters**:
- `contract_id` - Optional (uses most recent if not provided)
- `duration` - Default: 1
- `duration_unit` - "years" or "months" (default: years)

**Agent workflow**:
1. Checks contract end date first
2. Extends by specified duration
3. Updates status to "renewed"
4. Creates confirmation ticket

**Example agent behavior**:
```
User: "جدد عقدي"
Agent step 1: → Call getContracts (end_date = 2025-12-15)
Agent step 2: → Call renewContract({duration: 1, duration_unit: "years"})
Agent response: "تم تجديد عقدك حتى 2026-12-15 ✅"
```

---

#### `updateContract`
**Purpose**: Update contract details (salary, position, employer)  
**When agent uses it**: User reports changes in employment terms  
**Updateable fields**:
- `salary` - New salary amount
- `position` - New job title
- `employer_name` - New employer name

**Example agent behavior**:
```
User: "راتبي صار 18000"
Agent decision: → Call updateContract({salary: 18000})
Agent response: "تم تحديث راتبك إلى 18,000 ريال ✅"
```

---

### 4️⃣ Ticket System Tools (3)

#### `createTicket`
**Purpose**: Create support ticket for tracking actions or issues  
**When agent uses it**: After important operations or when user reports problem  
**Categories**:
- `agent_action` - Agent-initiated tracking
- `resume_issue` - Resume problems
- `certificate_issue` - Certificate problems
- `contract_issue` - Contract problems
- `appointment_issue` - Appointment problems
- `technical` - Technical errors
- `general` - General inquiries

**Example agent behavior**:
```
[After updating resume]
Agent auto-executes: → Call createTicket({
  title: "تحديث السيرة الذاتية",
  description: "تم تحديث سنوات الخبرة إلى 10 سنوات",
  category: "agent_action"
})
Agent mentions: "وفتحت لك تذكرة متابعة #12345"
```

---

#### `checkTicketStatus`
**Purpose**: Check status of support tickets  
**When agent uses it**: User asks about ticket status  
**Returns**: All tickets or specific ticket if ID provided

**Example agent behavior**:
```
User: "وش حالة تذكرتي؟"
Agent decision: → Call checkTicketStatus
Agent response: "تذكرتك #12345: مفتوحة
  العنوان: تحديث السيرة الذاتية
  التاريخ: 2025-11-20
  الحالة: قيد المعالجة"
```

---

#### `closeTicket`
**Purpose**: Close resolved ticket  
**When agent uses it**: Issue fully resolved, user confirms satisfaction  
**Parameters**:
- `ticket_id` - Required
- `resolution` - Optional resolution notes in Arabic

**Example agent behavior**:
```
User: "المشكلة انحلت، اقفل التذكرة"
Agent decision: → Call closeTicket({
  ticket_id: "xxx",
  resolution: "تم حل المشكلة بنجاح"
})
Agent response: "تم إغلاق التذكرة #12345 ✅"
```

---

### 5️⃣ Appointment Tools (3)

#### `getAppointments`
**Purpose**: Retrieve user's labor office appointments  
**When agent uses it**: User asks about appointments  
**Returns**: Upcoming and past appointments with dates, times, locations

**Example agent behavior**:
```
User: "وش مواعيدي؟"
Agent decision: → Call getAppointments
Agent response: "عندك موعد قادم:
  📅 التاريخ: 2025-11-28
  ⏰ الوقت: 10:00 صباحاً
  📍 المكان: مكتب العمل - الرياض"
```

---

#### `scheduleAppointment`
**Purpose**: Book appointment at labor office  
**When agent uses it**: User wants to schedule appointment  
**Required parameters**:
- `date` - YYYY-MM-DD format
- `time` - HH:MM format (24-hour)
- `office_location` - Office location in Arabic

**Example agent behavior**:
```
User: "احجز لي موعد يوم الأحد الساعة 9 في مكتب الرياض"
Agent decision: → Call scheduleAppointment({
  date: "2025-11-30",
  time: "09:00",
  office_location: "مكتب العمل - الرياض"
})
Agent response: "تم حجز موعدك يوم الأحد 2025-11-30 الساعة 9 صباحاً ✅"
```

---

#### `cancelAppointment`
**Purpose**: Cancel scheduled appointment  
**When agent uses it**: User needs to cancel  
**Required**: `appointment_id`

**Example agent behavior**:
```
User: "الغي موعدي"
Agent decision: → Call cancelAppointment({appointment_id: "xxx"})
Agent response: "تم إلغاء موعدك يوم 2025-11-30 ✅"
```

---

### 6️⃣ Proactive Tools (3)

#### `getProactiveEvents`
**Purpose**: Fetch pending proactive events that need attention  
**When agent uses it**: On greeting, before responding to understand context  
**Event types detected**:
- Contract expiring soon (< 30 days)
- Open tickets (> 2 days old)
- Incomplete resume profiles
- Upcoming appointments (< 3 days)
- User dissatisfaction patterns

**Agent workflow** (background):
1. Proactive engine monitors database every 5 minutes
2. Detects events (contract expiry, open tickets, etc.)
3. Creates proactive_event records
4. Agent fetches on user greeting

**Example agent behavior**:
```
[User opens app]
Agent auto-executes: → Call getProactiveEvents
Agent finds: contract_expiring_soon (15 days)
Agent greets: "مرحباً! 🔔 لاحظت أن عقدك ينتهي خلال 15 يوم. هل ترغب بتجديده؟"
```

---

#### `markEventActed`
**Purpose**: Mark proactive event as handled after action  
**When agent uses it**: After addressing a proactive alert  
**Parameters**:
- `event_id` - Event ID
- `action_taken` - Description of action in Arabic

**Example agent behavior**:
```
[After renewing contract]
Agent auto-executes: → Call markEventActed({
  event_id: "xxx",
  action_taken: "تم تجديد العقد لسنة إضافية"
})
```

---

#### `createProactiveEvent`
**Purpose**: Create new proactive event when detecting issues  
**When agent uses it**: Agent discovers upcoming deadlines or problems  
**Parameters**:
- `event_type` - Type of event
- `suggested_action` - Action suggestion in Arabic
- `metadata` - Additional event data

**Example agent behavior**:
```
[Agent analyzes resume]
Agent detects: Missing skills field
Agent executes: → Call createProactiveEvent({
  event_type: "incomplete_resume",
  suggested_action: "أكمل مهاراتك في السيرة الذاتية",
  metadata: {missing_fields: ["skills"]}
})
```

---

### 7️⃣ Prediction & Feedback Tools (4)

#### `predictUserNeed`
**Purpose**: Predict user's next need based on behavior patterns  
**When agent uses it**: After analyzing conversation history (4+ interactions)  
**Returns**: Predicted need, confidence score, reasoning

**Pattern detection**:
- Repetitive requests (certificates every 7 days)
- Time-based patterns (monthly contract checks)
- Service frequency (resume updates)

**Example agent behavior**:
```
[Agent analyzes: User requested certificates 3 times in 21 days]
Agent executes: → Call predictUserNeed
Agent prediction: {
  need: "certificate_request",
  confidence: 78%,
  reasoning: "Repetitive pattern every 7 days"
}
Agent suggests: "لاحظت أنك تطلب شهادات بشكل دوري. هل تريد شهادة جديدة؟"
```

---

#### `recordFeedback`
**Purpose**: Record user satisfaction rating  
**When agent uses it**: User provides rating or feedback  
**Parameters**:
- `rating` - 1-5 stars
- `feedback_text` - Optional text in Arabic
- `interaction_type` - Type of interaction rated

**Example agent behavior**:
```
User: "ممتاز، اعطيك 5 نجوم"
Agent decision: → Call recordFeedback({
  rating: 5,
  feedback_text: "ممتاز",
  interaction_type: "resume_update"
})
Agent response: "شكراً على تقييمك! 🌟"
```

---

#### `getFeedback`
**Purpose**: Retrieve user's feedback history  
**When agent uses it**: Analyzing user satisfaction trends  
**Returns**: Past ratings, feedback texts, timestamps

**Example agent behavior**:
```
[For admin/analytics]
Agent executes: → Call getFeedback
Returns: Average rating 4.5/5 from 12 interactions
```

---

#### `analyzeSentiment`
**Purpose**: Analyze emotional tone of user message  
**When agent uses it**: Detecting user frustration or satisfaction  
**Returns**: Sentiment (positive/negative/neutral), confidence score

**Agent workflow**:
1. Analyzes keywords and tone
2. Detects frustration markers (repetition, negative words)
3. Adjusts response approach accordingly

**Example agent behavior**:
```
User: "ليش كل مرة نفس المشكلة؟!"
Agent executes: → Call analyzeSentiment
Agent detects: Negative sentiment (frustration)
Agent adjusts: Uses apologetic, solution-focused tone
Agent response: "أعتذر عن الإزعاج. دعني أحل المشكلة فوراً..."
```

---

## 🤖 How Agent Selects Tools

The agent uses **Groq GPT-OSS-120B** to autonomously decide which tools to use based on:

### 1. Intent Analysis
```
User: "ابي احدث سيرتي"
Agent analyzes: Intent = "update_resume"
Agent selects: [getResume, updateResume, createTicket]
```

### 2. Context Awareness
```
User: "جدد عقدي"
Agent checks: Has contract? Expiring soon?
Agent selects: [getContracts, checkContractExpiry, renewContract]
```

### 3. Multi-Step Planning
```
User: "ابي شهادة راتب"
Agent plans:
  Step 1: → getContracts (verify active contract)
  Step 2: → createCertificate (generate)
  Step 3: → createTicket (tracking)
```

### 4. Proactive Monitoring
```
[Background process]
Every 5 minutes:
  → Check contracts expiring < 30 days
  → Check tickets open > 2 days
  → Check incomplete resumes
  → Create proactive events
```

---

## 📊 Tool Usage Statistics

| Tool Category | Usage Frequency | Autonomy Level |
|---------------|-----------------|----------------|
| Resume Tools | 45% | ⭐⭐⭐⭐⭐ Fully autonomous |
| Certificate Tools | 25% | ⭐⭐⭐⭐⭐ Fully autonomous |
| Contract Tools | 15% | ⭐⭐⭐⭐⭐ Fully autonomous |
| Proactive Tools | 10% | ⭐⭐⭐⭐⭐ Background automation |
| Ticket Tools | 5% | ⭐⭐⭐⭐⭐ Auto-created |

**100% autonomous** - No human intervention needed for any tool

---

## 🔄 Tool Chaining Examples

### Example 1: Resume Update with Verification
```
User: "ابي احدث خبرتي تصير 10 سنوات"

Agent execution chain:
1. getResume → Fetch current (5 years)
2. updateResume → Update to 10 years
3. createTicket → Create tracking ticket #12345
4. getResume → Verify update successful

Agent response: "تم تحديث خبرتك من 5 إلى 10 سنوات ✅
  تذكرة المتابعة: #12345"
```

### Example 2: Proactive Contract Renewal
```
[Background monitoring detects contract expiring in 15 days]

Agent execution chain:
1. checkContractExpiry → Detect 15 days remaining
2. createProactiveEvent → Create alert
3. [User opens app]
4. getProactiveEvents → Fetch alert
5. [User says "نعم جدده"]
6. renewContract → Extend by 1 year
7. markEventActed → Mark alert as handled
8. createTicket → Create confirmation ticket

Agent response: "تم تجديد عقدك حتى 2026-11-26 ✅"
```

### Example 3: Certificate Generation
```
User: "طلع لي شهادة راتب"

Agent execution chain:
1. getContracts → Verify active contract
2. createCertificate → Generate salary certificate
3. createTicket → Create tracking ticket
4. getCertificates → Show certificate number

Agent response: "تم إصدار شهادة الراتب ✅
  رقم الشهادة: #CERT-2025-12345
  تذكرة المتابعة: #TKT-6789"
```

---

## 🎯 Agent vs Chatbot Tool Usage

| Scenario | Traditional Chatbot | AgentX AI Agent |
|----------|-------------------|-----------------|
| User: "Update my resume" | "What would you like to update?" | ✅ **Calls getResume → Shows data → Calls updateResume → Done** |
| Contract expiring in 10 days | Does nothing | ✅ **Auto-detects → Creates alert → Proactively warns user** |
| User: "Issue certificate" | "Which type?" | ✅ **Analyzes context → Calls createCertificate → Auto-generates** |
| Request needs 3 tools | Requires 3 user prompts | ✅ **Chains all 3 tools autonomously** |

**Key difference**: Agent **acts autonomously**, chatbot **asks for instructions**

---

## 🔐 Security & Validation

All tools include:
- ✅ **Zod schema validation** - Type-safe parameters
- ✅ **UUID verification** - User ID validation
- ✅ **Database constraints** - Foreign key checks
- ✅ **Error handling** - Graceful failure messages
- ✅ **Audit logging** - Every action logged in `agent_actions_log`

---

## 📚 Related Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Complete system architecture
- [`VERCEL-AI-SDK-WORKFLOW.md`](./VERCEL-AI-SDK-WORKFLOW.md) - Tool calling implementation
- [`README.md`](./README.md) - Project overview
- [`TECH-STACK.md`](./TECH-STACK.md) - Technology stack

---

**🤖 This is what makes AgentX a true agent** - 23 autonomous tools that the LLM selects and executes without human intervention.

*Last Updated: November 2025*
