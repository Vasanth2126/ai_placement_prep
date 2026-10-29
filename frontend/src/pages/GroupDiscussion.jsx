import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  BookOpen,
  Calendar,
  Play,
  RotateCcw,
  Send,
  UserCheck,
  Shield,
  Flame,
  PhoneOff,
  Lock,
  BarChart3,
  Bot,
  User,
  Radio,
  FileCheck,
  Check,
  X,
  RefreshCw,
  PenTool,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Lightbulb,
  Target
} from 'lucide-react';
import api from '../api/axios';
import AudioVisualizer from '../components/AudioVisualizer';

const GD_SESSIONS_DATA = [
  {
    id: 'gd-session-1',
    topic: 'Should AI Coding Agents Replace Junior Developers in Production CI/CD?',
    category: 'AI & Engineering',
    context: 'With LLM code agents generating pull requests and deployments autonomously, top tech firms debate architectural risk, hallucination security, and junior mentorship pipelines.',
    rules: [
      '1. Listen attentively to Dr. Alisha’s verbal instruction.',
      '2. Utilize the full 2-minute timer window to prepare your PREP points.',
      '3. Meeting starts automatically: speak turn-by-turn with panel members.',
      '4. At the last 2 minutes, AI Mentor will deliver the verbal conclusion alert.',
      '5. Meeting automatically concludes and official GD marks are allocated.',
    ],
    date: 'Today',
    time: 'Live Now',
    durationMinutes: 25,
    maxParticipants: 6,
    currentParticipants: 4,
    isBookedByMe: true,
    status: 'live',
  },
  {
    id: 'gd-session-2',
    topic: 'Monolithic Architecture vs Microservices for Fast-Scaling Startups',
    category: 'System Architecture',
    context: 'Startups often face premature optimization when adopting distributed microservices too early vs maintainable modular monoliths.',
    rules: [
      'Focus on engineering overhead, network latency, and cloud infrastructure costs.',
      'Maintain conversational entry discipline without dominating speaking time.',
    ],
    date: 'Today',
    time: '06:00 PM IST',
    durationMinutes: 30,
    maxParticipants: 6,
    currentParticipants: 3,
    isBookedByMe: false,
    status: 'upcoming',
  },
  {
    id: 'gd-session-3',
    topic: 'Data Privacy & Ethics in Healthcare AI Diagnostic Models',
    category: 'Ethics & Regulation',
    context: 'Balancing model training data accessibility with patient HIPAA/GDPR anonymization mandates.',
    rules: [
      'Discuss legal frameworks, federated learning, and bias mitigation.',
      'Summarize key consensus takeaways during final turns.',
    ],
    date: 'Tomorrow',
    time: '11:00 AM IST',
    durationMinutes: 25,
    maxParticipants: 8,
    currentParticipants: 5,
    isBookedByMe: false,
    status: 'upcoming',
  },
  {
    id: 'gd-session-4',
    topic: 'Serverless Functions vs Kubernetes Orchestration for Cloud Native Apps',
    category: 'Cloud & Infrastructure',
    context: 'Evaluating cold starts, cost predictability, and vendor lock-in between AWS Lambda and EKS clusters.',
    rules: [
      'Present quantifiable metrics on cold-start latencies and maintenance overhead.',
      'Counter peer assumptions on multi-region failovers.',
    ],
    date: 'Tomorrow',
    time: '03:30 PM IST',
    durationMinutes: 25,
    maxParticipants: 6,
    currentParticipants: 2,
    isBookedByMe: false,
    status: 'upcoming',
  },
  {
    id: 'gd-session-5',
    topic: 'Open Source LLMs vs Proprietary Frontier APIs for Enterprise Security',
    category: 'AI & Engineering',
    context: 'Enterprises weigh self-hosted fine-tuned models vs OpenAI/Anthropic APIs for data sovereignty.',
    rules: [
      'Address GPU cluster maintenance costs vs data leakage vulnerabilities.',
      'Structure counter-arguments using PREP.',
    ],
    date: 'Friday',
    time: '05:00 PM IST',
    durationMinutes: 30,
    maxParticipants: 8,
    currentParticipants: 6,
    isBookedByMe: false,
    status: 'upcoming',
  },
];

const BOT_PARTICIPANTS = [
  {
    id: 'bot-moderator',
    name: 'Dr. Alisha',
    role: 'Chief AI Mentor',
    avatar: '👩‍🏫',
    status: 'Speaking',
    voicePitch: 1.12,
    voiceRate: 0.95,
    isFemale: true,
    instructionSpeech: 'Welcome candidates to the Placement 360 Group Discussion. I am Dr. Alisha, your AI Mentor. Today’s topic is: Should AI Coding Agents Replace Junior Developers in Production CI/CD? Ground rules: Maintain professional decorum, respect turn order, and structure your arguments using Point, Reason, Example, and Point. Following this instruction, your two minute preparation timer will automatically begin. Please prepare your thoughts.',
    prepEndSpeech: 'The two minute preparation window is now complete. The group discussion meeting starts now. Rohan, please open the floor with your initial stance.',
    last2MinAlertSpeech: 'Attention candidates. We have reached the final two minutes of the group discussion. Please present your concluding arguments and final consensus takeaways now.',
    meetingEndSpeech: 'The group discussion meeting is now officially over. The room is closed. Allocating your performance marks based on your GD contributions.',
  },
  {
    id: 'bot-1',
    name: 'Rohan (Tech Lead AI)',
    role: 'Pro-Autonomous Agents',
    avatar: '👨‍💻',
    status: 'Listening',
    voicePitch: 0.92,
    voiceRate: 1.0,
    isFemale: false,
    turnSpeech: 'My Point is that autonomous AI agents dramatically reduce manual boilerplate and accelerate time to market. The Reason is that sixty percent of junior developer time is spent on repetitive tasks like test generation and syntax fixes. For Example, GitHub reported fifty-five percent faster task completion with Copilot. Therefore, companies should embrace agents while transitioning juniors into code reviewers.',
  },
  {
    id: 'bot-2',
    name: 'Ananya (Product AI)',
    role: 'Pragmatic & Quality First',
    avatar: '👩‍💼',
    status: 'Listening',
    voicePitch: 1.2,
    voiceRate: 0.98,
    isFemale: true,
    turnSpeech: 'I understand Rohan’s efficiency point, but I have a counter perspective. The Point is that code generation without fundamental architectural intuition introduces critical security vulnerabilities. For Example, a Stanford study found developers with AI assistance wrote more insecure code while believing it was safer. Therefore, junior developers must first build core fundamentals.',
  },
  {
    id: 'bot-3',
    name: 'Karthik (Security SRE AI)',
    role: 'Resilience & Compliance',
    avatar: '👨‍🔬',
    status: 'Listening',
    voicePitch: 0.82,
    voiceRate: 0.95,
    isFemale: false,
    turnSpeech: 'Building upon Ananya’s point, in high compliance sectors like FinTech, every production release requires strict accountability. An AI cannot be held legally liable for data breaches or outage downtime in an audit.',
  },
];

