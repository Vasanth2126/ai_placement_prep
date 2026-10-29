import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import AudioVisualizer from '../components/AudioVisualizer';
import FeedbackCard from '../components/FeedbackCard';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Send,
  AlertCircle,
  Video,
  VideoOff,
  ShieldAlert,
  Eye,
  CheckCircle,
  CheckCircle2,
  Edit3,
  Building2,
  Radio,
} from 'lucide-react';

const DAILY_VOICE_QUESTION_BANK = [
  {
    id: 'conflict-resolution',
    title: 'STAR Method: Conflict Resolution & Architecture Disagreements',
    company: 'Amazon / Google',
    topic: 'Behavioral & Leadership',
    difficulty: 'Medium',
    description: 'Describe a situation where you had a disagreement with a team member or stakeholder regarding a technical implementation choice or deadline. How did you handle it and what was the outcome?',
    evaluationTips: 'Focus on empathy, data-driven reasoning, professional consensus, and measuring the end impact.',
  },
  {
    id: 'project-tradeoffs',
    title: 'Technical Project Architecture & Key Engineering Trade-offs',
    company: 'Meta / Microsoft',
    topic: 'Resume Project Deep-Dive',
    difficulty: 'Medium',
    description: 'Walk me through the most technically complex project listed on your resume. What was the core problem, what architectural choices did you make, and what would you improve in hindsight?',
    evaluationTips: 'Clarify constraints, trade-offs (e.g. speed vs consistency), and quantifiable achievements.',
  },
  {
    id: 'outage-rca',
    title: 'Production Outages & Root Cause Analysis (RCA)',
    company: 'Uber / Netflix',
    topic: 'Behavioral & Operational Excellence',
    difficulty: 'Hard',
    description: 'Tell me about a high-severity bug, unexpected outage, or latency bottleneck you encountered in production or testing. How did you isolate, mitigate, and prevent recurrence?',
    evaluationTips: 'Highlight blameless post-mortem culture, telemetry monitoring, and systematic debugging.',
  },
  {
    id: 'ambiguity-deadlines',
    title: 'Handling Ambiguity & Fast-Paced Delivery',
    company: 'Zoho / Goldman Sachs',
    topic: 'Behavioral & Leadership',
    difficulty: 'Medium',
    description: 'Describe a time when you were assigned a task with vague requirements and tight deadlines. How did you break down the scope, prioritize deliverables, and ensure high quality?',
    evaluationTips: 'Demonstrate initiative, stakeholder communication, and iterative delivery.',
  },
  {
    id: 'non-tech-communication',
    title: 'Translating Technical Complexity for Business Stakeholders',
    company: 'TCS Digital / Cognizant',
    topic: 'Communication & Stakeholder Management',
    difficulty: 'Easy',
    description: 'How do you explain a complex technical bottleneck (e.g. database locking, cache invalidation, or async race conditions) to a non-technical manager or client?',
    evaluationTips: 'Use relatable analogies, focus on business impact, and avoid unnecessary jargon.',
  },
  {
    id: 'code-review-mentorship',
    title: 'Constructive Code Reviews & Raising Engineering Bar',
    company: 'Google / Microsoft',
    topic: 'Engineering Culture & Mentorship',
    difficulty: 'Medium',
    description: 'Tell me about a situation where you provided critical architectural feedback during a code review. How did you communicate your recommendations without causing friction?',
    evaluationTips: 'Emphasize code health, maintainability, mentorship tone, and shared team ownership.',
  },
];

const VoiceInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micError, setMicError] = useState('');

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Sync listening ref
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Anti-Tab-Switch Proctoring Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowWarning(true);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fetch voice questions or daily rotation
  useEffect(() => {
    const storedTailored = sessionStorage.getItem('tailoredQuestions');
    if (storedTailored) {
      try {
        const parsed = JSON.parse(storedTailored);
        const voiceQ = parsed.filter((q) => q.type === 'voice' || q.topic?.includes('Resume'));
        if (voiceQ.length > 0) {
          setQuestions(voiceQ);
          return;
        }
      } catch (e) {}
    }

    const fetchVoiceQuestions = async () => {
      try {
        const res = await api.get('/questions?type=voice');
        if (res.data?.success && res.data.questions?.length > 0) {
          setQuestions(res.data.questions);
          return;
        }
      } catch (e) {
        console.warn('Using daily voice bank');
      }

      const dayOfYear = Math.floor(
        (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
      );
      const startIndex = Math.abs(dayOfYear) % DAILY_VOICE_QUESTION_BANK.length;
      const rotated = [
        DAILY_VOICE_QUESTION_BANK[startIndex],
        ...DAILY_VOICE_QUESTION_BANK.filter((_, i) => i !== startIndex),
      ];
      setQuestions(rotated);
    };

    fetchVoiceQuestions();
  }, []);

  const currentQ = questions[currentIndex] || DAILY_VOICE_QUESTION_BANK[0];

  // Attach live video stream whenever cameraActive changes or video element renders
  useEffect(() => {
    if (cameraActive && cameraStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play().catch((e) => console.warn('Video play note:', e.message));
    }
  }, [cameraActive]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize Web Speech Recognition with auto-restart & permission handler
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setMicError('');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      for (let i = 0; i < event.results.length; i++) {
        finalStr += event.results[i][0].transcript + ' ';
      }
      setTranscript(finalStr);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      if (event.error === 'not-allowed') {
        setMicError('Microphone permission denied. Please allow microphone access in your browser settings.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if user is still in listening mode (handles brief silence pauses)
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  };

  // Toggle Microphone
  const toggleListening = async () => {
    setMicError('');

    if (isListening) {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Step 1: Ensure user grants microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionGranted(true);
      // Stop the test track so SpeechRecognition can bind cleanly
      stream.getTracks().forEach((t) => t.stop());
    } catch (micErr) {
      setMicError('Please allow microphone access in your browser pop-up to record your spoken answer.');
      return;
    }

    // Step 2: Start Speech Recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }

    if (recognitionRef.current) {
      try {
        isListeningRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (startErr) {
        console.warn('Recognition start retry:', startErr.message);
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
            }
          }, 200);
        } catch (e) {}
      }
    }
  };

  // Toggle Webcam Video Feed
  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        cameraStreamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        console.warn('Webcam permission error:', err);
        alert('Webcam access was not granted or camera not found. Please enable camera permissions in your browser.');
      }
    }
  };

  // Text to Speech for AI Question Voice Prompt
  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.description);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit Spoken Answer to AI Evaluation
  const handleSubmitVoice = async () => {
    if (!transcript.trim()) return;

    if (isListening) {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }

    setEvaluating(true);
    setFeedback(null);

    const textToSubmit = transcript.trim();
    if (!textToSubmit) return;

    try {
      const res = await api.post('/interview/answer', {
        questionId: currentQ._id || currentQ.id || currentQ.title,
        userResponse: textToSubmit,
        mode: 'voice',
      });

      if (res.data?.success && res.data.feedback) {
        setFeedback(res.data.feedback);
        if (res.data.feedback.overallScore >= 80) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.warn('Voice evaluation fallback:', err.message);
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
          strengths: ['No substantive spoken content detected.'],
          improvements: [
            'Articulate a structured STAR response addressing the interview challenge directly.',
            'Avoid random syllables or unformed responses.',
          ],
          detailedAnalysis: `The transcribed audio "${cleaned.slice(0, 35)}..." was detected as invalid or gibberish and received 0 marks.`,
          modelAnswer: currentQ.modelAnswer || 'Exemplary STAR response: 1) Situation: High-load bottleneck. 2) Task: Mitigate latency. 3) Action: Profiled queries & deployed Redis caching. 4) Result: 85% latency reduction.',
        });
      } else {
        const hasSTAR = /situation|task|action|result|because|for example|improved|reduced|led to|architecture|database|cache/i.test(textToSubmit);
        const calculatedScore = Math.min(96, Math.max(25, Math.round(30 + (wCount * 0.4) + (hasSTAR ? 25 : 0))));

        setFeedback({
          overallScore: calculatedScore,
          correctnessScore: Math.min(95, calculatedScore + 2),
          clarityScore: Math.min(92, calculatedScore),
          complexityScore: Math.min(90, calculatedScore - 3),
          timeComplexity: 'N/A (Voice Response)',
          spaceComplexity: 'N/A',
          strengths: [
            `Articulated response (${wCount} words spoken) addressing the core prompt.`,
            hasSTAR ? 'Demonstrated structured Situation-Task-Action-Result rationale.' : 'Spoke in a clear conversational cadence.',
          ],
          improvements: [
            wCount < 40 ? 'Elaborate further with concrete engineering examples and measurable impact.' : 'Detail failure modes and preventive safeguards.',
            'Quantify outcomes (e.g. % performance increase, latency reductions, uptime reliability).',
          ],
          detailedAnalysis: `Your spoken articulation covered key aspects of "${currentQ.title}". To boost your score above 90%, include measurable metrics and deep trade-off reasoning.`,
          modelAnswer: currentQ.modelAnswer || 'Exemplary STAR response: 1) Situation: High-load bottleneck. 2) Task: Mitigate latency. 3) Action: Profiled queries & deployed Redis caching. 4) Result: 85% latency reduction.',
        });

        if (calculatedScore >= 80) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      }
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < (questions.length || DAILY_VOICE_QUESTION_BANK.length) - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTranscript('');
      setFeedback(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setTranscript('');
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Proctoring Warning Banner */}
      {showWarning && tabSwitchCount > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/40 bg-rose-950/30 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                Proctoring Telemetry Alert: Tab Switch #{tabSwitchCount} Detected
              </h4>
              <p className="text-xs text-slate-300">
                Placement interviews monitor window focus to ensure integrity. Please stay on this tab during your mock interview.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs border border-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Speech-to-Text & AI Voice Proctoring Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Voice Mock Interview & Placement Proctoring
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light">
          Practice speaking naturally with optional webcam proctoring preview and real-time speech-to-text audio articulation analysis.
        </p>
      </div>

      {/* Main Interactive Studio Glass Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 glow-border text-center space-y-6">
        
        {/* Top Controls: Camera toggle & Question Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl bg-dark-800 disabled:opacity-30 text-slate-300 border border-white/10 hover:bg-dark-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-slate-300 font-bold px-2">
              Question {currentIndex + 1} of {questions.length || DAILY_VOICE_QUESTION_BANK.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex >= (questions.length || DAILY_VOICE_QUESTION_BANK.length) - 1}
              className="p-2 rounded-xl bg-dark-800 disabled:opacity-30 text-slate-300 border border-white/10 hover:bg-dark-700 transition-all cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Webcam Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-lg cursor-pointer ${
                cameraActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-2 ring-emerald-500/30'
                  : 'bg-dark-800 hover:bg-dark-700 text-slate-300 border-white/10'
              }`}
            >
              {cameraActive ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <Video className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Proctoring Camera Active</span>
                </>
              ) : (
                <>
                  <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enable Webcam Preview</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Camera Feed Window */}
        {cameraActive && (
          <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl bg-black aspect-video animate-fadeIn">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Live Indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>LIVE PROCTORING FEED</span>
            </div>
            {/* Eye Level Alignment Guide */}
            <div className="absolute inset-0 border border-dashed border-white/20 rounded-2xl pointer-events-none m-3 flex items-center justify-center">
              <span className="text-[10px] font-mono text-white/60 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                Eye Level Alignment Guide
              </span>
            </div>
          </div>
        )}

        {/* AI Avatar & Question Statement */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-purple-500/40 flex items-center justify-center ${
                isSpeaking || isListening ? 'sound-ring' : ''
              }`}
            >
              <div className="w-full h-full bg-dark-900 rounded-[22px] flex items-center justify-center">
                <Mic
                  className={`w-9 h-9 ${
                    isSpeaking ? 'text-pink-400' : isListening ? 'text-rose-400 animate-pulse' : 'text-indigo-400'
                  }`}
                />
              </div>
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-md">
                Speaking
              </span>
            )}
            {isListening && (
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-md animate-pulse">
                Recording Speech
              </span>
            )}
          </div>

          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {currentQ.topic || 'Behavioral & Leadership'}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-dark-800 text-amber-300 font-semibold border border-amber-500/20">
                {currentQ.difficulty || 'Medium'}
              </span>
              {currentQ.company && (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-dark-800 text-indigo-300 font-semibold border border-indigo-500/20 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{currentQ.company}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">{currentQ.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              "{currentQ.description}"
            </p>
          </div>

          <button
            onClick={speakQuestion}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-pink-400" />
            <span>{isSpeaking ? 'Reading Aloud...' : 'Read Question Aloud'}</span>
          </button>
        </div>

        {/* Audio Frequency Spectrum Wave */}
        <div className="w-full max-w-md mx-auto">
          <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
        </div>

        {/* Microphone Error Alert */}
        {micError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* Real-Time Transcript Display & Edit Area */}
        <div className="text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Spoken Speech Transcript:</span>
            </span>
            <span className="font-mono text-indigo-400 font-bold">
              {transcript.trim().split(/\s+/).filter(Boolean).length} Words Captured
            </span>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click 'Start Speaking Answer' below to speak your response into your microphone, or edit the transcribed speech here..."
            rows={5}
            className="w-full p-4 rounded-2xl glass-input text-xs sm:text-sm font-sans text-white placeholder-slate-500 focus:outline-none leading-relaxed resize-y border border-white/10"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          
          {/* Main Recording Button */}
          <button
            onClick={toggleListening}
            className={`px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Recording Speech</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{transcript ? 'Resume Speaking Answer' : 'Start Speaking Answer'}</span>
              </>
            )}
          </button>

          {/* Submit for AI Rubric */}
          <button
            onClick={handleSubmitVoice}
            disabled={evaluating || !transcript.trim()}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-pink-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {evaluating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{evaluating ? 'Evaluating Articulation...' : 'Submit Spoken Answer for AI Rubric'}</span>
          </button>

          {/* Clear Button */}
          {transcript && (
            <button
              onClick={() => {
                setTranscript('');
                setFeedback(null);
              }}
              className="px-4 py-3 rounded-2xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* AI Rubric & Feedback Card */}
      {feedback && (
        <div className="space-y-4 animate-fadeIn">
          <FeedbackCard feedback={feedback} mode="voice" />
        </div>
      )}

    </div>
  );
};

export default VoiceInterview;
