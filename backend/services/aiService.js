const axios = require('axios');

/**
 * Enhanced Semantic Concept Clusters for System Design & Engineering Architecture
 * Matches related terms and synonyms (e.g., internationally == globally == multi-region)
 */
const SEMANTIC_TOPIC_DOMAINS = {
  architectureAndTechStack: {
    name: 'Architecture & Tech Stack Justification',
    keywords: [
      'react', 'vue', 'angular', 'next.js', 'node', 'express', 'nestjs', 'fastapi',
      'django', 'flask', 'spring boot', 'golang', 'rust', 'microservices', 'monolith',
      'rest', 'graphql', 'grpc', 'websocket', 'api gateway', 'cap theorem', 'acid', 'base',
      'stateless', 'stateful', 'decoupled', 'modularity', 'separation of concerns'
    ],
    weight: 20,
  },
  dataStorageAndSchema: {
    name: 'Database Architecture & Data Modeling',
    keywords: [
      'sql', 'nosql', 'mongodb', 'postgresql', 'postgres', 'mysql', 'dynamodb', 'cassandra',
      'schema', 'table', 'document', 'kv store', 'key-value', 'sharding', 'partition',
      'replication', 'acid', 'eventual consistency', 'read replica', 'write master',
      'b-tree', 'primary key', 'indexing', 'indexes', 'storage capacity', 'data model',
      'foreign key', 'normalization', 'denormalization', 'connection pool'
    ],
    weight: 20,
  },
  cachingAndPerformance: {
    name: 'Distributed Caching & Latency Optimization',
    keywords: [
      'cache', 'caching', 'redis', 'memcached', 'lru', 'eviction', 'ttl', 'write-through',
      'read-through', 'write-back', 'cache aside', 'in-memory', 'low latency', 'fast read',
      'memory store', 'hot keys', 'cdn', 'edge locations', 'geographic distribution',
      'globally', 'internationally', 'worldwide', 'multi-region', 'cross-geo', 'content delivery',
      'p99', 'p95', 'latency', 'qps', 'rps', 'throughput', 'bandwidth', 'bundle size', 'memory leak'
    ],
    weight: 20,
  },
  reliabilityAndFaultTolerance: {
    name: 'Failure Modes, Edge Cases & Error Recovery',
    keywords: [
      'circuit breaker', 'retry', 'exponential backoff', 'dead letter queue', 'dlq',
      'fallback', 'graceful degradation', 'fault tolerance', 'high availability',
      'failover', 'disaster recovery', 'health check', 'timeout', 'boundary conditions',
      'race condition', 'data corruption', 'idempotent', 'idempotency', 'rollback',
      'root cause', 'post-mortem', 'alerting', 'logging', 'telemetry', 'prometheus', 'grafana'
    ],
    weight: 20,
  },
  trafficAndResiliency: {
    name: 'Load Balancing, Traffic Scalability & Security',
    keywords: [
      'load balancer', 'load balancing', 'nginx', 'alb', 'reverse proxy',
      'rate limit', 'rate limiting', 'throttling', 'token bucket', 'leaky bucket',
      'dos', 'ddos', '429', 'horizontal scaling', 'vertical scaling', 'concurrency',
      'queue', 'kafka', 'rabbitmq', 'sqs', 'pub/sub', 'worker', 'async', 'background job'
    ],
    weight: 20,
  },
};

// Known technical/common abbreviations that might not have standard vowel patterns
const VALID_ACRONYMS = new Set([
  'sql', 'db', 'cpu', 'k8s', 'jwt', 'npm', 'aws', 'p99', 'p95', 'qps', 'rps', 'cap',
  'api', 'dom', 'css', 'html', 'cdn', 'sdk', 'ci', 'cd', 'ttl', 'ssl', 'tls', 'lru',
  'orm', 'io', 'vm', 'ui', 'ux', 'qa', 'pr', 'mr', 'os', 'ip', 'tcp', 'udp', 'dns',
  'ssh', 'rpc', 'grpc', 'acid', 'base', 'nosql', 'rdbms', 'rest', 'json', 'yaml', 'xml'
]);