const STAGES = [
  { id: 'mentor-instruction', label: '1. Mentor Voice Briefing', icon: Volume2 },
  { id: 'prep-timer', label: '2. Preparation (2 Min)', icon: Clock },
  { id: 'meet-start', label: '3. Active GD Meeting', icon: Users },
  { id: 'last-2min-alert', label: '4. Conclusion Alert (2 Min)', icon: AlertTriangle },
  { id: 'mark', label: '5. GD Mark Allocation', icon: Award },
];

const PREP_CASE_STUDIES = [
  {
    company: 'Netflix',
    tag: 'CI/CD & Canary Rollouts',
    scenario: 'Automated 2% traffic canary deployments with Spinnaker to catch regressions before 100% rollout.',
    application: 'Used in discussions on CI/CD automation, fault tolerance, and deployment safety.',
  },
  {
    company: 'Uber',
    tag: 'Microservices to Monolith',
    scenario: 'Consolidated 4,000+ unmanageable microservices into structured domain-oriented modular microservices ("DOMA").',
    application: 'Used in System Design debates on premature microservices optimization.',
  },
  {
    company: 'Stanford AI Security Study',
    tag: 'LLM Code Vulnerabilities',
    scenario: 'Found that engineers using LLMs produced code with 40% more SQLi and buffer overflows while rating it as safer.',
    application: 'Used as an empirical counter-argument against unsupervised autonomous AI code agents.',
  },
  {
    company: 'CrowdStrike',
    tag: 'Kernel Pipeline Governance',
    scenario: 'Faulty driver channel file update crashed 8.5M Windows systems globally due to missing staging rings.',
    application: 'Used to emphasize human sign-off gates and gradual progressive deployment rings.',
  },
];

