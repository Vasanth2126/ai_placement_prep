const pdf = require('pdf-parse');
const { generateResumeQuestions } = require('./aiService');

// Canonical dictionary mapping technical keywords
const CANONICAL_SKILL_NAMES = {
  // Languages
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'golang': 'Go',
  'go': 'Go',
  'ruby': 'Ruby',
  'php': 'PHP',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'rust': 'Rust',
  'c': 'C',
  'sql': 'SQL',
  'html': 'HTML5',
  'html5': 'HTML5',
  'css': 'CSS3',
  'css3': 'CSS3',
  'bash': 'Bash',
  'shell': 'Shell Scripting',
  'r': 'R',
  'dart': 'Dart',
  'scala': 'Scala',

  // Frameworks & Libraries
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'react native': 'React Native',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express.js',
  'express.js': 'Express.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'nest.js': 'NestJS',
  'nestjs': 'NestJS',
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'spring boot': 'Spring Boot',
  'spring': 'Spring Boot',
  'laravel': 'Laravel',
  'asp.net': 'ASP.NET',
  '.net': '.NET',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'redux': 'Redux',
  'zustand': 'Zustand',
  'material-ui': 'Material UI',
  'mui': 'Material UI',
  'graphql': 'GraphQL',

  // Databases
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mysql': 'MySQL',
  'sqlite': 'SQLite',
  'redis': 'Redis',
  'firebase': 'Firebase',
  'firestore': 'Firestore',
  'dynamodb': 'DynamoDB',
  'cassandra': 'Cassandra',
  'oracle': 'Oracle DB',
  'elasticsearch': 'Elasticsearch',
  'supabase': 'Supabase',
  'prisma': 'Prisma ORM',
  'mongoose': 'Mongoose',
  'mariadb': 'MariaDB',
  'neo4j': 'Neo4j',

  // Tools, Cloud & DevOps
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'Google Cloud (GCP)',
  'google cloud': 'Google Cloud (GCP)',
  'linux': 'Linux',
  'postman': 'Postman',
  'jest': 'Jest',
  'cypress': 'Cypress',
  'mocha': 'Mocha',
  'webpack': 'Webpack',
  'vite': 'Vite',
  'ci/cd': 'CI/CD Pipelines',
  'cicd': 'CI/CD Pipelines',
  'jenkins': 'Jenkins',
  'github actions': 'GitHub Actions',
  'jira': 'Jira',
  'figma': 'Figma',
  'kafka': 'Apache Kafka',
  'rabbitmq': 'RabbitMQ',
  'socket.io': 'Socket.io',
  'webrtc': 'WebRTC',
  'terraform': 'Terraform',
  'nginx': 'Nginx',

  // Core CS Concepts & Architecture
  'data structures': 'Data Structures',
  'algorithms': 'Algorithms',
  'system design': 'System Design',
  'rest api': 'RESTful APIs',
  'restful api': 'RESTful APIs',
  'rest': 'RESTful APIs',
  'microservices': 'Microservices Architecture',
  'object-oriented programming': 'OOP (Object Oriented)',
  'oops': 'OOP (Object Oriented)',
  'oop': 'OOP (Object Oriented)',
  'jwt': 'JWT Authentication',
  'oauth': 'OAuth 2.0',
  'agile': 'Agile / Scrum',
  'scrum': 'Agile / Scrum',
  'multithreading': 'Multithreading & Concurrency',
  'concurrency': 'Multithreading & Concurrency',
  'unit testing': 'Unit Testing & TDD',
  'tdd': 'Unit Testing & TDD',
  'mvc': 'MVC Architecture',
  'caching': 'Distributed Caching',
  'load balancing': 'Load Balancing',
  'indexing': 'Database Indexing & Optimization',
};