// Common English words to validate vocabulary
const COMMON_ENGLISH_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not',
  'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from',
  'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
  'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which',
  'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
  'us', 'used', 'using', 'chose', 'chosen', 'system', 'project', 'design', 'service',
  'data', 'server', 'client', 'code', 'error', 'handle', 'handled', 'handling', 'test',
  'tested', 'testing', 'scale', 'scaling', 'scaled', 'performance', 'latency', 'tradeoff',
  'trade-offs', 'tradeoffs', 'architecture', 'database', 'frontend', 'backend', 'framework'
]);

/**
 * Check if the text is gibberish, keyboard mash, or nonsensical random characters
 */
const isGibberishOrInvalid = (text) => {
  if (!text || typeof text !== 'string') return true;
  const cleaned = text.trim();
  if (cleaned.length < 3) return true;

  // Check for repeated single character (e.g., 'aaaaaa', '.....')
  if (/^(.)\1{4,}$/i.test(cleaned)) return true;

  // Split into words
  const words = cleaned.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  let recognizedWords = 0;
  let gibberishWords = 0;

  for (const word of words) {
    if (VALID_ACRONYMS.has(word) || COMMON_ENGLISH_WORDS.has(word)) {
      recognizedWords++;
      continue;
    }

    const vowels = (word.match(/[aeiouy]/g) || []).length;
    const consonants = (word.match(/[bcdfghjklmnpqrstvwxz]/g) || []).length;
    const totalChars = word.length;

    const hasUnnaturalCluster = /[bcdfghjklmnpqrstvwxz]{5,}/i.test(word) ||
      (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(word) && !/(ngth|str|rch|nch|sch|tch)/i.test(word));

    const isKeyboardMash = /asdf|hjkl|qwerty|zxcv|dfgh|fghj|jkl;|lkjh|mnbv|vbnm/i.test(word);

    if (hasUnnaturalCluster || isKeyboardMash || (totalChars >= 4 && vowels === 0)) {
      gibberishWords++;
    } else if (vowels > 0 && consonants <= totalChars * 0.85) {
      recognizedWords++;
    } else {
      gibberishWords++;
    }
  }

  // If a single word or 2 words were entered (like "nnlvxvo") and it is not a recognized word or acronym
  if (words.length <= 2 && recognizedWords === 0) {
    return true;
  }

  // If more than 60% of words are gibberish
  if (gibberishWords / words.length > 0.6) {
    return true;
  }

  return false;
};

// Clean JSON response from AI LLMs
const extractJSON = (text) => {
  try {
    if (typeof text === 'object') return text;
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    if (match) {
      return JSON.parse(match[1] || match[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

/**
 * Call Gemini API or Groq API if keys are provided
 */
const callExternalLLM = async (prompt, systemInstruction = 'You are an expert Technical Interviewer and Staff Systems Architect at a Tier-1 tech company.') => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        },
        { timeout: 10000 }
      );
      const candidates = response.data?.candidates;
      if (candidates && candidates[0]?.content?.parts?.[0]?.text) {
        return extractJSON(candidates[0].content.parts[0].text);
      }
    } catch (err) {
      console.warn('⚠️ Gemini API note:', err.message);
    }
  }

  if (groqKey && groqKey.trim() !== '') {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: `${systemInstruction} Always respond in strict valid JSON.` },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: { Authorization: `Bearer ${groqKey}` },
          timeout: 8000,
        }
      );
      const text = response.data?.choices?.[0]?.message?.content;
      return extractJSON(text);
    } catch (err) {
      console.warn('⚠️ Groq API note:', err.message);
    }
  }

  if (openaiKey && openaiKey.trim() !== '') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `${systemInstruction} Always respond in strict valid JSON.` },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: { Authorization: `Bearer ${openaiKey}` },
          timeout: 8000,
        }
      );
      const text = response.data?.choices?.[0]?.message?.content;
      return extractJSON(text);
    } catch (err) {
      console.warn('⚠️ OpenAI API note:', err.message);
    }
  }

  return null;
};

