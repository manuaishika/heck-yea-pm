export const questions = [
  {
    id: 1,
    category: 'Product Strategy',
    question: 'How would you prioritize features for a new product launch?',
    answer: `**Framework: RICE (Reach, Impact, Confidence, Effort)**

1. **Define the Goal**: Clarify what success looks like for the launch
2. **Score Each Feature**:
   - Reach: How many users will this affect?
   - Impact: How much will it move the needle? (Scale: 0.25 to 3)
   - Confidence: How sure are you? (Percentage)
   - Effort: Person-months required

3. **Calculate Priority**: (Reach × Impact × Confidence) / Effort
4. **Consider Dependencies**: Some features enable others
5. **Validate with Users**: Don't just rely on scores

**Example**: For a food delivery app launch, "Restaurant search" scores higher than "Dietary filters" because it's required for core functionality, even though filters have high impact.`,
    tip: 'Always tie your prioritization back to business goals and user needs, not just the framework scores.',
    relatedQuestions: [2, 5, 8],
  },
  {
    id: 2,
    category: 'Product Strategy',
    question: 'Design a product for elderly users.',
    answer: `**Key Principles: Accessibility, Simplicity, Trust**

1. **User Research First**:
   - Interview elderly users in their environment
   - Understand their pain points, not just assumptions
   - Consider varying tech literacy levels

2. **Design Considerations**:
   - Large text and buttons (minimum 16px, prefer 18-20px)
   - High contrast ratios (WCAG AAA: 7:1)
   - Simple navigation - max 3 levels deep
   - Minimize scrolling - prioritize vertical layout
   - Voice input as alternative
   - Haptic feedback for confirmation

3. **Build Trust**:
   - Clear privacy controls
   - No dark patterns
   - Easy access to human support
   - Familiar metaphors (avoid trendy UI patterns)

**Example**: A medication reminder app should have one giant "Taken" button, voice confirmation, and family member notifications.`,
    tip: 'Test with actual elderly users early and often. What seems "simple" to you might not be intuitive to them.',
    relatedQuestions: [15, 22, 31],
  },
  {
    id: 3,
    category: 'Metrics & Analytics',
    question: 'What metrics would you track for a ride-sharing app?',
    answer: `**Framework: Pirate Metrics (AARRR)**

**Acquisition**:
- App downloads
- Cost per install (CPI)
- Sign-up completion rate

**Activation**:
- First ride completion rate
- Time to first ride
- Payment method added

**Retention**:
- DAU/MAU ratio
- Week 1, Week 4, Week 8 retention cohorts
- Rides per active user

**Revenue**:
- GMV (Gross Merchandise Value)
- Take rate (platform commission %)
- Average order value (AOV)
- Lifetime value (LTV)

**Referral**:
- Viral coefficient (K-factor)
- Referral completion rate

**Key Driver Metrics**:
- Driver availability (% of open requests filled in <3 min)
- ETA accuracy
- Cancellation rate (rider + driver)
- Rating distribution

**North Star Metric**: Weekly active riders who complete 2+ rides`,
    tip: 'Pick ONE north star metric that ties directly to business value. All other metrics should support it.',
    relatedQuestions: [4, 11, 18],
  },
  {
    id: 4,
    category: 'Metrics & Analytics',
    question: 'A key metric drops 10% overnight. How do you investigate?',
    answer: `**Framework: Systematic Root Cause Analysis**

**Step 1: Validate the Drop**
- Is it a measurement error? Check data pipeline
- Compare to same day last week/month (seasonality)
- Verify across different platforms/regions

**Step 2: Segment the Data**
- Platform: iOS vs Android vs Web
- Geography: Which countries/cities?
- User cohorts: New vs returning users
- Time: When exactly did it start?

**Step 3: Recent Changes**
- Code deployments in the last 48 hours
- A/B tests that launched
- Marketing campaigns that ended/started
- External events (outages, competitor launches)

**Step 4: Correlate with Other Metrics**
- Did related metrics also drop?
- Did inverse metrics spike? (e.g., errors, load time)

**Step 5: Form Hypothesis & Test**
- List top 3 most likely causes
- Gather evidence for each
- If deployment-related, consider rollback

**Example**: If sign-up rate drops 10%, segment by platform. If it's iOS-only and you just released an update, likely culprit is the new onboarding flow or a critical bug.`,
    tip: 'Always check for measurement errors first - sometimes the metric is fine, but the tracking broke.',
    relatedQuestions: [3, 16, 27],
  },
  {
    id: 5,
    category: 'Product Strategy',
    question: 'Should we build feature X or feature Y?',
    answer: `**Framework: Feature Trade-off Analysis**

**1. Align on Goal**
- What problem are we trying to solve?
- What metric are we trying to move?
- What's the timeline?

**2. Compare Features**

| Criteria | Feature X | Feature Y |
|----------|-----------|-----------|
| User impact | High | Medium |
| Business impact | Medium | High |
| Effort | 3 months | 1 month |
| Risk | Low | High |
| Dependencies | None | Needs API |
| User demand | High | Low |

**3. Consider Strategic Fit**
- Which aligns better with product vision?
- Which builds competitive moat?
- Which enables future features?

**4. Run Experiments**
- Can you test a lightweight version first?
- Can you get user feedback with mockups?

**Decision Framework**:
- If timelines are tight: Choose the smaller effort with clear wins
- If differentiating from competition: Choose the unique capability
- If uncertain: Run cheap experiments before committing

**Example**: Feature X (social sharing) has high user demand but Feature Y (API integration) unlocks a B2B revenue stream. If your goal is monetization, choose Y despite lower user demand.`,
    tip: 'Never answer this question without first asking "What are we optimizing for?" Different goals lead to different answers.',
    relatedQuestions: [1, 12, 20],
  },
  {
    id: 6,
    category: 'Technical',
    question: 'Explain how a URL shortener works.',
    answer: `**System Design Overview**

**Core Functionality**:
1. User submits long URL → System returns short URL
2. User visits short URL → System redirects to long URL

**Technical Components**:

**1. URL Generation**:
- Base62 encoding (a-z, A-Z, 0-9) = 62 possible characters
- 7 characters = 62^7 = 3.5 trillion unique URLs
- Hash function or counter-based ID generation

**2. Database Schema**:
\`\`\`
ShortURL:
  - shortCode (string, indexed, unique)
  - longURL (string)
  - createdAt (timestamp)
  - expiresAt (optional)
  - userId (optional)
  - clickCount (integer)
\`\`\`

**3. Redirect Flow**:
- User visits short.ly/abc123
- Server looks up "abc123" in database
- Returns 301 (permanent) or 302 (temporary) redirect
- Browser redirects to long URL

**4. Scale Considerations**:
- **Read-heavy**: 100:1 read to write ratio
- **Caching**: Redis for hot URLs (80/20 rule)
- **Database**: NoSQL (DynamoDB, MongoDB) for fast lookups
- **CDN**: Distribute redirect logic globally

**5. Additional Features**:
- Analytics (clicks, referrers, geographic data)
- Custom aliases (short.ly/myproduct)
- Link expiration
- Rate limiting (prevent abuse)`,
    tip: 'Always start with the basic flow, then layer in scale and features. Don\'t jump to distributed systems if the question doesn\'t require it.',
    relatedQuestions: [7, 19, 28],
  },
  {
    id: 7,
    category: 'Technical',
    question: 'How does YouTube recommend videos?',
    answer: `**Recommendation System Architecture**

**1. Candidate Generation (Funnel: Millions → Hundreds)**:
- **Collaborative Filtering**: Users who watched A also watched B
- **Content-Based**: Videos similar to what you've watched (tags, category)
- **Context**: Time of day, device, location
- Output: ~200 candidate videos from millions

**2. Ranking (Funnel: Hundreds → Dozens)**:
- **ML Model Features**:
  - User history (watch time, likes, searches)
  - Video metadata (title, description, thumbnail)
  - Engagement signals (CTR, watch %, shares)
  - Freshness (newer videos boosted)
  - Diversity (avoid echo chambers)
- **Objective Function**: Maximize expected watch time
- Output: Top 20-30 videos

**3. Re-ranking & Filtering**:
- Remove duplicates
- Filter out already-watched
- Enforce diversity quotas
- Apply content policy filters
- Output: Final feed order

**Data Pipeline**:
- Real-time signals (clicks, watch events) → Kafka
- Batch processing (model training) → Spark
- Online serving (inference) → TensorFlow Serving

**Key Challenges**:
- Cold start problem (new users/videos)
- Filter bubble vs discovery balance
- Latency (sub-200ms for recommendations)
- A/B testing impact on training data`,
    tip: 'Structure system design answers: what data goes in → how it\'s processed → what comes out. Then add scale considerations.',
    relatedQuestions: [6, 26, 34],
  },
  {
    id: 8,
    category: 'Product Strategy',
    question: 'How would you improve Instagram Stories?',
    answer: `**Product Improvement Framework**

**Step 1: Understand Current State**
- Stories = ephemeral content (24 hours)
- Key metrics: Daily active story creators, story views per user, completion rate
- Competitor context: Snapchat invented it, TikTok disrupted with algorithmic feed

**Step 2: Identify Problems**
- User research: What frustrates users?
  - Discovery: Hard to find interesting stories from non-followers
  - Creation: Editing tools lag behind TikTok
  - Engagement: Completion rate drops after 3rd story
  - Monetization: Brands want better analytics

**Step 3: Propose Solutions**

**Option A: Enhanced Discovery**
- "Stories for You" algorithmic feed (like TikTok FYP)
- Pros: Increases views, helps creators grow
- Cons: Changes core "friends-first" experience
- Risk: Medium

**Option B: Creator Tools**
- Templates, green screen, auto-captions
- Pros: Increases creation quality and frequency
- Cons: Requires significant engineering
- Risk: Low

**Option C: Interactive Elements**
- Polls, quizzes, product tags, links
- Pros: Increases engagement time, enables monetization
- Cons: May clutter experience
- Risk: Low

**My Recommendation**: Start with Option C - it's additive, low-risk, and directly enables monetization. Then layer in Option B to support creators.`,
    tip: 'When improving existing products, identify the constraint: is it creation, distribution, or engagement? Each requires different solutions.',
    relatedQuestions: [5, 13, 25],
  },
  {
    id: 9,
    category: 'Behavioral',
    question: 'Tell me about a time you failed.',
    answer: `**STAR Method Framework**

**Situation**:
Set the context - where, when, what project, what role you had.

**Task**:
What were you responsible for? What was the goal?

**Action**:
What did YOU do? (Use "I", not "we")

**Result**:
What happened? Be honest about the failure.

**Key Elements of a Strong Answer**:
1. **Pick a real failure** - not a humble brag disguised as failure
2. **Own it** - don't blame others
3. **Show learning** - what you'd do differently
4. **Demonstrate growth** - how you applied that lesson later

**Example**:
"During my internship, I led a feature launch without doing user research first. I assumed users wanted customization, so I built 10 different settings. Post-launch, analytics showed only 2% of users touched those settings, and the complexity actually hurt conversion.

I learned to validate assumptions before building. In my next project, I ran a survey and user interviews first, which revealed users wanted simplicity over customization. That product had 3x better adoption.

Now I always start with 'why do users need this?' before jumping to 'how should we build it?'"

**What Makes This Strong**:
- Specific situation
- Clear failure (wasted eng time, hurt conversion)
- Owned the mistake (didn't do research)
- Applied the lesson (next project had better outcome)`,
    tip: 'Pick a failure that shows good judgment in hindsight, not a character flaw. Avoid stories about being late or miscommunicating.',
    relatedQuestions: [10, 14, 21],
  },
  {
    id: 10,
    category: 'Behavioral',
    question: 'Tell me about a time you dealt with a difficult stakeholder.',
    answer: `**STAR Response Strategy**

**Key Principle**: Show empathy + clarity + results

**Situation**:
"I was working on a mobile app redesign, and the marketing director wanted to add a promotional banner on the home screen."

**Task**:
"My goal was to improve user experience metrics while balancing business needs."

**Action**:
1. **Listened first**: Scheduled a 1:1 to understand why this mattered to her (she had a campaign deadline)
2. **Found the root goal**: She needed 10k sign-ups for the promo. The banner was her assumed solution.
3. **Proposed alternatives**: I showed data that banners have 2% CTR and hurt retention. Instead, I proposed a targeted email + in-app modal to existing users.
4. **Collaborated on experiment**: We A/B tested both approaches in a smaller segment first.

**Result**:
The targeted approach got 8% CTR (4x better) and didn't hurt retention. She got her sign-ups, I preserved UX. We turned a conflict into a better outcome.

**What I Learned**:
"Difficult" stakeholders usually have legitimate pressures. If you understand their goals, you can find solutions that work for everyone.

**Red Flags to Avoid**:
- Don't say "they were wrong, I was right"
- Don't make it about winning
- Don't skip the part where you listened`,
    tip: 'Frame stakeholder conflicts as "competing priorities" not "difficult people". Show that you seek win-win outcomes.',
    relatedQuestions: [9, 23, 29],
  },
  {
    id: 11,
    category: 'Metrics & Analytics',
    question: 'How would you measure success for Instagram Reels?',
    answer: `**Define Success = Business Goal + User Value**

**Business Context**:
- Goal: Compete with TikTok, keep users on Instagram longer
- Monetization: Ad revenue from Reels

**Metric Hierarchy**:

**North Star Metric**:
→ **Time spent watching Reels per DAU** (ties user engagement to business goal)

**Input Metrics** (drivers):
- Reels DAU (how many users watch)
- Reels creators DAU (supply side)
- Reels created per creator
- Average Reels watched per session
- Completion rate (% watched to end)
- CTR on Reels in feed

**Output Metrics** (lagging indicators):
- Revenue per Reel impression
- Overall Instagram DAU retention
- Market share vs TikTok (external benchmark)

**Counter Metrics** (watch for negative effects):
- Feed engagement decline (are Reels cannibalizing feed?)
- Creator burnout (are we incentivizing the wrong behavior?)
- Content quality (report rate, skip rate)

**Segmentation**:
- New users vs power users
- Creators vs consumers
- Geography (Reels adoption varies by country)

**Success Thresholds** (example):
- 50% of Instagram DAU watch at least 1 Reel daily within 6 months
- Average 10 minutes spent on Reels per session
- Creator retention: 40% of Reels creators post again within 7 days`,
    tip: 'Always tie metrics to the business goal. "Increasing engagement" means nothing if it doesn\'t drive revenue or retention.',
    relatedQuestions: [3, 12, 19],
  },
  {
    id: 12,
    category: 'Product Strategy',
    question: 'Should Spotify add a social feed?',
    answer: `**Product Decision Framework**

**Step 1: Clarify the Goal**
What problem are we solving?
- Increase engagement/time spent?
- Improve discovery?
- Compete with TikTok/YouTube?
- Monetization (ads in feed)?

**Step 2: Understand User Needs**
Why would users want this?
- Current behavior: Most users listen privately
- Survey data: Do users want to see what friends are listening to?
- Hypothesis: Social features increase stickiness

**Step 3: Competitive Analysis**
- Apple Music has "Friends Listening" - low engagement
- TikTok music discovery is huge - but it's video-first
- Spotify already has Blend, collaborative playlists (social, but low-key)

**Step 4: Trade-offs**

**Pros**:
- Increases daily active users (people check feed)
- Improves discovery (see what friends like)
- Differentiates from competitors
- Potential ad inventory

**Cons**:
- Spotify users come for music, not social
- Adds complexity to clean interface
- Privacy concerns (do users want listening history public?)
- Engineering cost (feed ranking, notifications, moderation)

**Step 5: Decision Criteria**

**I'd recommend "NO" unless**:
1. User research shows strong demand
2. We can start small (opt-in only, minimal feed)
3. We have data showing social features drive retention

**Alternative: Lightweight Test**
- Start with "Friends' Top Tracks This Week" - a simple widget, not a full feed
- Measure: Does it increase discovery? Does it increase shares?
- If successful, expand. If not, low cost to sunset.`,
    tip: 'Don\'t just answer yes/no. Show your framework, acknowledge trade-offs, and propose how to de-risk the decision with experiments.',
    relatedQuestions: [5, 8, 24],
  },
  {
    id: 13,
    category: 'Design',
    question: 'Design a better airport check-in experience.',
    answer: `**UX Design Framework**

**Step 1: Understand Current Pain Points**
- Long lines at kiosks
- Confusing UI (language barriers)
- Printing boarding pass at kiosk
- Baggage drop separate from check-in
- No clear wayfinding after check-in

**Step 2: Define User Segments**
- Frequent flyers (know the flow, want speed)
- Occasional travelers (need guidance)
- International travelers (language barriers)
- Families with kids (need simplicity)

**Step 3: Redesign Proposal**

**Mobile-First Check-in**:
- 80% of check-in happens on phone before arriving
- QR code boarding pass (no printing needed)
- Push notifications with gate info and updates
- Real-time security wait times

**Physical Space**:
- Self-service kiosks only for edge cases (forgot to check in)
- Dedicated baggage drop with QR scan (no kiosk needed)
- Clear digital signage: "Checked in? → Straight to security"
- Express lane for mobile check-in users

**Kiosk UX (for those who still need it)**:
- Auto-detect language from passport scan
- Big buttons, one action per screen
- Visual icons, minimal text
- Skip screens based on context (no baggage? Skip that step)

**Wayfinding**:
- AR arrows on phone guiding to gate
- SMS/push when gate changes
- Walking time estimates

**Success Metrics**:
- Average check-in time < 3 minutes
- Kiosk usage drops by 60%
- Customer satisfaction score increases`,
    tip: 'Start with the biggest pain point, not the flashiest solution. Mobile-first solves 80% of problems before they reach the airport.',
    relatedQuestions: [2, 17, 30],
  },
  {
    id: 14,
    category: 'Behavioral',
    question: 'How do you handle disagreements with engineers?',
    answer: `**Collaboration Framework**

**Core Principle**: Disagreements are about ideas, not people. Approach with curiosity, not authority.

**Step 1: Understand Their Perspective**
- Why do they disagree? (technical constraint, philosophical difference, or misunderstanding?)
- Ask: "Help me understand your concerns."
- Listen without interrupting.

**Step 2: Find Common Ground**
- What do we both want? (usually: ship great product, delight users, maintainable code)
- Reframe as "How do we achieve X?" not "My way vs your way."

**Step 3: Bring Data**
- User research, analytics, competitive examples
- Engineers respect evidence, not opinions
- Be willing to be wrong if data shows it

**Step 4: Explore Trade-offs**
- "What if we did a simpler version first?"
- "What would it take to do it your way?"
- Sometimes the engineering constraint reveals a better product decision

**Example Scenario**:
**Disagreement**: I want infinite scroll, engineer wants pagination.

**Bad Response**: "Users expect infinite scroll. All apps do it."

**Good Response**: 
- "What's your concern with infinite scroll?" 
- Engineer: "Performance degrades after 100 items, and state management gets complex."
- Me: "Got it. What if we lazy-load 20 at a time and virtualize the list? That solves performance."
- Engineer: "That works, but it's 2 extra days."
- Me: "Is there a simpler middle ground? What about loading 50 items, then showing a 'Load More' button?"
- Engineer: "That's 2 hours of work."
- Decision: Ship 'Load More' button first, instrument scroll behavior, upgrade to infinite scroll if data shows users actually hit the button often.

**Key Takeaways**:
- Listen first, speak second
- Data over opinions
- Be willing to compromise
- Follow up to show you care about their input`,
    tip: 'Never say "just do it" to engineers. If they\'re pushing back, there\'s usually a real technical reason. Understand it first.',
    relatedQuestions: [10, 21, 32],
  },
  {
    id: 15,
    category: 'Behavioral',
    question: 'Describe a time you influenced without authority.',
    answer: `**Influence Strategy**

**STAR Example**:

**Situation**:
"During my internship, I noticed our onboarding flow had a 60% drop-off rate. I wasn't on the growth team, but I cared about the user experience."

**Task**:
"I wanted to improve onboarding, but I had no authority to change it or assign eng resources."

**Action**:
1. **Gathered Evidence**: 
   - Analyzed analytics to identify exact drop-off points
   - Watched 10 user session recordings
   - Found the issue: account creation required email verification before users could try the product

2. **Built a Case**:
   - Created a 1-page doc with the problem, data, and proposed solution
   - Included competitor examples (how others solve this)
   - Showed potential impact: 20% improvement = 10k additional activations/month

3. **Found Allies**:
   - Shared with a senior PM who owned growth
   - She agreed and brought it to the eng team lead
   - I offered to write the PRD and test plan

4. **Stayed Involved**:
   - Worked with designer on mockups
   - Helped QA test the new flow
   - Monitored metrics post-launch

**Result**:
"We shipped 'Guest Mode' - users could try the product before creating an account. Drop-off rate fell to 35%. I got credited in the launch announcement, and the growth PM invited me to their sprint planning."

**Key Principles**:
- **Lead with data**, not opinions
- **Make it easy for decision-makers** (do the work for them)
- **Find sponsors** (someone with authority who believes in your idea)
- **Stay humble** (position as "I'd love to help" not "You should listen to me")`,
    tip: 'Influence = Make it easy for someone with authority to say yes. Do 80% of the work upfront.',
    relatedQuestions: [9, 14, 22],
  },
  {
    id: 16,
    category: 'Metrics & Analytics',
    question: 'Define a success metric for Uber Pool.',
    answer: `**Product Metric Definition**

**Context**: Uber Pool = shared rides, lower cost, longer wait times

**Business Goal**:
- Increase revenue per driver-hour (efficiency)
- Attract price-sensitive users
- Fill excess driver capacity during non-peak times

**North Star Metric**:
→ **Weekly Pool riders who take 2+ Pool rides** (measures adoption + retention)

**Why This Metric?**:
- Captures both acquisition (who tries it) and habit formation (who uses it repeatedly)
- 2+ rides = user found value, not just one-time experiment
- Weekly cadence matches Uber usage patterns

**Supporting Metrics**:

**Demand Side**:
- Pool adoption rate (% of users who've taken at least 1 Pool ride)
- Pool ride frequency (rides per Pool user per week)
- Pool to X conversion (do Pool users upgrade to UberX?)

**Supply Side**:
- Driver acceptance rate for Pool
- Driver earnings per hour (Pool vs X)
- Match rate (% of Pool requests that find a match)

**Experience Quality**:
- Average detour time (how much longer than direct route)
- Successful matches (didn't time out or get unmatched)
- Rating for Pool rides vs standard

**Business Metrics**:
- Revenue per Pool ride
- Margin per Pool ride
- Cannibalization rate (did Pool steal UberX rides?)

**Counter Metrics** (to watch):
- Driver churn (are Pool rides annoying drivers?)
- User satisfaction (are wait times too long?)
- Support ticket volume

**Success Criteria** (hypothetical):
- 30% of active users try Pool within 3 months
- 50% of Pool users take 2+ rides per month
- Pool margin is within 10% of UberX
- Driver retention unchanged`,
    tip: 'When defining metrics, always include counter metrics - what negative effects might you accidentally optimize for?',
    relatedQuestions: [3, 11, 27],
  },
  {
    id: 17,
    category: 'Design',
    question: 'How would you design a product for children?',
    answer: `**Designing for Kids: Age-Specific Considerations**

**Age Groups Have Different Needs**:

**Ages 3-5** (Pre-readers):
- Icon-based navigation only (no text reliance)
- Large touch targets (54px minimum)
- No typing required
- Audio instructions
- Bright, bold colors
- Instant feedback (sounds, animations)

**Ages 6-8** (Early readers):
- Simple words, short sentences
- Visual + text labels
- Gamification (stars, badges, progress bars)
- Clear cause-and-effect
- Limited choices (3 options max)

**Ages 9-12** (Pre-teens):
- More complex navigation ok
- Social features (with heavy moderation)
- Customization options (avatars, themes)
- Achievement systems
- Educational value + fun balance

**Universal Principles**:

1. **Safety First**:
   - COPPA compliance (parental consent under 13)
   - Heavy content moderation
   - No ads (or extremely limited)
   - Private by default (no public profiles)
   - Reporting mechanisms

2. **Parent Controls**:
   - Time limits
   - Content filters
   - Usage reports
   - Easy account management

3. **Engagement Without Addiction**:
   - No infinite scroll
   - Natural stopping points
   - Built-in breaks ("You've played 3 games! Take a stretch break")
   - Don't weaponize dopamine

4. **Accessibility**:
   - Dyslexia-friendly fonts
   - Colorblind-safe palettes
   - Screen reader support
   - Adjustable text size

**Example: Kids' Reading App**
- Large book covers (visual selection)
- Audio narration option
- Progress bar shows pages left
- Reward badge every 5 books (not every page - avoid over-gamification)
- Parent dashboard shows reading time and comprehension
- Auto-pause after 30 minutes

**Key Mistakes to Avoid**:
- Designing for how YOU think kids behave vs actual research
- Copying adult UI patterns
- Over-complicating (kids will just ask parents)
- Ignoring parents (they're the actual decision-makers)`,
    tip: 'Kids aren\'t just "small adults". Test with real kids in the target age group - their behavior will surprise you.',
    relatedQuestions: [2, 13, 25],
  },
  {
    id: 18,
    category: 'Metrics & Analytics',
    question: 'How do you set an OKR?',
    answer: `**OKR Framework: Objectives + Key Results**

**Structure**:
- **Objective**: Qualitative, inspirational, time-bound
- **Key Results**: Quantitative, measurable, achievable

**Good OKR Formula**:
- "I will [Objective] as measured by [Key Results]"

**Example 1: Growth Team**

**Objective**: Dramatically increase user activation in Q2

**Key Results**:
1. Increase day-7 retention from 30% to 45%
2. Reduce time-to-first-value from 10 minutes to 3 minutes
3. Achieve 70% completion rate on onboarding flow

**Why This Works**:
- Objective is ambitious but clear
- Key Results are specific numbers with baselines
- All 3 KRs tie to the same goal (activation)
- Measurable today (no new instrumentation needed)

**Example 2: Product Team**

**Objective**: Make search the fastest way to find content in Q3

**Key Results**:
1. Increase search usage from 15% to 35% of sessions
2. Achieve <100ms average search response time
3. Improve search result CTR from 40% to 60%

**Common Mistakes**:

**Bad Objective**: "Improve the product"
- Too vague, not inspirational

**Bad Key Result**: "Launch 5 new features"
- Measures output, not outcome
- Doesn't tie to user/business value

**Bad Key Result**: "Increase revenue by 200%"
- Unrealistic (OKRs should be ambitious but achievable ~70% confidence)

**OKR Best Practices**:
1. **Limit scope**: 3-5 OKRs per team per quarter max
2. **Each OKR has 2-4 Key Results**
3. **70% achievement = success** (not 100%)
4. **Write them collaboratively** (not top-down)
5. **Review weekly** (are we on track?)
6. **No sandbagging** (don't make them easy)

**How to Derive OKRs**:
- Start with company goal (e.g., "Reach 10M ARR")
- Team OKR: "Increase trial-to-paid conversion" (contributes to ARR)
- Individual OKR: "Improve pricing page experience" (contributes to conversion)`,
    tip: 'If you can\'t measure a Key Result with existing data, it\'s not a good KR. Always verify instrumentation exists before committing.',
    relatedQuestions: [3, 11, 20],
  },
  {
    id: 19,
    category: 'Technical',
    question: 'Design a real-time collaborative document editor (like Google Docs).',
    answer: `**System Design: Collaborative Editing**

**Core Challenge**: Multiple users editing the same document simultaneously without conflicts.

**Technical Approach**:

**1. Operational Transformation (OT) OR Conflict-Free Replicated Data Types (CRDTs)**

**OT (Google Docs approach)**:
- Each edit is an "operation" (insert, delete, format)
- Server transforms operations to handle conflicts
- If User A types "hello" at position 5 while User B deletes position 3, OT adjusts A's position
- Pros: Mature, proven at scale
- Cons: Complex server logic

**CRDT (newer approach)**:
- Data structure mathematically guarantees consistency
- No central server needed (peer-to-peer possible)
- Each character has a unique identifier
- Pros: Simpler, decentralized
- Cons: More data overhead

**2. Real-time Communication**:
- **WebSockets**: Persistent connection for live updates
- Client types → sends to server → server broadcasts to all connected clients
- Fallback to long polling for older browsers

**3. System Architecture**:

\`\`\`
Client (Browser)
  ↕ WebSocket
Presence Server (who's online)
  ↕
Application Server (OT logic)
  ↕
Database (document state)
  ↕
Object Storage (S3 - large documents)
\`\`\`

**4. Data Model**:
\`\`\`
Document:
  - id
  - content (JSON or text)
  - version (incremental counter)
  - owner_id

Operation:
  - document_id
  - user_id
  - operation_type (insert/delete/format)
  - position
  - content
  - timestamp
  - version (which doc version this applies to)

User_Presence:
  - user_id
  - document_id
  - cursor_position
  - last_seen (timestamp)
  - color (for cursor indicator)
\`\`\`

**5. Key Features**:

**Presence**:
- Show who's editing (colored cursors)
- Show who's viewing (avatar list)
- Heartbeat every 30s to detect disconnects

**Conflict Resolution**:
- Last-write-wins for cursor position
- OT algorithm for content changes
- Version vector to track causality

**Offline Support**:
- Queue operations locally
- Sync when reconnected
- Merge conflicts server-side

**Undo/Redo**:
- Store operation history per user
- Undo reverses your operations, not others'

**6. Scaling Considerations**:

**Bottlenecks**:
- WebSocket connections (1 million concurrent users = 1M sockets)
- Database writes (every keystroke could be a write)

**Solutions**:
- Batch operations (send every 200ms, not per keystroke)
- Eventual consistency (small delay acceptable)
- Shard by document ID
- Read replicas for viewing
- Cache hot documents in Redis

**Performance Targets**:
- <50ms latency for edits to appear on other clients
- Support 50 simultaneous editors per document
- 99.9% uptime`,
    tip: 'Don\'t over-engineer. Start with "what\'s the simplest solution?" then add complexity only where needed. Most docs have <10 simultaneous editors.',
    relatedQuestions: [6, 7, 28],
  },
  {
    id: 20,
    category: 'Execution',
    question: 'You have two weeks until launch and the feature is half-done. What do you do?',
    answer: `**Crisis Management Framework**

**Step 1: Assess Reality (Hour 0)**
- What exactly is half-done? (clarify with eng lead)
- Is the deadline hard or soft? (investor demo vs internal target)
- What's the minimum viable version?
- What are the consequences of delaying?

**Step 2: Ruthless Prioritization (Hour 1-2)**

Use MoSCoW method:
- **Must Have**: Core functionality - product doesn't work without this
- **Should Have**: Important but not critical - impacts experience but not functionality
- **Could Have**: Nice-to-haves - defer to later
- **Won't Have**: Cut entirely for this launch

**Example**: For a photo-sharing app launch
- **Must**: Upload photo, view feed, like
- **Should**: Filters, captions
- **Could**: Comments, direct messaging
- **Won't**: Stories, video support

**Step 3: Make the Call (Hour 2-3)**
Three options:

**Option A: Ship Reduced Scope (70% of cases)**
- Cut non-essential features
- Accept some UX compromises
- Ship MVP, iterate fast post-launch
- When to choose: Deadline is hard, users will tolerate rough edges

**Option B: Delay Launch (20% of cases)**
- Negotiate new date
- Communicate clearly why (legal issue, security concern, completely broken)
- When to choose: Shipping broken product hurts brand more than delay

**Option C: Brute Force (10% of cases)**
- Add resources (borrow eng from another team)
- Cut other team commitments
- Work weekends (but don't burn people out)
- When to choose: Strategic opportunity you can't miss (e.g., competitor announced similar feature)

**Step 4: Execute (Hour 3 → Launch)**
- Daily standups (not weekly)
- Update stakeholders every 48 hours
- Move QA in parallel with dev (don't wait for "code complete")
- Pre-write launch communications
- Have rollback plan ready

**Step 5: Communicate**
**To Leadership**:
"We're launching with core features on time. Advanced features pushed to v1.1 next month. Users can still accomplish the main workflow. Here's the updated scope..."

**To Eng Team**:
"Here's what we're cutting and why. You don't need to build X, Y, Z. Focus energy on making A, B, C solid."

**To Users** (launch day):
"Version 1.0 is here! Here's what you can do today..."

**Real Example**:
At my last internship, we had a product launch for a client dashboard. Two weeks out, we realized the automated reporting engine wasn't ready. We cut automated reports and shipped with manual CSV exports instead. 90% of users didn't care - they just needed to see their data. We shipped on time, added automation in v1.1 a month later.`,
    tip: 'Almost nothing "must" ship on day one. Be honest about what\'s truly critical vs what\'s nice-to-have. Users prefer a working MVP over a delayed perfect product.',
    relatedQuestions: [1, 5, 33],
  },
  {
    id: 21,
    category: 'Behavioral',
    question: 'Tell me about a time you had to make a decision with incomplete information.',
    answer: `**Decision-Making Under Uncertainty**

**STAR Framework**:

**Situation**:
"During my PM internship, we were deciding whether to build a mobile app or focus on responsive web. We had limited user research, no budget for a full study, and leadership wanted a decision in 3 days."

**Task**:
"I needed to recommend a direction that balanced user needs, technical feasibility, and business constraints - with incomplete data."

**Action**:

**1. Gathered Available Data (Day 1)**:
- Analytics: 40% of traffic came from mobile web
- Looked at competitor apps: all had native apps
- Checked app store reviews of competitors (to see what users valued)
- Talked to 5 users informally (quick coffee chats, not formal research)

**2. Identified What We Didn't Know**:
- Would users actually download an app, or just use mobile web?
- What features would drive app downloads?
- Cost estimate for native app (iOS + Android)

**3. Estimated Where Possible**:
- Ballpark eng cost: 4 months for native, 1 month for responsive web
- Benchmarked against similar products: 10-15% of web users typically download apps

**4. Made Decision with Confidence Levels**:
- High confidence: Users need mobile access (40% on mobile already)
- Medium confidence: App would improve experience (better performance, push notifs)
- Low confidence: Users would download (we don't have data)

**5. Proposed a De-risked Path**:
"Let's ship responsive web first (1 month), instrument heavily, then decide on native app. We'll know within 3 months if users want an app based on:
- Mobile web retention vs desktop
- Feature requests for native functionality
- Session duration on mobile"

**Result**:
"Leadership approved. We shipped responsive web, and data showed mobile users had 2x higher retention than desktop. We got budget for a native app in Q2. The 3-month delay actually helped - we knew exactly which features to prioritize in the app."

**Key Decision-Making Principles**:

1. **Gather quick data** (don't wait for perfect research)
2. **State your confidence** ("I'm 80% sure X, but uncertain about Y")
3. **Make reversible decisions when possible** (start small, scale up)
4. **Define success criteria upfront** ("We'll know we were right if...")
5. **Commit despite uncertainty** (indecision is worse than imperfect decision)

**Framework: Decision Journal**
Document your reasoning:
- What did you decide?
- What data did you have?
- What did you assume?
- What would prove you wrong?

Then review later to calibrate your judgment.`,
    tip: 'Acknowledge uncertainty explicitly. Saying "I don\'t know X, but here\'s how I\'m thinking about it" shows strong judgment.',
    relatedQuestions: [9, 14, 20],
  },
  {
    id: 22,
    category: 'Behavioral',
    question: 'How do you prioritize your work when everything is urgent?',
    answer: `**Prioritization Under Pressure**

**Reality**: When everything is "urgent", nothing actually is. Your job is to make the call.

**Framework: Eisenhower Matrix + Expected Value**

**Step 1: Categorize Everything**

| | Urgent | Not Urgent |
|---------|---------|------------|
| **Important** | **Do First** (fires, blockers) | **Schedule** (strategic work) |
| **Not Important** | **Delegate** (someone else can do) | **Eliminate** (say no) |

**Step 2: Expected Value Calculation**
For things in the "Important" bucket, rank by:
- **Impact if done** × **Probability of success** ÷ **Time required**

**Step 3: Apply Product Thinking**

**Questions to Ask**:
1. "What breaks if I don't do this today?"
   - Product down? → Do first
   - Customer angry? → Depends (one customer vs 100 customers)
   - Deadline missed? → Depends (real deadline vs arbitrary)

2. "Who is blocked by this?"
   - If 5 engineers are waiting on your decision, prioritize it
   - If it's just you, it can wait

3. "Is this reversible?"
   - Reversible decisions: make quickly, iterate
   - Irreversible decisions: take time, gather input

**Real Example**:

**Monday Morning, 5 "Urgent" Things**:
1. CEO wants competitor analysis by EOD
2. Engineer blocked on spec clarification
3. Customer support escalated a bug
4. Quarterly roadmap due Friday
5. Marketing needs product screenshots for launch

**My Prioritization**:
1. **Engineer blocker** (10am) - 15 minutes, unblocks 2 people
2. **Bug triage** (10:30am) - assess severity
   - If affects all users → escalate immediately
   - If affects 1 customer → log ticket, respond by EOD
3. **CEO competitor analysis** (11am-12pm) - 1 hour for solid draft
4. **Marketing screenshots** (2pm) - 30 minutes
5. **Roadmap** (Tuesday-Thursday) - schedule deep work blocks

**Step 4: Communicate Trade-offs**
"I'm prioritizing the engineer blocker and bug first. CEO analysis will be ready by 2pm (not EOD, but with good detail). Roadmap draft ready Thursday for review. Let me know if this doesn't work."

**Step 5: Protect Strategic Time**
- Block 2-hour "no meetings" chunks
- Morning for deep work (roadmap, specs)
- Afternoon for reactive work (meetings, reviews)

**When You're Still Overwhelmed**:
- **Delegate**: What can someone else do?
- **Defer**: What can wait until next week?
- **Delete**: What can you just not do?

Don't be a hero. If you're truly overloaded, escalate: "I have X, Y, Z on my plate. Which should I deprioritize?"`,
    tip: 'Urgency is often artificial. Ask "What happens if this ships tomorrow instead of today?" If the answer is "nothing", it\'s not urgent.',
    relatedQuestions: [1, 20, 33],
  },
  {
    id: 23,
    category: 'Behavioral',
    question: 'Give an example of when you used data to make a decision.',
    answer: `**Data-Driven Decision Making**

**STAR Example**:

**Situation**:
"During my internship, the team debated whether to add video uploads to our photo-sharing app. Design wanted it (competitor had it), but eng said it would take 6 weeks."

**Task**:
"As the PM intern, I needed to recommend whether video was worth the investment."

**Action**:

**1. Defined the Question**:
- Would video increase engagement enough to justify 6 weeks of eng time?
- What's "enough"? Set bar: 20% increase in time spent or 10% increase in DAU

**2. Gathered Existing Data**:
- Looked at our analytics: 
  - Users shared 10M photos/month
  - Average session time: 8 minutes
- Researched competitors:
  - Instagram: 40% of posts are video
  - TikTok: 100% video (but different product)

**3. Collected New Data (Lightweight)**:
- Surveyed 100 active users: "Would you post videos if we supported it?"
  - 65% said yes
  - Top use case: sharing moments that need motion (babies, pets, events)
- Analyzed support requests: 200+ requests for video in past 6 months

**4. Estimated Impact**:
- Assumption: If 65% of users want it, maybe 20% actually use it
- If 20% of users post video, and video drives 2x engagement (benchmark from Instagram)
- Math: 20% × 2x engagement = 40% boost for that segment = 8% overall engagement lift
- Below our 20% threshold!

**5. Proposed Alternative**:
"Data shows demand, but not enough to justify 6 weeks. What if we support video links (YouTube, TikTok embeds) first? That's 1 week of work and tests demand."

**Result**:
"We shipped link embeds. 5% of users used it. Metrics barely moved. We decided not to build native video, saved 5 weeks. Invested that time in better photo editing tools instead, which drove 15% engagement increase."

**Key Lessons**:

**1. Know Your Numbers**:
- What's the baseline?
- What's the target?
- What's the expected lift?

**2. Data ≠ Certainty**:
- Survey says 65%, but actual usage is always lower
- Build in a confidence discount (0.5x to 0.7x)

**3. Test Cheaply First**:
- Don't build the full thing to test demand
- MVPs, fake door tests, surveys

**4. Be Willing to Change Your Mind**:
- I went in thinking video was important (because competitors had it)
- Data showed our users didn't care as much
- Changed recommendation based on evidence`,
    tip: 'Always quantify the expected impact before building. "This will increase engagement" means nothing. "This could increase engagement by 10-15%" is actionable.',
    relatedQuestions: [4, 11, 21],
  },
  {
    id: 24,
    category: 'Product Strategy',
    question: 'How do you decide what features NOT to build?',
    answer: `**Saying No: The Hardest PM Skill**

**Why PMs Must Say No**:
- Eng resources are finite
- Every feature has maintenance cost
- Complexity kills UX
- Focus > More

**Framework: The "No" Decision Tree**

**Question 1: Does it align with product vision?**
- If no → Hard pass
- If yes → Continue

**Question 2: Does it solve a real user problem?**
- How many users have this problem? (1% vs 50%)
- How painful is it? (annoying vs blocking)
- If not validated → Say no, but offer to research

**Question 3: Can users solve this another way?**
- Workaround exists? → Probably don't need to build
- Example: Users want better organization → Do they need folders, or would search/tags work?

**Question 4: What's the opportunity cost?**
- Building this = NOT building something else
- Is this the highest impact use of eng time?
- If no → Defer to backlog

**Question 5: Does it make the product simpler or more complex?**
- Every feature is a tradeoff
- Will this make the product harder to understand?
- If yes → Higher bar for approval

**How to Say No (Without Making Enemies)**:

**Bad**: "That's not a priority."
**Good**: "I love the idea. Here's where it falls relative to our current roadmap. We're focused on X because [data/reason]. Can we revisit this in Q2?"

**Bad**: "Not enough users want this."
**Good**: "We've seen 12 requests for this out of 10,000 active users. It's real, but affects <1%. Here's what affects more users... Would you be open to a workaround?"

**Bad**: "Too complicated to build."
**Good**: "This is 8 weeks of eng time. Given our Q1 goals, we'd need to cut [Feature Y]. Which do you think has more impact?"

**Types of "No"**:
1. **No, never**: Conflicts with vision
2. **No, not now**: Good idea, wrong timing (add to backlog)
3. **No, unless**: Conditional (e.g., "unless 50+ users request it")
4. **No, but here's an alternative**: Solve the same problem differently

**Real Example**:
**Request**: "Add dark mode to our B2B dashboard"
**Analysis**:
- 18 customer requests out of 500 customers
- Eng estimate: 3 weeks (theming system doesn't exist)
- Current priority: Finish reports feature (requested by 200+ customers)

**Response**:
"Dark mode is on our radar. We've got 18 requests so far. Our Q1 priority is reports because 40% of customers need it. Dark mode is Q2. If we hit 50+ requests before then, I'll escalate to reprioritize. Does that work?"

**The "Not To-Do List"**:
Maintain a public list of what you've decided NOT to build and why. Prevents people from re-asking, and shows you're listening (even when saying no).`,
    tip: 'The best PMs are defined by what they choose NOT to build. Saying yes to everything means you\'ll ship mediocrity.',
    relatedQuestions: [1, 5, 22],
  },
  {
    id: 25,
    category: 'Design',
    question: 'Redesign the Facebook News Feed.',
    answer: `**Product Redesign Process**

**Step 1: Diagnose Current Problems**
(Don't redesign just to redesign - what's actually broken?)

**Current Issues with Facebook Feed**:
- Algorithmic feed creates filter bubbles
- Engagement-baiting content (clickbait, rage bait)
- Hard to find close friends' posts among noise
- Infinite scroll = time sink
- Ads are intrusive

**Step 2: Define Goals**
What are we optimizing for?
- User satisfaction (time well spent)
- Engagement (time spent, but quality time)
- Ad revenue (can't ignore - it's the business)
- Safety (reduce misinformation spread)

**Step 3: User Research**
Why do people use Facebook feed?
- Stay updated on close friends/family
- Discover interesting content
- Be entertained
- Feel connected

**Step 4: Redesign Proposal**

**Core Changes**:

**A. Dual Feed Model**:
- **"Friends" tab** (default): Chronological posts from close friends only
  - Determined by interaction frequency (messages, comments, tags)
  - No ads in this feed (premium experience)
  - Limited to ~50 closest connections
- **"Discover" tab**: Algorithmic feed of pages, groups, suggested content
  - This is where ads live
  - Surfaces interesting content from beyond your network

**B. Intentional Design**:
- Remove infinite scroll - show 20 posts, then prompt: "You're all caught up. Want to see more?"
- Add "time spent" counter at bottom (transparency)
- Surfaced "You've been scrolling for 15 minutes" notification

**C. Content Quality Signals**:
- Boost posts with meaningful comments (not just reacts)
- Demote engagement bait ("Tag 3 friends")
- Human review for viral content before wide distribution

**D. Customization**:
- "Snooze" feature for topics (e.g., politics)
- "More/Less like this" feedback on every post
- Control over algorithmic ranking (slider: friends vs pages)

**Step 5: Test Hypothesis**
- A/B test dual feed with 5% of users
- Measure: Time spent, DAU, user satisfaction survey, ad revenue
- Success criteria: Satisfaction up, revenue neutral or better

**Trade-offs**:

**Pros**:
- Better user experience (less overwhelming)
- Increases trust (chronological friends feed)
- Separates concerns (social vs content discovery)

**Cons**:
- May reduce total time spent (less infinite scroll)
- Ad revenue may drop (fewer ad impressions)
- Requires user education (new tabs)

**My Recommendation**:
Ship the dual feed to a small cohort. If time well spent goes up and retention improves (even if time spent drops), it's worth it for long-term health. Facebook's biggest risk is being seen as toxic - this addresses that.`,
    tip: 'When redesigning, start with "what problem are we solving?" not "what looks cool?" Every design decision should tie back to user needs or business goals.',
    relatedQuestions: [8, 13, 30],
  },
  {
    id: 26,
    category: 'Technical',
    question: 'How would you build a rate limiter?',
    answer: `**System Design: Rate Limiting**

**Purpose**: Prevent abuse by limiting requests per user/IP.

**Example**: API allows 100 requests/hour per user.

**Algorithms**:

**1. Token Bucket (Most Common)**:
- Bucket holds N tokens (e.g., 100)
- Each request consumes 1 token
- Tokens refill at fixed rate (e.g., 100 per hour)
- If bucket empty, reject request

**Implementation**:
\`\`\`python
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.last_refill = time.now()
    
    def allow_request(self):
        self._refill()
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
    
    def _refill(self):
        now = time.now()
        elapsed = now - self.last_refill
        new_tokens = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_refill = now
\`\`\`

**Pros**: Smooth traffic, handles bursts
**Cons**: Requires state storage

**2. Fixed Window**:
- Count requests in fixed time windows (12:00-1:00, 1:00-2:00)
- Reset counter at window boundary

**Pros**: Simple, low memory
**Cons**: Burst at window edge (100 requests at 12:59, 100 at 1:00 = 200 in 2 minutes)

**3. Sliding Window Log**:
- Store timestamp of each request
- Count requests in past 60 minutes
- Remove old timestamps

**Pros**: Precise
**Cons**: Memory-heavy (store every request)

**4. Sliding Window Counter** (Best of Both):
- Hybrid of fixed window + sliding window
- Weighted count from previous + current window

**System Architecture**:

**Single Server**:
- In-memory hash map: {user_id: TokenBucket}
- Works for small scale

**Distributed System**:
- Redis for shared state across servers
\`\`\`
Key: user_id:rate_limit
Value: {tokens: 95, last_refill: timestamp}
TTL: 1 hour (auto-cleanup)
\`\`\`

**Redis Commands**:
\`\`\`
GET user:123:tokens
DECRBY user:123:tokens 1
EXPIRE user:123:tokens 3600
\`\`\`

**Where to Apply Rate Limiting**:
- API Gateway (before hitting servers)
- Application layer (per endpoint)
- Database layer (protect against expensive queries)

**Response Headers**:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1678901234
\`\`\`

**HTTP Response**:
- Status: 429 Too Many Requests
- Body: "Rate limit exceeded. Try again in 23 minutes."

**Edge Cases**:
- Multiple API keys per user
- Different limits for different endpoints
- Whitelisting (admins, internal tools)
- Graceful degradation (slow down, don't block)`,
    tip: 'Token bucket is the go-to algorithm. Don\'t overthink it - Redis + token bucket handles 99% of cases.',
    relatedQuestions: [6, 7, 28],
  },
  {
    id: 27,
    category: 'Metrics & Analytics',
    question: 'What is the difference between correlation and causation?',
    answer: `**Correlation vs Causation**

**Definitions**:
- **Correlation**: Two things happen together
- **Causation**: One thing causes the other

**Classic Example**:
"Ice cream sales correlate with drowning deaths."
- Correlation: Both increase in summer
- Causation: Ice cream doesn't cause drowning
- Real cause: Hot weather (confounding variable)

**Why This Matters for PMs**:

**Bad Analysis**:
"Users who use search have 2x higher retention. Let's make search more prominent!"
- Correlation: Search users stay longer
- Causation unclear: Are they retained BECAUSE of search, or do power users just happen to use search?

**Good Analysis**:
"Let's A/B test promoting search. If the test group has higher retention, then search CAUSES retention."

**How to Establish Causation**:

**1. Randomized Controlled Experiments (A/B Tests)**
- Gold standard
- Random assignment eliminates confounders
- Treatment group gets feature, control doesn't
- Measure difference in outcome

**2. Natural Experiments**
- Feature launched in one country, not another
- Compare outcomes between regions
- Less rigorous than RCT, but better than pure correlation

**3. Time-Series Analysis**
- Did retention increase AFTER we launched search?
- Look for clear inflection point

**4. Regression Analysis**
- Control for confounding variables
- "After controlling for user tenure, device type, and activity level, search usage predicts 15% higher retention"

**Common Confounders**:
- **Self-selection bias**: Power users opt into new features
- **Tenure**: Older users behave differently than new users
- **Platform**: iOS users have higher income than Android (on average)
- **Geography**: US users behave differently than India users

**PM Interview Red Flags**:
- Saying "X causes Y" based only on correlation
- Not considering alternative explanations
- Assuming A/B test results generalize forever

**Framework for Interviews**:
When given a data point, always ask:
1. Is this correlation or causation?
2. What else could explain this?
3. How would we test causation?

**Real Example**:
"Users who watch our onboarding video have 50% higher activation."
- Correlation: Yes
- Causation? Unclear - maybe motivated users watch videos AND activate (self-selection)
- Test: Randomly assign users to auto-play video vs opt-in video. Measure activation difference.`,
    tip: 'In interviews, never claim causation without an experiment. Say "correlation suggests" or "this hints that" - then propose how to test it.',
    relatedQuestions: [4, 11, 23],
  },
  {
    id: 28,
    category: 'Technical',
    question: 'Design a notification system.',
    answer: `**System Design: Notifications at Scale**

**Requirements Clarification**:
- Push notifications (mobile)
- Email notifications
- In-app notifications
- SMS (optional, expensive)

**Scale**: 100M users, 1B notifications/day

**Architecture**:

**1. Notification Service**:
\`\`\`
Components:
- API Gateway (receive notification requests)
- Notification Queue (Kafka/RabbitMQ)
- Worker Pool (process queue)
- Delivery Services (APNs for iOS, FCM for Android, SendGrid for email)
- Database (store notification history)
\`\`\`

**2. Data Flow**:
\`\`\`
Event Happens (e.g., new message)
  ↓
App Server creates notification event
  ↓
Enqueue to Kafka topic
  ↓
Worker picks up event
  ↓
Apply user preferences (do they want this notification?)
  ↓
Template rendering (personalization)
  ↓
Deliver via appropriate channel (push/email/SMS)
  ↓
Store delivery status in DB
\`\`\`

**3. Database Schema**:
\`\`\`
Notifications:
  - id
  - user_id (indexed)
  - type (message, like, comment)
  - content (JSON)
  - read_status
  - created_at
  - delivered_at

User_Preferences:
  - user_id
  - notification_type
  - push_enabled (boolean)
  - email_enabled (boolean)
  - frequency (realtime, digest, off)

Devices:
  - user_id
  - device_token (for push)
  - platform (iOS, Android)
  - active (boolean)
\`\`\`

**4. Key Features**:

**Preferences**:
- User controls per notification type
- Quiet hours (no push 10pm-8am)
- Digest mode (batch into daily email)

**Deduplication**:
- Don't send "You have 5 new messages" 5 times
- Batch: "You have 5 new messages from 3 people"

**Priority**:
- Critical (fraud alert) → Always send, override quiet hours
- High (new message) → Send immediately
- Low (new follower) → Can batch

**Retry Logic**:
- If push fails (device offline), retry 3 times over 1 hour
- Exponential backoff
- After 3 failures, mark as failed

**5. Scale Considerations**:

**Challenge: 1B notifications/day**
- = 11,574 notifications/second average
- Peak: 3x average = 35k/second

**Solutions**:
- **Queue**: Kafka handles millions/sec
- **Workers**: Horizontal scaling (add more workers)
- **Rate Limiting**: Don't send 100 notifs at once to one user
- **Sharding**: Partition by user_id
- **Caching**: User preferences in Redis (don't hit DB every time)

**6. Reliability**:
- **Idempotency**: Same event doesn't trigger duplicate notifications
- **Deduplication**: Use event_id + user_id as unique key
- **Monitoring**: Track delivery rate, latency, failure rate
- **Dead Letter Queue**: Failed notifications go here for investigation

**7. Cost Optimization**:
- Push notifications: Cheap (fractions of a cent)
- Email: 1-5 cents each
- SMS: 5-10 cents each
- Total cost: $1M+/month at scale
- Only send high-value notifications`,
    tip: 'Always clarify scale first. A notification system for 1,000 users is trivial (database + cron job). For 100M users, you need queues and distributed workers.',
    relatedQuestions: [6, 7, 19],
  },
  {
    id: 29,
    category: 'Behavioral',
    question: 'How do you handle feedback you disagree with?',
    answer: `**Feedback Processing Framework**

**Mental Model**: Feedback is data, not orders. Your job is to extract value, not blindly comply.

**Step 1: Listen Fully**
- Don't interrupt
- Don't defend immediately
- Ask clarifying questions: "Can you give me an example?"
- Repeat back: "What I'm hearing is..."

**Step 2: Separate Signal from Noise**

**Ask Yourself**:
- Is this about the work or about me?
- Is there a pattern? (First time hearing this vs 3rd time)
- Who is giving feedback? (Domain expert vs outside opinion)
- What's the root concern? (They said "make it faster" but mean "reduce cognitive load")

**Step 3: Categorize the Feedback**

**Type A: They're Right, I'm Wrong**
- Example: "You didn't consider mobile users" → I actually didn't
- Response: "You're right. I'll revise this with mobile in mind. Thanks for catching that."

**Type B: Valid Concern, Different Solution**
- Example: "This design is too complex" → Fair critique
- But their proposed solution isn't ideal either
- Response: "I agree complexity is an issue. What if we did [alternative approach]? Does that address your concern?"

**Type C: Misunderstanding**
- They're critiquing based on incomplete context
- Response: "Let me clarify the constraint. We have to [X] because [Y]. Does that change your feedback?"

**Type D: Preference, Not Principle**
- Example: "I don't like this color"
- Not backed by data or rationale
- Response: "Got it. This color tested best with users, but I'm open to alternatives if you have a specific concern about accessibility or brand."

**Type E: Out of Scope**
- Example: "We should add social features" (when you're building a calculator)
- Response: "That's interesting, but outside our current goals. Can we park that for later discussion?"

**Step 4: Respond Thoughtfully**

**In the Moment**:
"Thanks for the feedback. Let me think about this and get back to you tomorrow."
- Don't react defensively
- Give yourself time to process

**After Reflection**:
If incorporating:
"I thought about your feedback on X. You're right - here's what I changed."

If disagreeing:
"I considered your feedback on X. Here's my thinking... [data/reasoning]. I'm staying with the current approach because [reason]. But I'm open to revisiting if you feel strongly."

**Real Example**:
**Feedback**: "Your PRD is too long. No one will read 10 pages."
**My Initial Reaction**: Defensive (I worked hard on this!)
**After Reflection**: They're right - the key decision is on page 8. Most readers won't make it there.
**Action**: Restructured to TL;DR at top, details in appendix
**Response**: "Good call. I moved the key recommendation to the top. Better?"

**Growth Mindset**:
- "Feedback I disagree with" might just be feedback I don't understand yet
- Seek feedback from people who see things differently
- Track feedback themes over time (Am I consistently weak at X?)`,
    tip: 'Never react to feedback immediately if you feel defensive. Say "let me think about that" and give yourself 24 hours. You\'ll respond better.',
    relatedQuestions: [10, 14, 21],
  },
  {
    id: 30,
    category: 'Design',
    question: 'Design a parking app for a city.',
    answer: `**Product Design Process**

**Step 1: User Research - Who & Why**

**User Segments**:
1. **Commuters**: Park daily, same spots, price-sensitive
2. **Visitors**: Park occasionally, unfamiliar with city, value convenience
3. **Delivery Drivers**: Park frequently, need short-term, value speed

**Pain Points** (from research):
- Hard to find available spots (drive around wasting time)
- Don't know parking rules (street cleaning, time limits)
- Parking tickets (unclear signage)
- Payment is clunky (coins, paper receipts)

**Step 2: Define Core Value Prop**
"Find and pay for parking in 30 seconds."

**Step 3: Feature Design**

**MVP Features**:

**1. Map View**:
- Shows nearby parking (lots, garages, street parking)
- Color-coded by availability:
  - Green: Spaces available
  - Yellow: Limited availability
  - Red: Full
  - Gray: Unknown
- Price displayed per hour
- Walking distance to destination

**2. Reservation**:
- Reserve spot in advance (for lots/garages that support it)
- OR Navigate to available street parking
- QR code for lot entry

**3. Payment**:
- Start parking session (track time)
- Payment auto-charges when you end session
- No coins, no kiosk
- Receipt via email

**4. Rules & Alerts**:
- Shows parking rules (2-hour limit, street cleaning times)
- Push notification 10 minutes before limit
- Extend parking remotely if allowed

**Future Features**:
- Parking history & favorites
- Monthly passes for commuters
- Valet service integration
- EV charging station availability

**Technical Considerations**:

**Data Sources**:
- City parking API (if available)
- IoT sensors in parking spots (ground sensors)
- User-reported availability (crowdsourced)
- Garage occupancy APIs

**Real-time Updates**:
- WebSocket or Server-Sent Events for live availability
- GPS tracking to know when user arrives
- Auto-end session when user leaves (geofencing)

**UI/UX Design**:

**Home Screen**:
- Map (80% of screen)
- Search bar at top: "Where are you going?"
- Bottom sheet with 3 closest options

**Spot Detail**:
- Price breakdown (hourly rate)
- Walking distance
- Reviews/ratings (for garages)
- Rules (max time, restrictions)
- Big CTA: "Park Here"

**Active Session**:
- Timer showing elapsed time
- Cost so far
- Extend button (if allowed)
- End Session button

**Monetization**:
- Commission from garages (10-15%)
- Premium subscription (no search fees, priority support)
- Ads (but only when not in active session)

**Success Metrics**:
- Time to find parking (benchmark: 7 minutes → target: 2 minutes)
- Payment completion rate
- Repeat usage (weekly active parkers)
- Parking ticket reduction (indirect measure)`,
    tip: 'For location-based products, design for the "eyes-up" use case. Users are walking or driving - UI must be glanceable and simple.',
    relatedQuestions: [13, 17, 25],
  },
];

export const categories = [
  { id: 'product-strategy', name: 'Product Strategy' },
  { id: 'metrics-analytics', name: 'Metrics & Analytics' },
  { id: 'technical', name: 'Technical' },
  { id: 'behavioral', name: 'Behavioral' },
  { id: 'design', name: 'Design' },
  { id: 'execution', name: 'Execution' },
];