const SKILL_CATEGORIES = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'cpp', 'c#', 'csharp', 'golang', 'go',
    'ruby', 'php', 'swift', 'kotlin', 'rust', 'c', 'sql', 'html', 'html5', 'css', 'css3', 'bash', 'shell', 'r', 'dart', 'scala'
  ],
  frameworks: [
    'react', 'react.js', 'reactjs', 'react native', 'node.js', 'nodejs', 'express', 'express.js',
    'next.js', 'nextjs', 'nest.js', 'nestjs', 'vue', 'vue.js', 'vuejs', 'angular', 'django', 'flask', 'fastapi',
    'spring boot', 'spring', 'laravel', 'asp.net', '.net', 'tailwind', 'tailwindcss', 'bootstrap',
    'redux', 'zustand', 'material-ui', 'mui', 'graphql'
  ],
  databases: [
    'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'firebase', 'firestore',
    'dynamodb', 'cassandra', 'oracle', 'elasticsearch', 'supabase', 'prisma', 'mongoose', 'mariadb', 'neo4j'
  ],
  tools: [
    'git', 'github', 'gitlab', 'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'google cloud',
    'linux', 'postman', 'jest', 'cypress', 'mocha', 'webpack', 'vite', 'ci/cd', 'cicd', 'jenkins',
    'github actions', 'jira', 'figma', 'kafka', 'rabbitmq', 'socket.io', 'webrtc', 'terraform', 'nginx'
  ],
  concepts: [
    'data structures', 'algorithms', 'system design', 'rest api', 'restful api', 'rest',
    'microservices', 'object-oriented programming', 'oops', 'oop', 'jwt', 'oauth',
    'agile', 'scrum', 'multithreading', 'concurrency', 'unit testing', 'tdd', 'mvc', 'caching', 'load balancing', 'indexing'
  ]
};

// Target Job Role Benchmark Standards with required and recommended competencies
const ROLE_BENCHMARKS = {
  'Full Stack Software Engineer': {
    required: ['JavaScript', 'React', 'Node.js', 'Express.js', 'SQL', 'MongoDB', 'Git', 'RESTful APIs', 'Data Structures'],
    recommended: ['TypeScript', 'Docker', 'Redis', 'Tailwind CSS', 'Next.js', 'CI/CD Pipelines', 'System Design', 'Unit Testing & TDD'],
  },
  'Backend Software Engineer': {
    required: ['Node.js', 'Express.js', 'SQL', 'PostgreSQL', 'MongoDB', 'RESTful APIs', 'Data Structures', 'Git'],
    recommended: ['Redis', 'Docker', 'System Design', 'Microservices Architecture', 'AWS', 'Distributed Caching', 'Apache Kafka', 'CI/CD Pipelines'],
  },
  'Frontend Software Engineer': {
    required: ['JavaScript', 'React', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'RESTful APIs'],
    recommended: ['Next.js', 'Redux', 'Vite', 'UI/UX & Responsive Design', 'GraphQL', 'Unit Testing & TDD', 'Webpack'],
  },
  'DevOps & Cloud Engineer': {
    required: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD Pipelines', 'Git', 'Bash', 'Terraform'],
    recommended: ['Jenkins', 'GitHub Actions', 'Nginx', 'Monitoring & Logging', 'Python', 'Go', 'Azure', 'Microservices Architecture'],
  },
  'Data Structures & Algorithms Core': {
    required: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'OOP (Object Oriented)', 'System Design'],
    recommended: ['SQL', 'Multithreading & Concurrency', 'Dynamic Programming', 'Graph Theory', 'Git', 'Linux'],
  },
};

/**
 * Match a skill token safely against text (handling C++, C#, .NET, CI/CD, etc.)
 */
const matchesSkill = (rawText, skillToken) => {
  const escaped = skillToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startPattern = /^[a-zA-Z0-9]/.test(skillToken) ? '(?:^|[^a-zA-Z0-9])' : '';
  let endPattern = '';
  
  if (skillToken === 'c' || skillToken === 'r') {
    endPattern = '(?=$|[^a-zA-Z0-9+#])';
  } else if (/[a-zA-Z0-9]$/.test(skillToken)) {
    endPattern = '(?=$|[^a-zA-Z0-9])';
  } else {
    endPattern = '(?=$|[^a-zA-Z0-9+#])';
  }

  const regex = new RegExp(`${startPattern}${escaped}${endPattern}`, 'i');
  return regex.test(rawText);
};

const zlib = require('zlib');

/**
 * Extract raw text from PDF buffer with multi-layer fallback decoding
 */