/**
 * Deep Semantic Architecture & Engineering Rubric Evaluator
 * Evaluates semantic conceptual understanding, synonyms, and architectural trade-offs
 */
const smartSemanticEvaluation = (question, answer, mode = 'text') => {
  const ansText = (typeof answer === 'string' ? answer : (answer.text || answer.code || answer.audioTranscript || '')).trim();
  const words = ansText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Strict Gibberish / Non-Answer Detection -> 0 marks
  if (wordCount === 0 || isGibberishOrInvalid(ansText)) {
    return {
      overallScore: 0,
      correctnessScore: 0,
      clarityScore: 0,
      complexityScore: 0,
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      strengths: ['No substantive or valid technical response was detected.'],
      improvements: [
        'Formulate a coherent, articulate technical answer addressing the question directly.',
        'Avoid random characters or placeholder text—detail your specific architecture, trade-offs, or benchmarks.',
        'Structure your answer covering why specific technologies were chosen and how edge cases are mitigated.'
      ],
      detailedAnalysis: `The submission "${ansText.slice(0, 40)}${ansText.length > 40 ? '...' : ''}" is invalid or unintelligible gibberish. A score of 0 has been recorded. Please provide a relevant technical explanation.`,
      modelAnswer: question?.modelAnswer || 'Exemplary solution: 1) Capacity estimations & SLA requirements. 2) Choice of database & tech stack with trade-offs. 3) Caching & connection pooling. 4) Failure modes & circuit breaker recovery.',
    };
  }

  const lowerAns = ansText.toLowerCase();

  // 2. Track conceptual domain coverage
  const domainCoverage = {};
  const identifiedConcepts = [];
  let totalScore = 0;

  Object.keys(SEMANTIC_TOPIC_DOMAINS).forEach((domKey) => {
    const domain = SEMANTIC_TOPIC_DOMAINS[domKey];
    const matchedTokens = domain.keywords.filter((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(lowerAns);
    });

    domainCoverage[domKey] = {
      name: domain.name,
      matched: matchedTokens,
      score: matchedTokens.length > 0 ? Math.min(domain.weight, 10 + matchedTokens.length * 5) : 0,
    };

    if (matchedTokens.length > 0) {
      identifiedConcepts.push(...matchedTokens);
      totalScore += domainCoverage[domKey].score;
    }
  });

  // 3. If no technical concepts matched at all and answer is short or vague
  if (identifiedConcepts.length === 0) {
    const reasoningMatch = (lowerAns.match(/\b(because|therefore|tradeoff|bottleneck|latency|database|server|client|architecture|problem|solution|tested|optimized|improved)\b/g) || []).length;
    
    if (reasoningMatch === 0 || wordCount < 10) {
      return {
        overallScore: 0,
        correctnessScore: 0,
        clarityScore: 0,
        complexityScore: 0,
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        strengths: ['No relevant technical concepts or engineering justifications detected.'],
        improvements: [
          'Address the prompt using specific architectural patterns, framework selections, or database trade-offs.',
          'Quantify metrics (e.g. latency, throughput, error rates) rather than generic phrases.',
        ],
        detailedAnalysis: `The submission does not contain technical content relevant to "${question.title || 'the assessment'}". A score of 0 has been assigned.`,
        modelAnswer: question?.modelAnswer || 'Exemplary solution details specific trade-offs, technology choices, and fault tolerance mechanisms.',
      };
    }

    const partialScore = Math.min(25, reasoningMatch * 5 + Math.round(wordCount * 0.2));
    return {
      overallScore: partialScore,
      correctnessScore: Math.min(30, partialScore),
      clarityScore: 35,
      complexityScore: 20,
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      strengths: ['Identified general reasoning, but missing concrete technical terminology and architecture specifics.'],
      improvements: [
        'Incorporate specific technologies (e.g., PostgreSQL vs MongoDB, Redis caching, Nginx load balancing).',
        'Elaborate on quantitative latency and scalability benchmarks.',
      ],
      detailedAnalysis: `Candidate provided a high-level response (${wordCount} words) but lacked depth in specific technical stacks and failure modes.`,
      modelAnswer: question?.modelAnswer || 'Exemplary solution details specific trade-offs, technology choices, and fault tolerance mechanisms.',
    };
  }

  // 4. Calculate rubric scores based on semantic depth & length
  let correctness = Math.min(95, Math.max(20, Math.round(totalScore)));
  let clarity = 40;
  let complexity = 35;

  if (wordCount < 20) {
    const briefScore = Math.min(50, Math.max(20, identifiedConcepts.length * 10 + wordCount));
    return {
      overallScore: briefScore,
      correctnessScore: Math.min(55, briefScore + 5),
      clarityScore: 40,
      complexityScore: 30,
      timeComplexity: 'O(1) lookup / O(N) storage',
      spaceComplexity: 'O(N) distributed storage',
      strengths: [
        `Identified relevant concepts: [${identifiedConcepts.slice(0, 3).join(', ')}].`,
      ],
      improvements: [
        'Expand with in-depth architectural justification rather than brief mentions.',
        'Address failover mechanisms, retry logic, and quantitative performance benchmarks.',
      ],
      detailedAnalysis: `The response mentions key technical terms but is brief (${wordCount} words). Expand on root causes and trade-offs to reach senior-level depth.`,
      modelAnswer: question?.modelAnswer || 'Comprehensive architectural response covering trade-offs, caching, indexing, and failure recovery.',
    };
  }

  // Length and structure scaling for substantive answers
  if (wordCount >= 30) clarity = Math.min(95, 55 + Math.round(wordCount / 4));
  if (wordCount >= 50) complexity = Math.min(95, 55 + identifiedConcepts.length * 5);

  const overallScore = Math.min(98, Math.max(25, Math.round(correctness * 0.5 + clarity * 0.25 + complexity * 0.25)));

  // Generate dynamic strengths
  const strengths = [];
  Object.keys(domainCoverage).forEach((domKey) => {
    const cov = domainCoverage[domKey];
    if (cov.matched.length > 0) {
      strengths.push(`Solid grasp of ${cov.name} (${cov.matched.slice(0, 3).join(', ')}).`);
    }
  });

  if (strengths.length === 0) {
    strengths.push(`Addressed core technical context with ${wordCount} words.`);
  }

  // Generate actionable improvements
  const improvements = [];
  Object.keys(domainCoverage).forEach((domKey) => {
    const cov = domainCoverage[domKey];
    if (cov.matched.length === 0) {
      if (domKey === 'reliabilityAndFaultTolerance') {
        improvements.push('Detail failure modes, circuit breakers, and automated recovery procedures.');
      } else if (domKey === 'cachingAndPerformance') {
        improvements.push('Incorporate caching strategies (e.g. Redis LRU) and quantify p99 latency targets.');
      } else if (domKey === 'trafficAndResiliency') {
        improvements.push('Discuss rate limiting (Token Bucket) and load balancing to handle traffic spikes.');
      }
    }
  });

  if (improvements.length === 0) {
    improvements.push('Consider detailing telemetry metrics (Prometheus/Grafana) and automated canary rollouts.');
  }

  return {
    overallScore,
    correctnessScore: Math.min(95, correctness),
    clarityScore: Math.min(95, clarity),
    complexityScore: Math.min(95, complexity),
    timeComplexity: 'O(1) read / O(1) write',
    spaceComplexity: 'O(N) distributed storage',
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    detailedAnalysis: `Candidate submitted a ${overallScore >= 80 ? 'comprehensive and well-architected' : 'foundational'} defense. Conceptual coverage of ${identifiedConcepts.slice(0, 3).join(', ')} is demonstrated.`,
    modelAnswer: question?.modelAnswer || 'Exemplary solution: 1) Capacity estimations (100:1 read/write). 2) Base62 URL encoding. 3) Redis LRU caching for hot keys. 4) Token bucket rate limiting with Nginx load balancing.',
  };
};