const GroupDiscussion = () => {
  const [sessions, setSessions] = useState(GD_SESSIONS_DATA);
  const [activeSession, setActiveSession] = useState(GD_SESSIONS_DATA[0]);
  const [activeTab, setActiveTab] = useState('live-room'); // 'live-room' | 'booking' | 'prep-guide'
  
  // Category filter for booking
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Interactive PREP Studio State
  const [prepDraft, setPrepDraft] = useState({
    point: '',
    reason: '',
    example: '',
    conclusion: '',
  });
  const [testedPrepScore, setTestedPrepScore] = useState(null);

  // Stages: 'lobby' | 'mentor-instruction' | 'prep-timer' | 'meet-start' | 'last-2min-alert' | 'mark'
  const [flowStage, setFlowStage] = useState('lobby'); 
  
  // Natural Timers (Without any skip buttons)
  const [prepTimer, setPrepTimer] = useState(120);        // 2 min (120s) exact prep timer
  const [meetTimer, setMeetTimer] = useState(1080);       // 18 min (1080s) main debate
  const [last2MinTimer, setLast2MinTimer] = useState(120); // 2 min (120s) final conclusion round
  
  const [activeSpeakerId, setActiveSpeakerId] = useState('bot-moderator');
  const [prepNotes, setPrepNotes] = useState('');

  // Media Controls
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [videoStream, setVideoStream] = useState(null);

  // Evaluation Marks State
  const [evaluating, setEvaluating] = useState(false);
  const [finalScorecard, setFinalScorecard] = useState(null);
  const [liveDialogue, setLiveDialogue] = useState([]);

  // Refs
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const speakingTimerRef = useRef(null);
  const mainIntervalRef = useRef(null);
  const botTurnTimerRef = useRef(null);
  const speechVoicesRef = useRef([]);
  const activeUtteranceRef = useRef(null);
  const speechKeepAliveRef = useRef(null);

  // Preload & keep speech synthesis active
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          speechVoicesRef.current = availableVoices;
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Chromium keepalive interval to prevent speech engine garbage collection pauses
    speechKeepAliveRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 4000);

    return () => {
      if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Audio Tone Cue (ensures sound feedback always plays reliably)
  const playAudioCue = (frequency = 600, durationMs = 250) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
      }
    } catch (e) {}
  };

  // High Reliability Text-To-Speech (TTS) Engine
  const speakVoice = (text, persona, onEndCallback) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEndCallback) setTimeout(onEndCallback, 2500);
      return;
    }

    try {
      // Cancel previous utterance and resume synthesis state
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      // Delay invocation by 70ms to allow browser cancel pipeline to clear
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.pitch = persona?.voicePitch || 1.0;
          utterance.rate = persona?.voiceRate || 0.95;
          utterance.volume = 1.0;

          // Select matching voice
          const voices = speechVoicesRef.current.length > 0 
            ? speechVoicesRef.current 
            : window.speechSynthesis.getVoices();

          if (voices && voices.length > 0) {
            const enVoices = voices.filter((v) => v.lang && v.lang.startsWith('en'));
            const pool = enVoices.length > 0 ? enVoices : voices;
            if (persona?.isFemale) {
              const female = pool.find((v) => /female|zira|samantha|victoria|karen|susan|natural|google/i.test(v.name)) || pool[0];
              if (female) utterance.voice = female;
            } else {
              const male = pool.find((v) => /male|david|george|alex|daniel|natural|google/i.test(v.name)) || pool[1] || pool[0];
              if (male) utterance.voice = male;
            }
          }

          let called = false;
          const finish = () => {
            if (!called) {
              called = true;
              activeUtteranceRef.current = null;
              if (onEndCallback) onEndCallback();
            }
          };

          utterance.onend = finish;
          utterance.onerror = (e) => {
            console.warn('SpeechSynthesis error event:', e);
            finish();
          };

          // Store reference on component ref to prevent garbage collection mid-speech
          activeUtteranceRef.current = utterance;

          // Safe fallback timer based on word count
          const wordCount = text.split(/\s+/).filter(Boolean).length;
          const approxDurationMs = Math.max(4000, (wordCount / 2.2) * 1000);
          setTimeout(() => {
            if (!called) finish();
          }, approxDurationMs + 4000);

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('Speech synthesis speak execution notice:', err);
          if (onEndCallback) onEndCallback();
        }
      }, 70);
    } catch (err) {
      console.warn('Speech synthesis general notice:', err);
      if (onEndCallback) onEndCallback();
    }
  };

  // Setup Webcam / Mic based on stage
  useEffect(() => {
    if (activeTab === 'live-room' && flowStage !== 'mark') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [flowStage, activeTab]);

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
      if (botTurnTimerRef.current) clearTimeout(botTurnTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Dedicated Timer for Stage 2: 2-Minute Preparation Countdown
  useEffect(() => {
    if (flowStage !== 'prep-timer') return;

    playAudioCue(880, 300); // chime for prep start

    const timer = setInterval(() => {
      setPrepTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleStartMeeting();
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flowStage]);

  // Dedicated Timer for Stage 3: Active GD Meeting Countdown (18 min)
  useEffect(() => {
    if (flowStage !== 'meet-start') return;

    const timer = setInterval(() => {
      setMeetTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTriggerLast2MinAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flowStage]);

  // Dedicated Timer for Stage 4: Conclusion Alert Countdown (2 min)
  useEffect(() => {
    if (flowStage !== 'last-2min-alert') return;

    const timer = setInterval(() => {
      setLast2MinTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndMeetingAndShowMark();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flowStage]);

  // Speech Recognition (STT) setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setUserSpeech(currentText);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition notice:', e.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Webcam notice:', err.message);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
  };

  const toggleCamera = () => {
    if (videoStream) {
      videoStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCameraEnabled((prev) => !prev);
    } else {
      setCameraEnabled((prev) => !prev);
    }
  };

  const toggleMic = () => {
    if (videoStream) {
      videoStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMicEnabled((prev) => !prev);
    } else {
      setMicEnabled((prev) => !prev);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setActiveSpeakerId('user-candidate');
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
      speakingTimerRef.current = setInterval(() => {
        setSpeakingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    }
  };

  // Toggle Time Booking
  const handleToggleBooking = async (sessionId) => {
    try {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            const nextBooked = !s.isBookedByMe;
            return {
              ...s,
              isBookedByMe: nextBooked,
              currentParticipants: nextBooked
                ? s.currentParticipants + 1
                : Math.max(1, s.currentParticipants - 1),
            };
          }
          return s;
        })
      );
      await api.post('/gd/book', { sessionId });
    } catch (e) {
      console.warn('Booking sync notice:', e.message);
    }
  };

  // =========================================================================
  // STEP 1: START -> INSTRUCTION BY MENTOR IN VOICE (Starts immediately on button click)
  // =========================================================================
  const handleStartFlow = () => {
    playAudioCue(587.33, 200);

    setFlowStage('mentor-instruction');
    setActiveSpeakerId('bot-moderator');
    setFinalScorecard(null);
    setUserSpeech('');
    setSpeakingSeconds(0);

    const introItem = {
      speaker: 'Dr. Alisha (Chief AI Mentor)',
      role: 'Chief AI Mentor',
      avatar: '👩‍🏫',
      text: BOT_PARTICIPANTS[0].instructionSpeech,
      time: '00:00',
    };
    setLiveDialogue([introItem]);

    // Speak instruction out loud immediately, then automatically advance to Step 2
    speakVoice(BOT_PARTICIPANTS[0].instructionSpeech, BOT_PARTICIPANTS[0], () => {
      handleStart2MinTimer();
    });
  };

  // =========================================================================
  // STEP 2: 2 MIN TIMER (Displayed to user, counts down from 120s to 0s)
  // =========================================================================
  const handleStart2MinTimer = () => {
    setPrepTimer(120); // Exactly 2 minutes (120s)
    setFlowStage('prep-timer');
  };

  // =========================================================================
  // STEP 3: MEET START -> GD STARTS, USERS SPEAK ONE BY ONE
  // =========================================================================
  const handleStartMeeting = () => {
    playAudioCue(523.25, 400); // chime for meeting start
    setMeetTimer(1080); // 18 minutes main discussion
    setFlowStage('meet-start');
    setActiveSpeakerId('bot-moderator');

    const startMsg = BOT_PARTICIPANTS[0].prepEndSpeech;
    setLiveDialogue((prev) => [
      ...prev,
      {
        speaker: 'Dr. Alisha (Chief AI Mentor)',
        role: 'Chief AI Mentor',
        avatar: '👩‍🏫',
        text: startMsg,
        time: '02:00',
      },
    ]);

    // Dr. Alisha announces start in voice
    speakVoice(startMsg, BOT_PARTICIPANTS[0], () => {
      // Bot 1 (Rohan) speaks after mentor finishes
      botTurnTimerRef.current = setTimeout(() => {
        setActiveSpeakerId('bot-1');
        setLiveDialogue((prev) => [
          ...prev,
          {
            speaker: BOT_PARTICIPANTS[1].name,
            role: BOT_PARTICIPANTS[1].role,
            avatar: BOT_PARTICIPANTS[1].avatar,
            text: BOT_PARTICIPANTS[1].turnSpeech,
            time: '02:30',
          },
        ]);
        speakVoice(BOT_PARTICIPANTS[1].turnSpeech, BOT_PARTICIPANTS[1], () => {
          // Bot 2 (Ananya) speaks
          setTimeout(() => {
            setActiveSpeakerId('bot-2');
            setLiveDialogue((prev) => [
              ...prev,
              {
                speaker: BOT_PARTICIPANTS[2].name,
                role: BOT_PARTICIPANTS[2].role,
                avatar: BOT_PARTICIPANTS[2].avatar,
                text: BOT_PARTICIPANTS[2].turnSpeech,
                time: '03:15',
              },
            ]);
            speakVoice(BOT_PARTICIPANTS[2].turnSpeech, BOT_PARTICIPANTS[2], () => {
              // Mentor prompts candidate to speak
              setTimeout(() => {
                setActiveSpeakerId('bot-moderator');
                const promptUser = 'Thank you Ananya and Rohan. Candidate, the floor is now yours. Turn on your mic and present your argument.';
                setLiveDialogue((prev) => [
                  ...prev,
                  {
                    speaker: 'Dr. Alisha (Chief AI Mentor)',
                    role: 'Chief AI Mentor',
                    avatar: '👩‍🏫',
                    text: promptUser,
                    time: '04:00',
                  },
                ]);
                speakVoice(promptUser, BOT_PARTICIPANTS[0]);
                setActiveSpeakerId('user-candidate');
              }, 1500);
            });
          }, 1500);
        });
      }, 1000);
    });
  };

  // =========================================================================
  // STEP 4: LAST 2 MIN ALERT FROM MENTOR (Conclusion call)
  // =========================================================================
  const handleTriggerLast2MinAlert = () => {
    playAudioCue(659.25, 400); // alert chime
    setLast2MinTimer(120); // 2 minutes for conclusion
    setFlowStage('last-2min-alert');
    setActiveSpeakerId('bot-moderator');

    const alertMsg = BOT_PARTICIPANTS[0].last2MinAlertSpeech;
    setLiveDialogue((prev) => [
      ...prev,
      {
        speaker: 'Dr. Alisha (Chief AI Mentor)',
        role: 'Last 2-Minute Conclusion Alert',
        avatar: '⚡',
        text: alertMsg,
        time: '18:00',
      },
    ]);

    // Mentor delivers spoken alert
    speakVoice(alertMsg, BOT_PARTICIPANTS[0]);
  };

  // =========================================================================
  // STEP 5 & 6: MEET END -> MARK ALLOCATED (Pure GD Performance)
  // =========================================================================
  const handleEndMeetingAndShowMark = async () => {
    if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
    if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    if (botTurnTimerRef.current) clearTimeout(botTurnTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsRecording(false);
    stopCamera();

    playAudioCue(440, 500); // end meeting chime
    setFlowStage('mark');
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, status: 'concluded' } : s))
    );

    speakVoice(BOT_PARTICIPANTS[0].meetingEndSpeech, BOT_PARTICIPANTS[0]);

    // Compute marks 100% based on GD meeting speech
    await calculatePureGDMark(userSpeech);
  };

  // Mark Calculation (100% GD-based, 0% resume/website)
  const calculatePureGDMark = async (speechText) => {
    setEvaluating(true);
    const transcript = (speechText || '').trim();
    const words = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;

    try {
      const res = await api.post('/gd/evaluate', {
        topic: activeSession?.topic,
        speechTranscript: transcript,
        speakingSeconds: Math.max(speakingSeconds, 0),
      });

      if (res.data?.data) {
        setFinalScorecard(res.data.data);
      }
    } catch (err) {
      console.warn('Pure GD mark fallback calculation:', err.message);

      if (words < 5) {
        const minScore = words === 0 ? 0 : Math.min(4, words * 2);
        setFinalScorecard({
          overallScore: minScore,
          scoringSource: 'Pure GD Performance Marks (Speech & Meeting Contribution Only)',
          prepBreakdown: {
            hasPoint: false,
            hasReason: false,
            hasExample: false,
            hasConclusion: false,
            prepScore: 0,
          },
          substanceScore: words > 0 ? 4 : 0,
          fluencyScore: words > 0 ? 10 : 0,
          listeningScore: 0,
          wordCount: words,
          detectedFillers: [],
          strengths: words > 0 ? ['Greeting acknowledged'] : [],
          improvements: [
            'Minimal speech detected (' + words + ' words). In a Group Discussion, you must present arguments using the PREP framework (Point, Reason, Example, Point).',
            'Actively speak on the topic and counter peer arguments to earn technical and participation marks.',
          ],
        });
        return;
      }

      const hasPoint = /i believe|my stance|in my opinion|firstly|fundamentally|my point is|i support|i argue/i.test(transcript);
      const hasReason = /because|due to|the reason|as a result|since|leads to/i.test(transcript);
      const hasExample = /for example|for instance|such as|in case of|take the case|companies like|netflix|uber/i.test(transcript);
      const hasConclusion = /therefore|to summarize|in conclusion|ultimately|in summary|to conclude/i.test(transcript);
      const hasRebuttal = /agree with|disagree with|counter|building on|rohan|ananya|karthik|previous speaker/i.test(transcript);

      let prepScore = 0;
      if (hasPoint) prepScore += 10;
      if (hasReason) prepScore += 10;
      if (hasExample) prepScore += 10;
      if (hasConclusion) prepScore += 10;

      let substanceScore = 0;
      if (words >= 15) substanceScore += 5;
      if (words >= 35) substanceScore += 7;
      if (words >= 60) substanceScore += 7;
      if (words >= 90) substanceScore += 6;

      let fluencyScore = words >= 30 ? 18 : words >= 15 ? 10 : 5;
      let listeningScore = hasRebuttal ? 15 : words >= 30 ? 5 : 0;
      const overallScore = Math.min(100, Math.max(0, prepScore + substanceScore + fluencyScore + listeningScore));

      setFinalScorecard({
        overallScore,
        scoringSource: 'Pure GD Performance Marks (Speech & Meeting Contribution Only)',
        prepBreakdown: {
          hasPoint,
          hasReason,
          hasExample,
          hasConclusion,
          prepScore: Math.round((prepScore / 40) * 100),
        },
        substanceScore: Math.round((substanceScore / 25) * 100),
        fluencyScore: Math.round((fluencyScore / 20) * 100),
        listeningScore: Math.round((listeningScore / 15) * 100),
        wordCount: words,
        detectedFillers: [],
        strengths: [
          hasPoint ? 'Clear stance stated directly in opening' : null,
          hasExample ? 'Solid real-world engineering case study validation' : null,
          hasRebuttal ? 'Active listening: explicitly countered peer arguments' : null,
        ].filter(Boolean),
        improvements: [
          !hasPoint ? 'State your direct stance (Point) at the beginning of your turn.' : null,
          !hasExample ? 'Incorporate specific tech examples (e.g. Netflix canary rollouts, Uber migrations).' : null,
          !hasConclusion ? 'Conclude with a punchy 1-sentence summary takeaway.' : null,
          !hasRebuttal ? 'Reference peer points (e.g., "Building on Rohan’s argument...") to boost collaboration marks.' : null,
        ].filter(Boolean),
      });
    } finally {
      setEvaluating(false);
    }
  };

  const testPrepDraftStructure = () => {
    let score = 0;
    const hasP1 = prepDraft.point.trim().length > 10;
    const hasR = prepDraft.reason.trim().length > 15;
    const hasE = prepDraft.example.trim().length > 15;
    const hasP2 = prepDraft.conclusion.trim().length > 10;

    if (hasP1) score += 25;
    if (hasR) score += 25;
    if (hasE) score += 25;
    if (hasP2) score += 25;

    setTestedPrepScore({
      score,
      hasP1,
      hasR,
      hasE,
      hasP2,
    });
  };

  const transferPrepDraftToLiveRoom = () => {
    const combinedNotes = `• Point (P): ${prepDraft.point}\n• Reason (R): ${prepDraft.reason}\n• Example (E): ${prepDraft.example}\n• Point (P): ${prepDraft.conclusion}`;
    setPrepNotes(combinedNotes);
    setUserSpeech(`${prepDraft.point} ${prepDraft.reason} ${prepDraft.example} ${prepDraft.conclusion}`.trim());
    setActiveTab('live-room');
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.topic.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          s.category.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const bookedCount = sessions.filter(s => s.isBookedByMe).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/90 via-purple-950/70 to-dark-900 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Live Moderated Arena</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Standardized Automated Pipeline</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Group Discussion <span className="text-gradient">Placement Hub</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Book time slots, master the PREP framework, and enter automated AI-moderated GD rooms evaluated strictly on verbal performance.
            </p>
          </div>

          {/* Top Stage Indicators (During Active Live Flow) */}
          {activeTab === 'live-room' && flowStage !== 'lobby' && (
            <div className="p-3 rounded-2xl bg-dark-900/90 border border-white/10 flex flex-wrap items-center gap-2">
              {STAGES.map((s) => {
                const isCurrent = flowStage === s.id;
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400 animate-pulse'
                        : 'text-slate-500 bg-dark-950/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('live-room')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'live-room'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-dark-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>🎯 Live GD Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('booking')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'booking'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-dark-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>📅 Time Booking & Schedule ({bookedCount} Booked)</span>
          </button>

          <button
            onClick={() => setActiveTab('prep-guide')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'prep-guide'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-dark-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>📚 PREP Framework Masterclass & Studio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 2: TIME BOOKING & SCHEDULE DASHBOARD                                  */}
      {/* ========================================================================= */}
      {activeTab === 'booking' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Booking Summary Strip */}
          <div className="p-6 rounded-3xl bg-dark-800/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>GD Schedule & Slot Reservations</span>
              </h2>
              <p className="text-xs text-slate-400">
                Reserve your seat in upcoming AI moderated group discussions to boost your placement readiness.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                <strong className="text-white text-sm">{bookedCount}</strong> Active Bookings
              </div>
              <button
                onClick={() => {
                  const live = sessions.find(s => s.status === 'live') || sessions[0];
                  setActiveSession(live);
                  setActiveTab('live-room');
                  setFlowStage('lobby');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold font-mono shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Join Live Arena Now</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'AI & Engineering', 'System Architecture', 'Ethics & Regulation', 'Cloud & Infrastructure'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search GD topic..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Session Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  s.isBookedByMe
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                    : 'bg-dark-800/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold uppercase">
                      {s.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      s.status === 'live'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-dark-900 text-slate-400 border border-white/5'
                    }`}>
                      {s.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
                      <span>{s.date} • {s.time}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {s.topic}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {s.context}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.currentParticipants}/{s.maxParticipants} Seats</span>
                    </span>
                    <span>⏱ {s.durationMinutes} Mins</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleToggleBooking(s.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        s.isBookedByMe
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                          : 'bg-dark-900 text-slate-300 hover:text-white border border-white/10 hover:border-indigo-500/50'
                      }`}
                    >
                      {s.isBookedByMe ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Booked ✓</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Book Slot</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveSession(s);
                        setActiveTab('live-room');
                        setFlowStage('lobby');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Enter Arena</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PREP FRAMEWORK MASTERCLASS & INTERACTIVE STUDIO                   */}
      {/* ========================================================================= */}
      {activeTab === 'prep-guide' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* PREP 4 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black font-mono text-lg">
                P
              </div>
              <h3 className="text-base font-bold text-white">Point (10 Pts)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                State your clear position within the first 15 seconds. Never sit on the fence in an engineering GD.
              </p>
              <div className="p-2.5 rounded-xl bg-dark-950 border border-indigo-500/20 text-[11px] font-mono text-indigo-300">
                🗣 "My stance is that..." / "I believe fundamentally..."
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black font-mono text-lg">
                R
              </div>
              <h3 className="text-base font-bold text-white">Reason (10 Pts)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Provide technical cause-and-effect reasoning explaining why your stance holds true.
              </p>
              <div className="p-2.5 rounded-xl bg-dark-950 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
                🗣 "The technical reason is because..." / "As a result..."
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-pink-950/40 border border-pink-500/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 font-black font-mono text-lg">
                E
              </div>
              <h3 className="text-base font-bold text-white">Example (10 Pts)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Back your argument with empirical proof: cite Netflix, Uber, AWS, or peer research studies.
              </p>
              <div className="p-2.5 rounded-xl bg-dark-950 border border-pink-500/20 text-[11px] font-mono text-pink-300">
                🗣 "For example, in Netflix canary deployments..."
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black font-mono text-lg">
                P
              </div>
              <h3 className="text-base font-bold text-white">Point (10 Pts)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reiterate your stance in a crisp, 1-sentence summary takeaway to solidify your turn.
              </p>
              <div className="p-2.5 rounded-xl bg-dark-950 border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
                🗣 "Therefore, to conclude..." / "In summary..."
              </div>
            </div>

          </div>

          {/* Interactive PREP Stance Builder Studio */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold uppercase">
                  Interactive Practice Studio
                </span>
                <h3 className="text-xl font-bold text-white">
                  Live PREP Stance Builder
                </h3>
                <p className="text-xs text-slate-400">
                  Topic: <strong>{activeSession.topic}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={testPrepDraftStructure}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dark-900 hover:bg-dark-700 text-slate-200 border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Structure</span>
                </button>
                <button
                  onClick={transferPrepDraftToLiveRoom}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Send to Live Arena Notes</span>
                </button>
              </div>
            </div>

            {/* 4 Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-dark-950 border border-indigo-500/20 space-y-2">
                <label className="text-xs font-mono font-bold text-indigo-400 flex items-center justify-between">
                  <span>1. Point (P) - Clear Stance</span>
                  <span className="text-[10px] text-slate-500">10 Pts</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. My point is that autonomous AI agents dramatically reduce manual boilerplate and accelerate feature delivery..."
                  value={prepDraft.point}
                  onChange={(e) => setPrepDraft({ ...prepDraft, point: e.target.value })}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-dark-950 border border-cyan-500/20 space-y-2">
                <label className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                  <span>2. Reason (R) - Technical Logic</span>
                  <span className="text-[10px] text-slate-500">10 Pts</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. The reason is because developers spend over 60% of their sprints writing repetitive test fixtures and resolving syntax warnings..."
                  value={prepDraft.reason}
                  onChange={(e) => setPrepDraft({ ...prepDraft, reason: e.target.value })}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-dark-950 border border-pink-500/20 space-y-2">
                <label className="text-xs font-mono font-bold text-pink-400 flex items-center justify-between">
                  <span>3. Example (E) - Real-World Case Study</span>
                  <span className="text-[10px] text-slate-500">10 Pts</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. For example, GitHub reported a 55% speed improvement in pull request velocity when engineers utilized Copilot in production..."
                  value={prepDraft.example}
                  onChange={(e) => setPrepDraft({ ...prepDraft, example: e.target.value })}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-dark-950 border border-emerald-500/20 space-y-2">
                <label className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                  <span>4. Point (P) - Summary Takeaway</span>
                  <span className="text-[10px] text-slate-500">10 Pts</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Therefore, companies should adopt code agents while elevating junior engineers into system architects and reviewers..."
                  value={prepDraft.conclusion}
                  onChange={(e) => setPrepDraft({ ...prepDraft, conclusion: e.target.value })}
                  className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>

            {/* Test Results Banner */}
            {testedPrepScore && (
              <div className="p-4 rounded-2xl bg-dark-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {testedPrepScore.score}/100%
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-mono">
                      PREP Structure Completeness
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] font-mono mt-1">
                      <span className={testedPrepScore.hasP1 ? 'text-emerald-400' : 'text-slate-500'}>P: {testedPrepScore.hasP1 ? '✓' : '✗'}</span>
                      <span className={testedPrepScore.hasR ? 'text-emerald-400' : 'text-slate-500'}>R: {testedPrepScore.hasR ? '✓' : '✗'}</span>
                      <span className={testedPrepScore.hasE ? 'text-emerald-400' : 'text-slate-500'}>E: {testedPrepScore.hasE ? '✓' : '✗'}</span>
                      <span className={testedPrepScore.hasP2 ? 'text-emerald-400' : 'text-slate-500'}>P: {testedPrepScore.hasP2 ? '✓' : '✗'}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs text-slate-300 font-mono">
                  {testedPrepScore.score === 100 ? '🔥 Perfect PREP structure ready for live GD!' : '⚠️ Fill in missing components to secure full marks.'}
                </span>
              </div>
            )}

          </div>

          {/* Case Study Vault */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Real-World Engineering Case Study Vault</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREP_CASE_STUDIES.map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-dark-950 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{c.company}</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {c.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {c.scenario}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    💡 <strong>Application:</strong> {c.application}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LIVE GD ARENA (STRICT 5-STAGE UN-SKIPPABLE FLOW)                  */}
      {/* ========================================================================= */}
      {activeTab === 'live-room' && (
        <div className="space-y-6">

          {/* 1. LOBBY STAGE */}
          {flowStage === 'lobby' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/80 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold uppercase">
                      {activeSession.category}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {activeSession.date} • {activeSession.time}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      {activeSession.topic}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeSession.context}
                    </p>
                  </div>

                  {/* Standardized Progression Pipeline */}
                  <div className="p-4 rounded-2xl bg-dark-900/90 border border-indigo-500/20 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Standard GD Evaluation Flow</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-amber-500/30 space-y-1">
                        <span className="text-[10px] text-amber-400 font-mono font-bold block">1. Start</span>
                        <p className="font-bold text-white text-[11px]">Mentor Voice</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-indigo-500/30 space-y-1">
                        <span className="text-[10px] text-indigo-400 font-mono font-bold block">2. Prep</span>
                        <p className="font-bold text-indigo-300 text-[11px]">2 Min Timer</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-cyan-500/30 space-y-1">
                        <span className="text-[10px] text-cyan-400 font-mono font-bold block">3. Meet</span>
                        <p className="font-bold text-white text-[11px]">GD Starts</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-pink-500/30 space-y-1">
                        <span className="text-[10px] text-pink-400 font-mono font-bold block">4. Alert</span>
                        <p className="font-bold text-pink-300 text-[11px]">Last 2 Min</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-emerald-500/30 space-y-1">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold block">5. Mark</span>
                        <p className="font-bold text-emerald-300 text-[11px]">GD Mark</p>
                      </div>
                    </div>
                  </div>

                  {/* Only Start Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={handleStartFlow}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start GD Session</span>
                    </button>
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Mentor voice will speak automatically</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Device Preview */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-dark-800/80 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase font-mono">Camera Preview</h3>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Ready
                    </span>
                  </div>

                  <div className="relative aspect-video rounded-2xl bg-dark-950 overflow-hidden border border-white/10 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraEnabled ? 'block' : 'hidden'}`}
                    />
                    {!cameraEnabled && (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center mx-auto text-slate-500">
                          <User className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">Camera is Turned Off</p>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>You (Candidate)</span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={toggleMic}
                        className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                          micEnabled
                            ? 'bg-dark-900/80 text-white border-white/20'
                            : 'bg-rose-600/90 text-white border-rose-500/50'
                        }`}
                        title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
                      >
                        {micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={toggleCamera}
                        className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                          cameraEnabled
                            ? 'bg-dark-900/80 text-white border-white/20'
                            : 'bg-rose-600/90 text-white border-rose-500/50'
                        }`}
                        title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                      >
                        {cameraEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-dark-800/80 border border-white/10 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase font-mono">AI Panelists</h3>
                  <div className="space-y-2">
                    {BOT_PARTICIPANTS.map((bot) => (
                      <div
                        key={bot.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-dark-900/80 border border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{bot.avatar}</span>
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{bot.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{bot.role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          🔊 Voice Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 1: INSTRUCTION BY MENTOR IN VOICE */}
          {flowStage === 'mentor-instruction' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="p-5 sm:p-6 rounded-3xl bg-indigo-950/80 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    <Bot className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider block">
                      STAGE 1 OF 5 • INSTRUCTION BY MENTOR IN VOICE
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Dr. Alisha is speaking the topic and ground rules
                    </h3>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-dark-950 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>Voice Audio Playing...</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Mentor Speaking Tile */}
                <div className="lg:col-span-5 p-8 rounded-3xl bg-dark-800/90 border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="text-7xl">👩‍🏫</div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping"></span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">Dr. Alisha</h3>
                    <p className="text-xs text-amber-300 font-mono">Chief AI Mentor & Placement Evaluator</p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>Speaking Instructions In Voice</span>
                  </div>
                </div>

                {/* Spoken Text Box */}
                <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">
                      Verbal Instruction Transcript
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed p-4 rounded-2xl bg-dark-950 border border-white/5 border-l-4 border-l-amber-500">
                      "{BOT_PARTICIPANTS[0].instructionSpeech}"
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-dark-900 border border-white/5 text-xs text-slate-300 space-y-1.5">
                    <span className="font-bold text-indigo-300 font-mono block">Automatic Progression:</span>
                    <p className="text-slate-400">
                      When Dr. Alisha finishes speaking, the <strong>2-minute candidate preparation timer</strong> will start automatically.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STEP 2: 2-MINUTE PREPARATION TIMER */}
          {flowStage === 'prep-timer' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-dark-900 border-2 border-indigo-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono uppercase tracking-wider">
                      ⏱ STAGE 2 OF 5 • CANDIDATE PREPARATION TIMER
                    </span>
                    <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>2 Min Time Limit</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    2-Minute Preparation Window
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    This timer is your allotted preparation time. Structure your stance using the PREP framework (Point, Reason, Example, Point). When the timer reaches 00:00, the meeting will begin automatically.
                  </p>
                </div>

                {/* Big 2-Minute Preparation Timer */}
                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <div className="p-4 sm:p-5 rounded-3xl bg-dark-950 border-2 border-indigo-500/50 text-center min-w-[220px] shadow-xl">
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest block">
                      Preparation Time Remaining
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 font-mono mt-1">
                      {formatSeconds(prepTimer)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prep Notes Scratchpad */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-indigo-400" />
                      <span>Draft Your PREP Points</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Topic: {activeSession.topic}
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={prepNotes}
                    onChange={(e) => setPrepNotes(e.target.value)}
                    placeholder="Draft your thoughts before the meeting begins:&#10;• Point (P): State your clear stance...&#10;• Reason (R): Explain the engineering reason...&#10;• Example (E): Real-world case study (Netflix/Uber/CI-CD)...&#10;• Point (P): Final concluding takeaway..."
                    className="w-full p-4 rounded-2xl bg-dark-950 border border-white/10 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                    <span>💡 Notes remain visible when meeting starts</span>
                    <span>{prepNotes.split(/\s+/).filter(Boolean).length} words drafted</span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 font-mono uppercase block">
                      PREP Quick Reference
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-indigo-500/20">
                        <strong className="text-indigo-400 font-mono">P - Point:</strong> Direct opinion stated in 15 seconds.
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-cyan-500/20">
                        <strong className="text-cyan-400 font-mono">R - Reason:</strong> Cause and effect technical logic.
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-pink-500/20">
                        <strong className="text-pink-400 font-mono">E - Example:</strong> Production case studies.
                      </div>
                      <div className="p-2.5 rounded-xl bg-dark-950 border border-emerald-500/20">
                        <strong className="text-emerald-400 font-mono">P - Point:</strong> Crisp 1-sentence closing summary.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300">
                    <span className="font-bold text-indigo-300 font-mono">Pure GD Scoring:</span> Marks are allocated 100% strictly from your spoken words in the meeting.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STEP 3 & 4: MEET START (Active GD) & LAST 2-MIN ALERT */}
          {(flowStage === 'meet-start' || flowStage === 'last-2min-alert') && (
            <div className="space-y-6">
              
              {/* Meeting Status Bar */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                flowStage === 'last-2min-alert'
                  ? 'bg-amber-950/80 border-amber-500/50 shadow-lg shadow-amber-500/20'
                  : 'bg-dark-900/90 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full animate-pulse ${
                    flowStage === 'last-2min-alert' ? 'bg-amber-400' : 'bg-rose-500'
                  }`}></span>
                  <div>
                    <span className={`text-xs font-bold font-mono uppercase tracking-wider block ${
                      flowStage === 'last-2min-alert' ? 'text-amber-300' : 'text-rose-400'
                    }`}>
                      {flowStage === 'last-2min-alert'
                        ? '● STAGE 4 OF 5: LAST 2-MINUTE CONCLUSION ALERT FROM MENTOR'
                        : '● STAGE 3 OF 5: MEET STARTED • USERS SPEAK ONE BY ONE'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      Topic: {activeSession.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-dark-950 border border-white/10 text-xs font-mono font-bold text-indigo-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {flowStage === 'last-2min-alert'
                        ? `Conclusion Time Left: ${formatSeconds(last2MinTimer)}`
                        : `Meeting Time Remaining: ${formatSeconds(meetTimer)}`}
                    </span>
                  </div>

                  {/* The only allowed manual button: End Call */}
                  <button
                    onClick={handleEndMeetingAndShowMark}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Call</span>
                  </button>
                </div>
              </div>

              {/* Last 2 Min Alert Banner from Mentor */}
              {flowStage === 'last-2min-alert' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-4 animate-bounce">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 font-mono uppercase">
                        Mentor Alert: Last 2 Minutes for Final Conclusions
                      </h4>
                      <p className="text-xs text-white">
                        "Attention candidates! We have reached the final 2 minutes. Please present your final conclusions and consensus takeaways now."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Candidate Video Tile */}
                <div className={`relative aspect-video rounded-3xl bg-dark-950 border overflow-hidden transition-all ${
                  activeSpeakerId === 'user-candidate'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20'
                    : 'border-white/10'
                }`}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraEnabled ? 'block' : 'hidden'}`}
                  />
                  {!cameraEnabled && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 text-slate-500">
                      <User className="w-10 h-10" />
                      <span className="text-[10px] font-mono mt-2">Camera Off</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {isRecording && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                        <Mic className="w-3 h-3" /> Speaking
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs font-mono text-white flex items-center gap-2">
                    <span className="font-bold">You (Candidate)</span>
                    <span className="text-[10px] text-emerald-400">• Active</span>
                  </div>
                </div>

                {/* AI Bots */}
                {BOT_PARTICIPANTS.map((bot) => {
                  const isSpeaking = activeSpeakerId === bot.id;
                  return (
                    <div
                      key={bot.id}
                      className={`relative aspect-video rounded-3xl bg-dark-900/90 border p-4 flex flex-col items-center justify-center transition-all ${
                        isSpeaking
                          ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="relative">
                        <div className="text-4xl sm:text-5xl">{bot.avatar}</div>
                        {isSpeaking && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 animate-ping"></span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-white mt-2 leading-none">{bot.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{bot.role}</p>

                      {isSpeaking && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="w-1 h-3 bg-indigo-400 animate-bounce"></span>
                          <span className="w-1 h-4 bg-indigo-400 animate-bounce [animation-delay:0.15s]"></span>
                          <span className="w-1 h-2 bg-indigo-400 animate-bounce [animation-delay:0.3s]"></span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                        <span>{isSpeaking ? 'Speaking 🔊' : 'Listening'}</span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Discussion Dialogue Feed & Turn Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-7 p-6 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Live Discussion Spoken Feed</span>
                    </span>
                    <span className="text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Audio auto-plays on speaker turn
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 divide-y divide-white/5">
                    {liveDialogue.map((item, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-1.5">
                            <span>{item.avatar || '💬'}</span>
                            <span>{item.speaker}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-indigo-500/40">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-3xl bg-dark-800/90 border border-white/10 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 font-mono uppercase">
                        {flowStage === 'last-2min-alert' ? 'Your Final Conclusion Turn' : 'Your Speaking Turn (PREP)'}
                      </span>
                      <button
                        onClick={toggleRecording}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isRecording
                            ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                            : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isRecording ? 'Stop Recording' : 'Dictate with Mic (STT)'}</span>
                      </button>
                    </div>

                    {isRecording && <AudioVisualizer isRecording={isRecording} />}

                    <textarea
                      rows={4}
                      value={userSpeech}
                      onChange={(e) => setUserSpeech(e.target.value)}
                      placeholder={flowStage === 'last-2min-alert'
                        ? "State your final conclusion and summary takeaways..."
                        : "State your argument: Point, Reason, Example (e.g. Netflix, Uber), and Concluding Point to counter previous speakers..."
                      }
                      className="w-full p-3.5 rounded-2xl bg-dark-950 border border-white/10 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-slate-400 font-mono">
                      ⏱ {speakingSeconds}s speaking • {userSpeech.split(/\s+/).filter(Boolean).length} words
                    </span>

                    <button
                      onClick={() => {
                        if (userSpeech.trim()) {
                          const userTurnItem = {
                            speaker: 'You (Candidate)',
                            role: flowStage === 'last-2min-alert' ? 'Final Conclusion' : 'Active Speaker',
                            avatar: '👨‍🎓',
                            text: userSpeech,
                            time: formatSeconds(1080 - meetTimer),
                          };
                          setLiveDialogue((prev) => [...prev, userTurnItem]);
                          setActiveSpeakerId('bot-moderator');

                          setTimeout(() => {
                            setActiveSpeakerId('bot-3');
                            setLiveDialogue((prev) => [
                              ...prev,
                              {
                                speaker: BOT_PARTICIPANTS[3].name,
                                role: BOT_PARTICIPANTS[3].role,
                                avatar: BOT_PARTICIPANTS[3].avatar,
                                text: BOT_PARTICIPANTS[3].turnSpeech,
                                time: formatSeconds(1080 - meetTimer + 15),
                              },
                            ]);
                            speakVoice(BOT_PARTICIPANTS[3].turnSpeech, BOT_PARTICIPANTS[3]);
                          }, 3000);
                        }
                      }}
                      disabled={!userSpeech.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Turn</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STEP 5 & 6: MEET END -> MARK ALLOCATED */}
          {flowStage === 'mark' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Meet End Lockout Banner */}
              <div className="p-6 rounded-3xl bg-dark-900/90 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Meeting Has Ended</h3>
                    <p className="text-xs text-slate-400">
                      The meeting is closed. Below are your official marks allocated strictly based on your GD performance.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFlowStage('lobby');
                    setFinalScorecard(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New GD Round</span>
                </button>
              </div>

              {/* Mark Allocated Card */}
              {evaluating ? (
                <div className="p-12 rounded-3xl bg-dark-800/80 border border-white/10 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-white">Allocating Marks Based on Your GD Performance...</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Evaluating PREP structure, technical substance, speech fluency, and counter-argument rebuttals.
                  </p>
                </div>
              ) : finalScorecard ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Marks & 4 Core GD Criteria (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold uppercase border border-indigo-500/30">
                            Evaluated Based on Meeting Performance Only
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                            GD Performance Mark Allocation
                          </h2>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">
                            {finalScorecard.overallScore}/100
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Your GD Mark
                          </span>
                        </div>
                      </div>

                      {/* 4 Core Pillars */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-300 font-mono uppercase block">
                          Mark Breakdown by Criterion (100 Pts Total)
                        </span>

                        <div className="grid grid-cols-2 gap-3">
                          {/* 1. PREP Score */}
                          <div className="p-3.5 rounded-2xl bg-dark-900 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-300 font-mono">1. PREP Structure</span>
                              <span className="text-xs font-mono font-bold text-white">40 Pts</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-1">
                              <span className={`p-1 rounded ${finalScorecard.prepBreakdown?.hasPoint ? 'bg-emerald-500/20 text-emerald-300' : 'bg-dark-950 text-slate-500'}`}>P {finalScorecard.prepBreakdown?.hasPoint ? '✓' : '✗'}</span>
                              <span className={`p-1 rounded ${finalScorecard.prepBreakdown?.hasReason ? 'bg-emerald-500/20 text-emerald-300' : 'bg-dark-950 text-slate-500'}`}>R {finalScorecard.prepBreakdown?.hasReason ? '✓' : '✗'}</span>
                              <span className={`p-1 rounded ${finalScorecard.prepBreakdown?.hasExample ? 'bg-emerald-500/20 text-emerald-300' : 'bg-dark-950 text-slate-500'}`}>E {finalScorecard.prepBreakdown?.hasExample ? '✓' : '✗'}</span>
                              <span className={`p-1 rounded ${finalScorecard.prepBreakdown?.hasConclusion ? 'bg-emerald-500/20 text-emerald-300' : 'bg-dark-950 text-slate-500'}`}>P {finalScorecard.prepBreakdown?.hasConclusion ? '✓' : '✗'}</span>
                            </div>
                          </div>

                          {/* 2. Technical Substance */}
                          <div className="p-3.5 rounded-2xl bg-dark-900 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-cyan-300 font-mono">2. Tech Substance</span>
                              <span className="text-xs font-mono font-bold text-white">{finalScorecard.substanceScore || 0}%</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block pt-1">
                              Evaluated from spoken depth and {finalScorecard.wordCount || 0} words.
                            </span>
                          </div>

                          {/* 3. Fluency */}
                          <div className="p-3.5 rounded-2xl bg-dark-900 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-pink-300 font-mono">3. Delivery & Fluency</span>
                              <span className="text-xs font-mono font-bold text-white">{finalScorecard.fluencyScore || 0}%</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block pt-1">
                              Penalized filler words (um/uh/like).
                            </span>
                          </div>

                          {/* 4. Listening & Rebuttals */}
                          <div className="p-3.5 rounded-2xl bg-dark-900 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-300 font-mono">4. Listening & Rebuttal</span>
                              <span className="text-xs font-mono font-bold text-white">{finalScorecard.listeningScore || 0}%</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block pt-1">
                              Evaluated turn-taking & countering bots.
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Strengths & Improvements (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 sm:p-8 rounded-3xl bg-dark-800/90 border border-white/10 space-y-5">
                      <h3 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>AI Mentor Performance Feedback</span>
                      </h3>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Strengths Demonstrated
                        </h5>
                        <div className="space-y-1.5">
                          {finalScorecard.strengths?.length > 0 ? (
                            finalScorecard.strengths.map((str, idx) => (
                              <p key={idx} className="text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                • {str}
                              </p>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 italic p-2.5 rounded-xl bg-dark-950">
                              No significant strengths recorded for minimal speech.
                            </p>
                          )}
                        </div>
                      </div>

                      {finalScorecard.improvements?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <h5 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> High-Impact Improvements
                          </h5>
                          <div className="space-y-1.5">
                            {finalScorecard.improvements.map((imp, idx) => (
                              <p key={idx} className="text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                • {imp}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : null}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default GroupDiscussion;