const extractTextFromPDF = async (pdfBuffer) => {
  // Layer 1: Standard pdf-parse library
  try {
    const data = await pdf(pdfBuffer);
    if (data && data.text && data.text.trim().length > 10) {
      return data.text.trim();
    }
  } catch (error) {
    console.warn('pdf-parse notice, attempting stream decompression...');
  }

  // Layer 2: Decompress PDF streams (FlateDecode) & parse text operators
  try {
    const rawBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    const bufferStr = rawBuffer.toString('binary');
    const decompressedTexts = [];

    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch;

    while ((streamMatch = streamRegex.exec(bufferStr)) !== null) {
      const streamBytes = Buffer.from(streamMatch[1], 'binary');
      let textContent = '';
      try {
        const uncompressed = zlib.inflateSync(streamBytes);
        textContent = uncompressed.toString('utf8');
      } catch (e) {
        try {
          const uncompressedRaw = zlib.inflateRawSync(streamBytes);
          textContent = uncompressedRaw.toString('utf8');
        } catch (e2) {
          textContent = streamBytes.toString('utf8');
        }
      }

      // Extract text from (text) Tj
      const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
      let match;
      while ((match = tjRegex.exec(textContent)) !== null) {
        decompressedTexts.push(match[1].replace(/\\([()\\])/g, '$1'));
      }

      // Extract text from [(text)] TJ
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      while ((match = tjArrayRegex.exec(textContent)) !== null) {
        const innerTexts = match[1].match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g);
        if (innerTexts) {
          decompressedTexts.push(
            innerTexts.map((t) => t.slice(1, -1).replace(/\\([()\\])/g, '$1')).join(' ')
          );
        }
      }
    }

    if (decompressedTexts.length > 0) {
      return decompressedTexts.join('\n').trim();
    }

    // Layer 3: Printable string fallback
    const cleanChars = bufferStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    const meaningfulLines = cleanChars
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 4 && !l.startsWith('<<') && !l.startsWith('obj') && !l.startsWith('endobj') && !l.startsWith('/'));

    if (meaningfulLines.length > 5) {
      return meaningfulLines.join('\n');
    }
  } catch (fallbackErr) {
    console.error('Fallback PDF decoding failed:', fallbackErr);
  }

  throw new Error('Failed to extract text from the uploaded PDF. Please ensure it is a valid, readable PDF document.');
};

/**
 * Detect if the text contains standard resume structural elements
 */
const detectResumeStructure = (rawText) => {
  const sectionKeywords = [
    'experience', 'education', 'projects', 'skills', 'technical skills',
    'work history', 'employment', 'certifications', 'summary', 'objective',
    'academic', 'curriculum vitae', 'resume', 'contact', 'email', 'phone',
    'github', 'linkedin', 'b.tech', 'b.e.', 'bachelor', 'master', 'university', 'college'
  ];

  const matchedSections = sectionKeywords.filter((sec) => {
    const regex = new RegExp(`\\b${sec}\\b`, 'i');
    return regex.test(rawText);
  });

  return {
    matchedSectionCount: matchedSections.length,
    hasContactInfo: /(@|\+?\d{10}|github\.com|linkedin\.com)/i.test(rawText),
    hasEducation: /(education|degree|bachelor|master|b\.tech|b\.e|b\.sc|university|college|gpa|cgpa)/i.test(rawText),
    hasProjects: /(projects?|technical projects|academic projects)/i.test(rawText),
    hasExperience: /(experience|internship|employment|work history)/i.test(rawText),
    hasSkillsSection: /(skills?|technical skills|technologies|proficiencies)/i.test(rawText),
  };
};

/**
 * Extract skills and actual projects from raw resume text
 */