/**
 * Fetch GitHub Repository Info & README Summary
 */
const fetchGithubRepoSummary = async (repoUrl) => {
  if (!repoUrl || typeof repoUrl !== 'string') return null;

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\s#?]+)/i) || repoUrl.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (!match) return null;

  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, '');

  try {
    const headers = {
      'User-Agent': 'AI-Interview-Prep-Platform',
      'Accept': 'application/vnd.github.v3+json',
    };

    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      timeout: 6000,
    });

    const repoData = repoRes.data || {};
    let readmeText = '';

    try {
      const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
        timeout: 6000,
      });
      if (readmeRes.data?.content) {
        readmeText = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
      }
    } catch (e) {
      try {
        const rawRes = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`, { timeout: 4000 });
        readmeText = typeof rawRes.data === 'string' ? rawRes.data : '';
      } catch (e2) {}
    }

    const cleanedReadme = readmeText
      .replace(/<[^>]*>/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .slice(0, 1200)
      .trim();

    return {
      owner,
      repo,
      fullName: repoData.full_name || `${owner}/${repo}`,
      description: repoData.description || '',
      language: repoData.language || '',
      topics: repoData.topics || [],
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      readmeSnippet: cleanedReadme,
      repoUrl: repoData.html_url || `https://github.com/${owner}/${repo}`,
    };
  } catch (err) {
    console.warn(`GitHub API note for ${owner}/${repo}:`, err.message);
    return {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      description: '',
      language: '',
      topics: [],
      readmeSnippet: '',
      repoUrl: `https://github.com/${owner}/${repo}`,
    };
  }
};

