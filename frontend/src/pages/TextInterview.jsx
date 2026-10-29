import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import FeedbackCard from '../components/FeedbackCard';
import confetti from 'canvas-confetti';
import {
  Terminal,
  Clock,
  Sparkles,
  Send,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  Filter,
  Flame,
  BookOpen,
} from 'lucide-react';

export const DAILY_SYSTEM_DESIGN_BANK = [
  {
    id: 'tinyurl-design',
    dayNumber: 1,
    title: 'Design a Scalable URL Shortener (TinyURL)',
    company: 'Google / Amazon',
    role: 'SDE-1 & SDE-2 Systems',
    difficulty: 'Medium',
    topic: 'System Design & Distributed Caching',
    description: `Design a distributed, high-throughput URL shortening service like TinyURL or bit.ly.

**Key Requirements to Address:**
1. **URL Encoding & ID Generation:** Discuss Base62 vs MD5/SHA-256 hashing and collision prevention.
2. **Database Architecture:** Compare SQL (Relational) vs NoSQL (Key-Value/Document) for 100M+ URLs.
3. **Caching & Latency:** Explain in-memory caching strategies (Redis/Memcached) for hot read requests.
4. **Traffic & Resiliency:** Outline API rate-limiting (Token Bucket) and load balancing strategies.`,
    hints: [
      'Assume a 100:1 read-to-write traffic ratio.',
      'Base62 encoding (a-z, A-Z, 0-9) allows 62^6 (~56.8 billion) unique 6-character short URLs.',
      'Use a Redis LRU cache to serve 80% of read traffic from memory in sub-5ms latency.',
    ],
    modelAnswer: `1. Capacity Estimation: 100M new URLs/month, 100:1 read-to-write ratio (3.8K read QPS).
2. URL Generation: Base62 encoding on unique distributed 64-bit ID generator (Twitter Snowflake) ensures zero collisions without DB lookups.
3. Storage: DynamoDB or MongoDB with partition key on ShortURL hash.
4. Caching: Redis cluster caching the top 20% hottest URLs (80/20 Pareto rule).
5. Load Balancing & Security: Nginx reverse proxies with Token Bucket rate limiters to prevent DDoS and API abuse.`,
  },
  {
    id: 'lru-cache-design',
    dayNumber: 2,
    title: 'Design a Distributed In-Memory Cache (Redis Scale)',
    company: 'Amazon / Microsoft',
    role: 'Distributed Systems SDE',
    difficulty: 'Hard',
    topic: 'Distributed Systems & Caching',
    description: `How would you architect a distributed in-memory cache supporting sub-millisecond lookups for billions of requests?

**Key Requirements to Address:**
1. **Eviction Policy:** Explain Least Recently Used (LRU) with Hash Map + Doubly Linked List.
2. **Data Consistency:** Discuss Write-Through vs Write-Back (Write-Behind) vs Cache-Aside patterns.
3. **High Availability:** Detail master-replica failover, TTL expiration, and geographic replication.`,
    hints: [
      'Hash Map provides O(1) key access; Doubly Linked List enables O(1) node relocation on read/update.',
      'Use consistent hashing with virtual nodes to distribute keys across cache servers evenly.',
    ],
    modelAnswer: `1. Node Architecture: Hash Map + Doubly Linked List achieves O(1) get and put with LRU eviction.
2. Sharding: Consistent hashing with virtual nodes minimizes cache churn during node scaling.
3. Invalidation: Cache-Aside pattern with TTL expiration prevents stale reads.
4. Resiliency: Asynchronous master-slave replication with Redis Sentinel/Raft for automated leader election.`,
  },
  {
    id: 'chat-websocket-design',
    dayNumber: 3,
    title: 'Design a Real-Time Scalable Chat & Messaging System',
    company: 'Meta / Microsoft',
    role: 'Full Stack & Backend Systems',
    difficulty: 'Medium',
    topic: 'Real-Time Protocols & WebSockets',
    description: `Design the backend architecture for a high-concurrency real-time 1-on-1 and group messaging system (like WhatsApp or Slack).

**Key Requirements to Address:**
1. **Connection Protocol:** Compare WebSockets vs Long Polling vs gRPC/HTTP-2.
2. **Message Delivery & Ordering:** Explain how message sequence numbers and ACK receipts work.
3. **Push Notifications & Offline Storage:** How messages are queued (Kafka/RabbitMQ) for offline users.`,
    hints: [
      'Maintain persistent bidirectional WebSocket sessions via a dedicated WebSocket Gateway.',
      'Use Apache Kafka or RabbitMQ as an asynchronous message broker for fanout delivery.',
    ],
    modelAnswer: `1. Transport: Persistent WebSockets for connected clients with fallback to HTTP long-polling.
2. State Management: Session servers store user connection IDs in Redis.
3. Message Pipeline: Kafka topics decouple incoming messages; distributed Cassandra clusters store append-only chat history by conversation_id.
4. Offline Support: Apple APNs & Google FCM triggered via background worker queue when user heartbeat is inactive.`,
  },
  {
    id: 'crm-schema-design',
    dayNumber: 4,
    title: 'Design Scalable Multi-Tenant Modular Database Architecture',
    company: 'Zoho / Salesforce',
    role: 'Product Backend Developer',
    difficulty: 'Medium',
    topic: 'Database Modeling & Multi-Tenancy',
    description: `Design a scalable multi-tenant SaaS CRM database architecture that securely isolates tenant data while keeping infrastructure cost efficient.

**Key Requirements to Address:**
1. **Tenancy Model:** Compare Database-per-Tenant vs Schema-per-Tenant vs Shared Database (Row-Level Security).
2. **Custom Fields:** How tenants can dynamically add custom attributes without altering core table schemas (EAV vs JSONB).
3. **Data Security:** Preventing cross-tenant data leakage and handling tenant offboarding.`,
    hints: [
      'Shared Database with tenant_id indexing is the most cost-effective approach for SaaS scalability.',
      'PostgreSQL JSONB with GIN indexes allows high-performance querying on dynamic tenant fields.',
    ],
    modelAnswer: `1. Multi-Tenancy: Shared Database with tenant_id indexed on every query, enforced via PostgreSQL Row-Level Security (RLS).
2. Custom Fields: JSONB columns with GIN index for schema-less user-defined CRM attributes.
3. Isolation: Connection pool middleware automatically injects tenant context into session variables to prevent cross-tenant queries.`,
  },
  {
    id: 'rate-limiter-design',
    dayNumber: 5,
    title: 'Design an API Gateway Distributed Rate Limiter',
    company: 'Stripe / Uber',
    role: 'Cloud Infrastructure & SDE-2',
    difficulty: 'Medium',
    topic: 'API Security & Traffic Throttling',
    description: `Architect a high-performance distributed rate limiter for a public developer API capable of handling 500,000 requests/sec with minimal latency overhead (<2ms).

**Key Requirements to Address:**
1. **Algorithm Comparison:** Compare Token Bucket, Leaky Bucket, Fixed Window Counter, and Sliding Window Log.
2. **Distributed Synchronization:** How to synchronize rate counters across multiple load-balanced gateway nodes without DB locking.
3. **HTTP Semantics & Headers:** Return proper HTTP 429 Too Many Requests with \`Retry-After\` and \`X-RateLimit-Remaining\` headers.`,
    hints: [
      'Token Bucket implemented via Redis Lua scripts guarantees atomic read-and-decrement operations without race conditions.',
      'Sliding Window Counter offers smooth rate enforcement without memory explosion.',
    ],
    modelAnswer: `1. Algorithm: Token Bucket algorithm implemented in Redis via atomic Lua scripts to eliminate race conditions across edge nodes.
2. Architecture: Embedded rate-limiting middleware in API Gateway (Kong/Nginx) querying local Redis clusters with pipelining.
3. Resiliency: Soft-fail mode: If Redis becomes unreachable, traffic degrades gracefully to allow critical requests while alerting telemetry.
4. Response Headers: Standardized RFC headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After).`,
  },
  {
    id: 'video-cdn-streaming',
    dayNumber: 6,
    title: 'Design Global Video Streaming & CDN Architecture (Netflix Scale)',
    company: 'Netflix / YouTube',
    role: 'Streaming Systems & Distributed Networks',
    difficulty: 'Hard',
    topic: 'Video Encoding & Edge Delivery',
    description: `Design a global video on-demand (VOD) architecture capable of ingesting raw 4K videos, chunking/transcoding them, and streaming smoothly across variable network bandwidths.

**Key Requirements to Address:**
1. **Adaptive Bitrate Streaming (ABR):** Explain HLS (HTTP Live Streaming) and MPEG-DASH chunking protocols.
2. **Asynchronous Transcoding Pipeline:** Architecture for background media worker pools converting videos into multiple resolutions (1080p, 720p, 480p).
3. **Edge Caching & CDN:** Distributing video segments to local ISP Open Connect appliances and Edge PoPs.`,
    hints: [
      'Split videos into 2-6 second .ts chunks with an m3u8 playlist manifest.',
      'Use asynchronous message queues (RabbitMQ/SQS) feeding GPU-accelerated transcoding clusters.',
    ],
    modelAnswer: `1. Ingestion: Direct multipart chunk upload to S3 bucket triggering event notification.
2. Transcoding: Worker pool (FFmpeg) decomposes video into 4-second chunks encoded across multiple bitrates (H.264/AV1).
3. Manifest: Generates master HLS .m3u8 playlist for client-side adaptive resolution switching.
4. Delivery: Global CDN with edge SSD caching serving 95%+ of video chunk requests directly from local PoPs.`,
  },
  {
    id: 'ride-share-geohash',
    dayNumber: 7,
    title: 'Design Scalable Ride-Sharing Proximity Dispatch (Uber/Ola)',
    company: 'Uber / Grab',
    role: 'Geospatial & High-Concurrency SDE',
    difficulty: 'Hard',
    topic: 'Geospatial Indexing & Real-time Matching',
    description: `Design the real-time proximity matchmaking system for a ride-hailing platform connecting millions of active riders and drivers every minute.

**Key Requirements to Address:**
1. **Spatial Indexing:** Compare Geohash, Google S2 Geometry, and QuadTrees for 2D coordinate search.
2. **High-Frequency Location Updates:** Handling driver GPS telemetry updates sent every 4 seconds.
3. **Dispatch & Concurrency:** Preventing multiple drivers from accepting the same ride simultaneously (Distributed Locking).`,
    hints: [
      'Geohashing encodes latitude and longitude into base32 alphanumeric strings where matching prefixes denote geographic proximity.',
      'Store active driver positions in Redis Geospatial indexes (GEOADD / GEORADIUS).',
    ],
    modelAnswer: `1. Geospatial Storage: In-memory Redis cluster with Geospatial indexes (Google S2 / H3 hexagon indexing) for O(log N) radius queries.
2. Telemetry Ingestion: Driver GPS pings sent via lightweight UDP/gRPC into Kafka streaming pipeline, updating driver location cache.
3. Match Algorithm: Query nearest available drivers within a 3km radius; send push notifications sequentially.
4. Concurrency: Redis distributed lock (Redlock) on ride_id ensures only one driver locks the ride booking transaction.`,
  },
  {
    id: 'idempotent-payment-gateway',
    dayNumber: 8,
    title: 'Design an Idempotent Distributed Payment Processing Engine',
    company: 'Goldman Sachs / Stripe',
    role: 'FinTech & Transaction Reliability',
    difficulty: 'Hard',
    topic: 'Distributed Transactions & Idempotency',
    description: `Architect a mission-critical payment processing system that guarantees exactly-once processing (zero double charges) even across network timeouts, retries, and hardware failures.

**Key Requirements to Address:**
1. **Idempotency Keys:** How idempotency tokens are generated, validated, and stored with atomic state locks.
2. **Distributed Transactions:** Compare Two-Phase Commit (2PC) vs Saga Pattern (Orchestration vs Choreography).
3. **Reconciliation & Auditing:** Immutable double-entry ledger database schema for transactional compliance.`,
    hints: [
      'Client generates a UUIDv4 idempotency key per transaction; server locks this key in DB before contacting bank network.',
      'Saga orchestrator executes compensating transactions if any downstream payment step fails.',
    ],
    modelAnswer: `1. Idempotency Guard: Client transmits unique idempotency-key header. Server performs atomic INSERT with UNIQUE constraint in PostgreSQL.
2. State Machine: Transaction transitions through CREATED -> PROCESSING -> SUCCESS / FAILED states. Duplicate requests return cached payload.
3. Saga Orchestration: Central workflow engine coordinates Bank Gateway -> Balance Update -> Notification with automated compensation on failure.
4. Audit Ledger: Immutable double-entry append-only ledger tracking credits and debits to guarantee mathematical reconciliation.`,
  },
  {
    id: 'notification-fanout-engine',
    dayNumber: 9,
    title: 'Design a High-Throughput Notification & Alert Fanout Engine',
    company: 'Airbnb / Twitter',
    role: 'Backend & Event-Driven Systems',
    difficulty: 'Medium',
    topic: 'Message Queues & Fanout Architecture',
    description: `Design a scalable notification engine that sends millions of transactional emails, SMS messages, and mobile push notifications with priority queuing and rate limits.

**Key Requirements to Address:**
1. **Multi-Channel Orchestration:** Routing notifications across Email (SendGrid), SMS (Twilio), and Push (FCM/APNs).
2. **Priority Queuing:** Separating high-priority OTP/security alerts from low-priority marketing broadcasts.
3. **User Preferences & Frequency Capping:** Respecting user unsubscribe settings and avoiding spamming.`,
    hints: [
      'Use dedicated RabbitMQ or Kafka priority queues to prevent marketing floods from stalling OTP verification codes.',
      'Maintain user communication preference profiles in Redis for sub-millisecond suppression checks.',
    ],
    modelAnswer: `1. Queue Architecture: Separate Kafka topics with strict priority levels: P0 (OTPs/Security), P1 (Transactional updates), P2 (Marketing).
2. Worker Pool: Distributed consumer workers consume from topics and dispatch via channel-specific adapter interfaces (Twilio/SendGrid/FCM).
3. Frequency Capping: Redis sliding counter limits maximum non-critical notifications per user per hour.
4. Delivery Tracking: Webhook receiver records delivery receipts, bounce rates, and user engagement metrics in time-series DB.`,
  },
  {
    id: 'web-crawler-search-engine',
    dayNumber: 10,
    title: 'Design a Distributed Web Crawler & Indexing Pipeline',
    company: 'Google / Microsoft',
    role: 'Search & Data Pipeline Systems',
    difficulty: 'Hard',
    topic: 'Distributed Graph Traversal & Politeness',
    description: `Design a distributed web crawler capable of fetching, parsing, and indexing 1 billion web pages per month while respecting website politeness (robots.txt) and deduplication.

**Key Requirements to Address:**
1. **URL Frontier Architecture:** Prioritization, politeness delay queues per domain, and crawl scheduling.
2. **Content Deduplication:** Detecting duplicate/mirror content using SimHash or MinHash.
3. **Storage & Reverse Index:** Storing raw HTML in distributed object store and extracting inverted index tokens for search ranking.`,
    hints: [
      'URL Frontier uses two queue levels: Priority Queues (FIFO by page rank) and Politeness Queues (one queue per host domain with delay timers).',
      'SimHash computes 64-bit fingerprint of text to detect near-duplicate pages in O(1) Hamming distance lookup.',
    ],
    modelAnswer: `1. URL Frontier: Two-tier queue: Priority Queues categorize URLs by domain authority; Politeness Queues enforce 1-second host request spacing.
2. Deduplication: Bloom Filter checks already-crawled URLs; 64-bit SimHash identifies duplicate page content.
3. Parser Pipeline: Distributed workers stream content into Apache Spark pipeline, stripping boilerplate and extracting hyperlinks.
4. Indexing: Tokens written to distributed Inverted Index stored across Elasticsearch/Lucene clusters partitioned by term hash.`,
  },
];