const extractSkillsTaxonomy = (rawText) => {
  const extracted = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    concepts: [],
  };

  const detectedCanonical = new Set();

  for (const category of Object.keys(SKILL_CATEGORIES)) {
    const tokens = SKILL_CATEGORIES[category];
    const categorySkills = new Set();

    for (const token of tokens) {
      if (matchesSkill(rawText, token)) {
        const canonical = CANONICAL_SKILL_NAMES[token] || (token.charAt(0).toUpperCase() + token.slice(1));
        if (!detectedCanonical.has(canonical)) {
          categorySkills.add(canonical);
          detectedCanonical.add(canonical);
        }
      }
    }

    extracted[category] = Array.from(categorySkills);
  }

  // Detect projects strictly from project sections in the resume
  const projects = [];
  const projectSectionRegex = /(?:PROJECTS|PROJECT EXPERIENCE|KEY PROJECTS|ACADEMIC PROJECTS|TECHNICAL PROJECTS)[\s\S]*?(?:EDUCATION|WORK EXPERIENCE|EXPERIENCE|CERTIFICATIONS|ACHIEVEMENTS|PUBLICATIONS|SKILLS|TECHNICAL SKILLS|$)/i;
  const projectSection = rawText.match(projectSectionRegex);

  if (projectSection) {
    const lines = projectSection[0]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5 && !/^(PROJECTS|KEY PROJECTS|ACADEMIC PROJECTS|TECHNICAL PROJECTS|PROJECT EXPERIENCE)/i.test(l));

    let currentProject = null;

    for (let i = 0; i < lines.length && projects.length < 3; i++) {
      const line = lines[i];
      // Title line: short line without bullet characters
      if (line.length < 75 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
        if (currentProject && currentProject.title) {
          projects.push(currentProject);
        }
        
        const cleanTitle = line.replace(/[|•–—].*$/, '').trim();
        // Extract any tech mentioned in title line
        const projectTech = [];
        for (const skill of detectedCanonical) {
          if (line.toLowerCase().includes(skill.toLowerCase())) {
            projectTech.push(skill);
          }
        }

        currentProject = {
          title: cleanTitle || 'Technical Project',
          description: '',
          techStack: projectTech,
        };
      } else if (currentProject) {
        if (!currentProject.description) {
          currentProject.description = line.replace(/^[•\-*]\s*/, '').trim();
        }
        // Extract tech mentioned in description
        for (const skill of detectedCanonical) {
          if (line.toLowerCase().includes(skill.toLowerCase()) && !currentProject.techStack.includes(skill)) {
            currentProject.techStack.push(skill);
          }
        }
      }
    }
    if (currentProject && currentProject.title && projects.length < 3) {
      projects.push(currentProject);
    }
  }

  // Note: If no projects are found in the uploaded document, do NOT invent fake projects.
  // Return projects as empty array so the user knows projects weren't detected.

  return { extracted, projects };
};

/**
 * Calculate ATS Match %, Missing Placement Keywords, and Detailed Verdict
 */