/**
 * Generate Customized Project Defense Questions tailored to a candidate's specific project & repo
 */
const generateProjectDefenseQuestions = async (projectDetails = {}) => {
  const { title = 'Flagship System', description = '', techStack = '', repoUrl = '', repoSummary = null } = projectDetails;

  const stackString = Array.isArray(techStack) ? techStack.join(', ') : techStack;
  const repoContextString = repoSummary
    ? `GitHub Repository: ${repoSummary.fullName} (${repoSummary.language || 'Codebase'})
Description: ${repoSummary.description || 'N/A'}
Topics: ${(repoSummary.topics || []).join(', ') || 'N/A'}
README Excerpt: ${repoSummary.readmeSnippet || 'N/A'}`
    : repoUrl ? `GitHub URL: ${repoUrl}` : '';

  const prompt = `
You are a Principal Engineering Director and Hiring Manager at a Tier-1 tech company conducting a high-pressure Project Defense panel.
The candidate claims to have designed and built the following project:

Project Name: "${title}"
Project Description: "${description || 'Full stack software architecture'}"
Tech Stack / Components: "${stackString || 'Modern Web / Backend Architecture'}"
${repoContextString}

Generate exactly 3 deep, customized technical defense questions specifically tailored to this project's architecture, tech stack, and use cases:
1. Question 1 (Architecture & Trade-offs): Ask why they chose their specific stack / databases / framework for "${title}" over alternatives, focusing on latency, concurrency, and data consistency trade-offs.
2. Question 2 (Edge Cases & Failure Recovery): Ask about the worst-case production failure mode, race condition, data corruption risk, or third-party service outage in "${title}", and how their error handling / circuit breaker prevents cascading failure.
3. Question 3 (Scale & Bottlenecks): Ask about concrete production benchmarks (p99 latency ms, QPS, memory footprint) and where "${title}" breaks first if user load increases 100x overnight.

Return a strict JSON object:
{
  "questions": [
    {
      "id": "proj-1",
      "title": "Architectural Trade-offs & Stack Justification for ${title}",
      "topic": "Architecture & System Decisions",
      "description": "Specific question text tailored to ${title} and ${stackString}...",
      "evaluationTips": "Specific focus points tailored to their stack...",
      "modelAnswer": "Exemplary staff-level defense covering trade-offs in ${stackString}..."
    },
    {
      "id": "proj-2",
      "title": "Failure Modes, Race Conditions & Resilience in ${title}",
      "topic": "Reliability & Fault Tolerance",
      "description": "Specific failure recovery question tailored to ${title}...",
      "evaluationTips": "Specific focus on circuit breakers, retries, and data safeguards...",
      "modelAnswer": "Exemplary resilience response for ${title}..."
    },
    {
      "id": "proj-3",
      "title": "Production Bottlenecks & 100x Scale Limits for ${title}",
      "topic": "Scalability & Performance Benchmarks",
      "description": "Specific performance and scale limit question tailored to ${title}...",
      "evaluationTips": "Focus on p99 latency ms, database sharding/caching, and queue throughput...",
      "modelAnswer": "Exemplary benchmark analysis with concrete metrics for ${title}..."
    }
  ]
}
`;

  try {
    const externalResult = await callExternalLLM(prompt);
    if (externalResult && Array.isArray(externalResult.questions) && externalResult.questions.length >= 3) {
      return externalResult.questions.map((q, idx) => ({
        id: `proj-${idx + 1}`,
        title: q.title || `Project Defense Question ${idx + 1}`,
        topic: q.topic || 'System Architecture',
        description: q.description || '',
        evaluationTips: q.evaluationTips || 'Focus on concrete engineering trade-offs and quantitative benchmarks.',
        modelAnswer: q.modelAnswer || 'Exemplary solution addresses specific trade-offs and architecture.',
      }));
    }
  } catch (e) {
    console.warn('AI Project Defense generation note:', e.message);
  }

  const projName = title || 'Flagship System';
  const stack = stackString || 'selected frameworks and databases';

  return [
    {
      id: 'proj-1',
      title: `Architectural Trade-offs & Stack Justification for ${projName}`,
      topic: 'Architecture & System Decisions',
      description: `In "${projName}", explain why you selected ${stack} over alternative technologies. What were the specific latency, concurrency, and data persistence trade-offs you evaluated?`,
      evaluationTips: `Highlight why ${stack} was appropriate, discussing throughput, CAP theorem, or operational complexity.`,
      modelAnswer: `In "${projName}", we selected ${stack} to balance developer velocity with query latency. We evaluated relational vs NoSQL persistence, connection pooling, and decoupled microservices to achieve high availability.`,
    },
    {
      id: 'proj-2',
      title: `Failure Modes, Edge Cases & Error Recovery in ${projName}`,
      topic: 'Reliability & Fault Tolerance',
      description: `Describe the worst edge case, race condition, or failure mode you encountered in "${projName}". How did you isolate root causes and implement circuit breakers, retry logic, or graceful fallbacks?`,
      evaluationTips: 'Focus on root-cause diagnosis, transactional integrity, automated retries with backoff, and dead-letter queues.',
      modelAnswer: `During peak stress testing on "${projName}", we identified connection saturation. We mitigated this with circuit breakers, idempotent retry keys, and exponential backoff.`,
    },
    {
      id: 'proj-3',
      title: `Production Benchmarks & 100x Scaling Limits for ${projName}`,
      topic: 'Scalability & Performance Benchmarks',
      description: `What key metrics (e.g. p99 latency in ms, QPS, memory utilization, bundle size) did you measure in "${projName}"? If user traffic spiked 100x overnight, where is the first single point of failure and how would you resolve it?`,
      evaluationTips: 'Quantify metrics (p99 latency, RPS, memory footprints) and specify caching, read replicas, or horizontal sharding strategies.',
      modelAnswer: `We benchmarked "${projName}" under load, achieving p99 response times below 80ms. At 100x traffic, the primary database would bottleneck; we resolve this with Redis read-through caching and database sharding.`,
    },
  ];
};