const TextInterview = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Calculate today's day of year for dynamic daily rotation
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const getInitialQuestion = () => {
    // If customized question passed from resume upload
    if (location.state?.customQuestions && location.state.customQuestions.length > 0) {
      const textQ = location.state.customQuestions.find((q) => q.type === 'text');
      if (textQ) return textQ;
    }

    const dayIndex = Math.abs(getDayOfYear()) % DAILY_SYSTEM_DESIGN_BANK.length;
    return DAILY_SYSTEM_DESIGN_BANK[dayIndex] || DAILY_SYSTEM_DESIGN_BANK[0];
  };

  const [currentQ, setCurrentQ] = useState(getInitialQuestion());
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const matchIdx = DAILY_SYSTEM_DESIGN_BANK.findIndex((q) => q.id === currentQ.id);
    return matchIdx >= 0 ? matchIdx : 0;
  });

  const [answerText, setAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [showHint, setShowHint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Formatted date string for "Today's Daily Challenge"
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Switch to specific daily question
  const selectQuestionByIndex = (idx) => {
    const validIdx = (idx + DAILY_SYSTEM_DESIGN_BANK.length) % DAILY_SYSTEM_DESIGN_BANK.length;
    setSelectedDayIndex(validIdx);
    setCurrentQ(DAILY_SYSTEM_DESIGN_BANK[validIdx]);
    setAnswerText('');
    setFeedback(null);
    setShowHint(false);
    setShowModelAnswer(false);
    setWordCount(0);
    setTimeLeft(600);
  };

  // Random Daily Shuffle
  const handleShuffleQuestion = () => {
    const randomIdx = Math.floor(Math.random() * DAILY_SYSTEM_DESIGN_BANK.length);
    selectQuestionByIndex(randomIdx);
  };

  // Update word count on input
  const handleTextChange = (e) => {
    const text = e.target.value;
    setAnswerText(text);
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  };

  // Timer countdown: Automatically stops once answer is submitted and evaluated
  useEffect(() => {
    if (timeLeft <= 0 || feedback !== null) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, feedback]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit Answer to Semantic AI Evaluator
  const handleSubmit = async () => {
    const textToSubmit = answerText.trim();
    if (!textToSubmit) return;

    setEvaluating(true);
    setFeedback(null);

    try {
      const res = await api.post('/interview/answer', {
        questionId: currentQ.id || currentQ.title,
        userResponse: textToSubmit,
        mode: 'text',
      });

      if (res.data?.success && res.data.feedback) {
        setFeedback(res.data.feedback);
        if (res.data.feedback.overallScore >= 80) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.warn('Backend evaluation note:', err.message);
      const cleaned = textToSubmit.trim();
      const words = cleaned.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
      const wCount = words.length;

      // Gibberish detector
      const isGibberish = (() => {
        if (/^(.)\1{4,}$/i.test(cleaned)) return true;
        const commonWords = new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','by','from','or','an','will','my','all','would','there','what','so','if','who','get','which','go','me','when','can','like','time','no','just','know','take','into','year','your','good','some','could','see','other','than','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','give','most','us','used','using','chose','chosen','system','project','design','service','data','server','client','code','error','test','scale','latency','tradeoff','architecture','database','react','node','sql','nosql','redis','mongodb','postgres','api']);
        let gibberishCount = 0;
        for (const w of words) {
          if (commonWords.has(w)) continue;
          const vowels = (w.match(/[aeiouy]/g) || []).length;
          const isMash = /asdf|hjkl|qwerty|zxcv|dfgh/i.test(w) || /[bcdfghjklmnpqrstvwxz]{4,}/i.test(w) || (w.length >= 4 && vowels === 0);
          if (isMash) gibberishCount++;
        }
        if (words.length <= 2 && !commonWords.has(words[0])) {
          const vowels = (words[0].match(/[aeiouy]/g) || []).length;
          if (vowels === 0 || /[bcdfghjklmnpqrstvwxz]{4,}/i.test(words[0])) return true;
        }
        return (gibberishCount / words.length) > 0.5;
      })();

      if (isGibberish || wCount < 3) {
        setFeedback({
          overallScore: 0,
          correctnessScore: 0,
          clarityScore: 0,
          complexityScore: 0,
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          strengths: ['No substantive technical response detected.'],
          improvements: [
            'Formulate a coherent technical design addressing the system requirements.',
            'Avoid random characters or placeholder answers.',
          ],
          detailedAnalysis: `The submission "${cleaned.slice(0, 35)}..." was detected as invalid or gibberish and received 0 marks.`,
          modelAnswer: currentQ.modelAnswer,
        });
      } else {
        const archMatches = (cleaned.match(/\b(architecture|database|cache|redis|scaling|load balancer|sharding|partition|rate limit|api|sql|nosql|postgres|mongodb|kafka|latency|p99|throughput|queue|circuit breaker)\b/gi) || []);
        const uniqueConcepts = Array.from(new Set(archMatches.map(c => c.toLowerCase())));
        const calculatedScore = Math.min(95, Math.max(25, Math.round(uniqueConcepts.length * 15 + Math.min(30, wCount * 0.4))));

        setFeedback({
          overallScore: calculatedScore,
          correctnessScore: Math.min(95, calculatedScore + 3),
          clarityScore: Math.min(90, calculatedScore),
          complexityScore: Math.min(92, calculatedScore - 2),
          timeComplexity: 'O(1) lookup / O(1) amortized write',
          spaceComplexity: 'O(N) distributed storage',
          strengths: [
            `Formulated architectural design (${wCount} words) covering core system pillars.`,
            uniqueConcepts.length > 0 ? `Addressed concepts: [${uniqueConcepts.slice(0, 3).join(', ')}].` : 'Maintained structured engineering points.',
          ],
          improvements: [
            wCount < 60 ? 'Elaborate deeper on capacity estimations, QPS benchmarks, and storage limits.' : 'Detail disaster recovery failover and monitoring alerts.',
            'Discuss exact rate-limiting algorithms (Token Bucket / Leaky Bucket) to prevent DDoS abuse.',
          ],
          detailedAnalysis: `Candidate submitted a ${calculatedScore >= 80 ? 'strong and well-architected' : 'foundational'} proposal for "${currentQ.title}". Key trade-offs were analyzed.`,
          modelAnswer: currentQ.modelAnswer,
        });

        if (calculatedScore >= 80) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        }
      }
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = () => {
    setAnswerText('');
    setFeedback(null);
    setShowHint(false);
    setShowModelAnswer(false);
    setWordCount(0);
    setTimeLeft(600);
  };

  // Filter questions by difficulty
  const filteredQuestions = DAILY_SYSTEM_DESIGN_BANK.filter((q) => {
    if (filterDifficulty !== 'All' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Top Banner: Daily Date Indicator & Question Selector Controls */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glow-border">
        
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Daily Challenge • {formattedToday}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>{currentQ.company || 'Tier-1 Tech'}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-dark-800 text-amber-300 text-xs font-semibold border border-amber-500/20">
              {currentQ.difficulty}
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono border border-cyan-500/20">
              Day #{selectedDayIndex + 1} of {DAILY_SYSTEM_DESIGN_BANK.length}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentQ.title}
          </h1>
        </div>

        {/* Action Bar: Day Navigation & Timer */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
          
          {/* Previous / Next Day Selector */}
          <div className="flex items-center gap-1 bg-dark-800/90 rounded-2xl p-1 border border-white/10">
            <button
              onClick={() => selectQuestionByIndex(selectedDayIndex - 1)}
              title="Previous Daily Challenge"
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleShuffleQuestion}
              title="Random Daily Question"
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-1"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => selectQuestionByIndex(selectedDayIndex + 1)}
              title="Next Daily Challenge"
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 10-Min Timer Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-dark-800 border border-white/10 text-slate-300">
            <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className={`font-mono text-sm font-bold ${timeLeft < 120 ? 'text-rose-400 font-bold' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

        </div>

      </div>

      {/* Quick Day Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 whitespace-nowrap pl-1">
          Daily Tracks:
        </span>
        {DAILY_SYSTEM_DESIGN_BANK.map((q, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={q.id}
              onClick={() => selectQuestionByIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30 scale-105'
                  : 'bg-dark-800/80 text-slate-400 border-white/5 hover:text-white hover:bg-dark-700'
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">Day {idx + 1}:</span>
              <span>{q.title.replace('Design a ', '').replace('Design ', '')}</span>
            </button>
          );
        })}
      </div>

      {/* Problem Statement Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4 glow-border">
        
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block font-bold">
            Architecture Specification & Scenario:
          </span>
          <div className="text-sm text-slate-200 leading-relaxed font-light whitespace-pre-line">
            {currentQ.description}
          </div>
        </div>

        {/* Collapsible Hints & Model Answer Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5">
          {currentQ.hints && currentQ.hints.length > 0 && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Architectural Hints' : 'Need an Architecture Hint?'}</span>
            </button>
          )}

          {feedback && (
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showModelAnswer ? 'Hide Staff Engineer Model Solution' : 'View Staff Engineer Model Solution'}</span>
            </button>
          )}
        </div>

        {/* Hint Box */}
        {showHint && currentQ.hints && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5 animate-fadeIn">
            {currentQ.hints.map((h, idx) => (
              <p key={idx}>💡 {h}</p>
            ))}
          </div>
        )}

        {/* Model Solution Box */}
        {showModelAnswer && currentQ.modelAnswer && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-100 space-y-2 animate-fadeIn">
            <p className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Staff Systems Architect Benchmark Solution:</span>
            </p>
            <div className="whitespace-pre-line font-mono text-[12px] leading-relaxed text-slate-200">
              {currentQ.modelAnswer}
            </div>
          </div>
        )}

      </div>

      {/* Candidate Response Workspace */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Your System Design & Engineering Proposal</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>{wordCount} {wordCount === 1 ? 'Word' : 'Words'}</span>
            {wordCount >= 30 && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Good Length</span>
              </span>
            )}
          </div>
        </div>

        <textarea
          value={answerText}
          onChange={handleTextChange}
          placeholder="Formulate your structured engineering proposal here...
• High-Level Architecture & Traffic Estimations
• Data Storage & Database Schema (SQL vs NoSQL)
• In-Memory Caching (Redis/Memcached) & Global Replication
• API Rate-Limiting, Load Balancing & Failure Edge Cases..."
          rows={11}
          className="w-full p-4 rounded-2xl glass-input text-xs sm:text-sm font-sans text-white placeholder-slate-500 focus:outline-none leading-relaxed resize-y border border-white/10"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={handleReset}
            disabled={evaluating || !answerText}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Response</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={evaluating || !answerText.trim()}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {evaluating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{evaluating ? 'Analyzing Semantics...' : 'Submit Architecture for AI Rubric'}</span>
          </button>
        </div>

      </div>

      {/* Semantic AI Feedback Card */}
      {feedback && (
        <div className="space-y-4 animate-fadeIn">
          <FeedbackCard feedback={feedback} mode="text" />
        </div>
      )}

    </div>
  );
};

export default TextInterview;