const calculateATSMetrics = (extracted, targetRole, rawText = '', structure = {}) => {
  const allFoundSkills = [
    ...(extracted.languages || []),
    ...(extracted.frameworks || []),
    ...(extracted.databases || []),
    ...(extracted.tools || []),
    ...(extracted.concepts || []),
  ];

  const totalSkillsCount = allFoundSkills.length;
  const benchmark = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Full Stack Software Engineer'];
  const requiredList = benchmark.required || [];
  const recommendedList = benchmark.recommended || [];

  // If 0 skills or nearly 0 resume structure found:
  if (totalSkillsCount === 0 || (totalSkillsCount < 2 && structure.matchedSectionCount < 2)) {
    return {
      isValidResume: false,
      atsScore: 0,
      missingKeywords: requiredList.slice(0, 6),
      matchVerdict: `Unrecognized / Non-Resume Document: 0 recognized technical skills or project competencies found for "${targetRole}". Please verify and upload your actual engineering resume/CV.`,
      warning: 'The uploaded PDF does not appear to be a technical software engineering resume. No relevant programming languages, tools, or resume sections were detected.',
    };
  }

  const allFoundSkillsLower = allFoundSkills.map((s) => s.toLowerCase());

  let matchedRequired = 0;
  const missingKeywords = [];

  requiredList.forEach((skill) => {
    const isMatched = allFoundSkillsLower.some(
      (found) => found === skill.toLowerCase() || found.includes(skill.toLowerCase()) || skill.toLowerCase().includes(found)
    );
    if (isMatched) {
      matchedRequired++;
    } else {
      missingKeywords.push(skill);
    }
  });

  let matchedRecommended = 0;
  recommendedList.forEach((skill) => {
    const isMatched = allFoundSkillsLower.some(
      (found) => found === skill.toLowerCase() || found.includes(skill.toLowerCase()) || skill.toLowerCase().includes(found)
    );
    if (isMatched) {
      matchedRecommended++;
    } else if (missingKeywords.length < 6 && !missingKeywords.includes(skill)) {
      missingKeywords.push(skill);
    }
  });

  // Calculate ATS Component Scoring
  // 1. Required Competencies (55%)
  const requiredScore = (matchedRequired / Math.max(requiredList.length, 1)) * 55;

  // 2. Recommended / Extra Skills (25%)
  const recommendedScore = (matchedRecommended / Math.max(recommendedList.length, 1)) * 25;

  // 3. Structural Quality (20%)
  let structuralScore = 0;
  if (structure.hasContactInfo) structuralScore += 5;
  if (structure.hasEducation) structuralScore += 5;
  if (structure.hasProjects) structuralScore += 5;
  if (structure.hasSkillsSection) structuralScore += 5;

  const totalRawATS = Math.round(requiredScore + recommendedScore + structuralScore);
  const atsScore = Math.min(96, Math.max(10, totalRawATS));

  let matchVerdict = '';
  if (atsScore >= 85) {
    matchVerdict = `Tier-1 ATS Match (${atsScore}%): Outstanding keyword alignment for ${targetRole}. Resume effectively passes automated applicant screening.`;
  } else if (atsScore >= 70) {
    matchVerdict = `Competitive ATS Match (${atsScore}%): Good baseline qualifications for ${targetRole}. Incorporating the suggested missing keywords will boost recruiter ranking.`;
  } else if (atsScore >= 45) {
    matchVerdict = `Moderate ATS Match (${atsScore}%): Contains some technical foundation, but key core competencies for ${targetRole} are missing.`;
  } else {
    matchVerdict = `Low ATS Match (${atsScore}%): Very few benchmark skills for ${targetRole} were found in this document. Add missing technical skills and project details.`;
  }

  return {
    isValidResume: true,
    atsScore,
    missingKeywords: missingKeywords.slice(0, 6),
    matchVerdict,
    warning: null,
  };
};

/**
 * End-to-end resume analysis
 */
const analyzeResume = async (pdfBuffer, targetRole = 'Full Stack Software Engineer') => {
  const rawText = await extractTextFromPDF(pdfBuffer);

  if (!rawText || rawText.length < 30) {
    return {
      isValidResume: false,
      rawTextLength: 0,
      atsScore: 0,
      missingKeywords: (ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Full Stack Software Engineer']).required.slice(0, 6),
      matchVerdict: 'Uploaded PDF has no readable text. If this is a scanned document or image PDF, please upload a text-based PDF resume.',
      warning: 'No readable text could be extracted from this PDF file.',
      extractedSkills: { languages: [], frameworks: [], databases: [], tools: [], concepts: [] },
      projects: [],
      suggestedQuestions: [],
    };
  }

  const structure = detectResumeStructure(rawText);
  const { extracted, projects } = extractSkillsTaxonomy(rawText);
  const atsMetrics = calculateATSMetrics(extracted, targetRole, rawText, structure);

  // Generate personalized interview questions strictly based on extracted skills
  let suggestedQuestions = [];
  const totalSkills = Object.values(extracted).reduce((acc, curr) => acc + curr.length, 0);

  if (atsMetrics.isValidResume && totalSkills > 0) {
    suggestedQuestions = await generateResumeQuestions(extracted, projects, targetRole);
  }

  return {
    isValidResume: atsMetrics.isValidResume,
    rawTextLength: rawText.length,
    atsScore: atsMetrics.atsScore,
    missingKeywords: atsMetrics.missingKeywords,
    matchVerdict: atsMetrics.matchVerdict,
    warning: atsMetrics.warning,
    extractedSkills: extracted,
    projects,
    suggestedQuestions,
  };
};

module.exports = {
  extractTextFromPDF,
  extractSkillsTaxonomy,
  detectResumeStructure,
  calculateATSMetrics,
  analyzeResume,
};