/**
 * Main Evaluate Answer Function
 */
const evaluateAnswer = async (question, userResponse, mode = 'text', projectContext = null) => {
  const answerContent = (
    typeof userResponse === 'string'
      ? userResponse
      : (userResponse.text || userResponse.code || userResponse.audioTranscript || '')
  ).trim();

  // 1. Immediate gibberish / empty / nonsense check
  if (!answerContent || answerContent.length < 3 || isGibberishOrInvalid(answerContent)) {
    return smartSemanticEvaluation(question, answerContent, mode);
  }

  let projectContextPrompt = '';
  if (projectContext && (projectContext.title || projectContext.name)) {
    const pTitle = projectContext.title || projectContext.name;
    const pDesc = projectContext.description || 'N/A';
    const pStack = Array.isArray(projectContext.techStack) ? projectContext.techStack.join(', ') : (projectContext.techStack || 'N/A');
    projectContextPrompt = `
TARGET PROJECT CONTEXT (Candidate claims to defend this specific project):
- Project Title: "${pTitle}"
- Project Description: "${pDesc}"
- Tech Stack: "${pStack}"
${projectContext.repoUrl ? `- GitHub Repo: ${projectContext.repoUrl}` : ''}
${projectContext.repoSummary?.readmeSnippet ? `- README Excerpt: ${projectContext.repoSummary.readmeSnippet.slice(0, 300)}` : ''}

PROJECT-SPECIFIC EVALUATION RULE:
- Check whether the candidate's answer actually addresses and is consistent with the architecture of "${pTitle}".
- Reward specific technical details (databases, APIs, algorithms, failure handling) matching this project.
- If the answer is completely off-topic or contradicts their claimed stack, reduce correctness score accordingly.
`;
  }

  const prompt = `
You are a Staff Software Engineer and Principal Interviewer at a Tier-1 tech company.
Evaluate the candidate's interview answer objectively and strictly on its technical merit.
${projectContextPrompt}

CRITICAL GRADING RULES:
1. GIBBERISH / SPAM / NON-ANSWERS: If the candidate's answer is random characters (e.g. "nnlvxvo", "asdfgh"), keyboard mash, completely nonsensical, blank, or completely off-topic/evasive, you MUST assign:
   - overallScore: 0
   - correctnessScore: 0
   - clarityScore: 0
   - complexityScore: 0
   - strengths: ["No valid technical answer provided."]
   - improvements: ["Formulate a clear, structured technical explanation addressing the question."]
   - detailedAnalysis: "The submitted response is unintelligible gibberish or unrelated text and received 0 marks."
   Do NOT give partial credit or default marks (e.g. 50 or 60) for gibberish.

2. MERIT-BASED SCORING:
   - 0: Gibberish, irrelevant keystrokes, completely invalid.
   - 1-40: Very shallow, missing key architectural justification or trade-offs.
   - 41-69: Partially complete, mentions technologies without deep trade-offs or metrics.
   - 70-84: Solid, competent technical defense covering architecture, trade-offs, and failure modes.
   - 85-100: Exemplary Staff-level response with quantifiable benchmarks, recovery patterns, and deep trade-offs.

Question Title: "${question.title || 'Technical Assessment'}"
Question Description: "${question.description || ''}"
Question Topic: "${question.topic || 'General Technical'}"
Interview Mode: "${mode}"

Candidate's Submitted Answer:
"""
${answerContent}
"""

Return a strict JSON object with this exact schema:
{
  "overallScore": number (0-100),
  "correctnessScore": number (0-100),
  "clarityScore": number (0-100),
  "complexityScore": number (0-100),
  "timeComplexity": string (e.g. "O(1) read" or "N/A"),
  "spaceComplexity": string (e.g. "O(N) storage" or "N/A"),
  "strengths": string[] (2-3 specific points acknowledging exact concepts candidate explained),
  "improvements": string[] (2-3 actionable coaching points on missing trade-offs, scale, or failure handling),
  "detailedAnalysis": string (2-3 sentences summarizing performance),
  "modelAnswer": string (exemplary reference architecture)
}
`;

  try {
    const externalResult = await callExternalLLM(prompt);
    if (externalResult && typeof externalResult.overallScore === 'number') {
      return externalResult;
    }
  } catch (e) {
    console.warn('External AI call note:', e.message);
  }

  return smartSemanticEvaluation(question, answerContent, mode);
};

/**
 * Generate Questions from Resume Skills & Projects
 */
const generateResumeQuestions = async (extractedSkills = {}, projects = [], targetRole = 'Full Stack Software Engineer') => {
  const allFoundSkills = [
    ...(extractedSkills.languages || []),
    ...(extractedSkills.frameworks || []),
    ...(extractedSkills.databases || []),
    ...(extractedSkills.tools || []),
    ...(extractedSkills.concepts || []),
  ];

  if (allFoundSkills.length === 0) {
    return [];
  }

  const prompt = `
A candidate targeting the role "${targetRole}" has the following skills strictly extracted from their resume:
Languages: ${extractedSkills.languages?.join(', ') || 'N/A'}
Frameworks: ${extractedSkills.frameworks?.join(', ') || 'N/A'}
Databases: ${extractedSkills.databases?.join(', ') || 'N/A'}
Tools: ${extractedSkills.tools?.join(', ') || 'N/A'}
Concepts: ${extractedSkills.concepts?.join(', ') || 'N/A'}
Resume Projects: ${JSON.stringify(projects.slice(0, 3))}

Generate 3-4 interview questions based ONLY on the actual skills and projects listed above.
Do not ask about technologies that are not listed in their skills or projects.
Return a strict JSON object:
{
  "questions": [
    {
      "title": "Short question title",
      "description": "In-depth technical or architectural question tailored to their stack",
      "topic": "Resume Project Deep-Dive" | "Technical Stack Review" | "Data Structures & Algorithms" | "System Architecture & Scalability",
      "difficulty": "Easy" | "Medium" | "Hard",
      "type": "text" | "code" | "voice",
      "hints": ["hint 1", "hint 2"],
      "modelAnswer": "Ideal answer covering implementation, trade-offs, and best practices"
    }
  ]
}
`;

  try {
    const externalResult = await callExternalLLM(prompt);
    if (externalResult && Array.isArray(externalResult.questions) && externalResult.questions.length > 0) {
      return externalResult.questions;
    }
  } catch (e) {}

  const primaryLang = extractedSkills.languages?.[0] || 'Python/JavaScript';
  const primaryFramework = extractedSkills.frameworks?.[0] || extractedSkills.languages?.[0] || 'Core Architecture';
  const primaryDB = extractedSkills.databases?.[0] || 'relational/NoSQL databases';

  return [
    {
      title: `Technical Deep-Dive: Building with ${primaryFramework} & ${primaryDB}`,
      description: `In your engineering work involving ${primaryFramework} and ${primaryDB}, how did you handle data consistency, performance bottlenecks, and asynchronous execution under load?`,
      topic: 'Technical Stack Review',
      difficulty: 'Medium',
      type: 'text',
      hints: [
        `Discuss indexing and connection caching strategies in ${primaryDB}.`,
        'Explain error handling and asynchronous event handling.',
      ],
      modelAnswer: `In robust architectures with ${primaryFramework}, we optimize queries using structured indexing on ${primaryDB}, decouple long-running operations using async task queues, and maintain persistent connection pools with automated retry logic.`,
    },
  ];
};

module.exports = {
  evaluateAnswer,
  generateResumeQuestions,
  generateProjectDefenseQuestions,
  fetchGithubRepoSummary,
  callExternalLLM,
  smartSemanticEvaluation,
};

