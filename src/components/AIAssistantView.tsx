import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  Info,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Student, SettingsConfig, ChatMessage } from '../types';
import { analyzeStudentPerformance } from '../utils/academicCalculations';
import { aiService } from '../services/aiService';
import { speechService } from '../services/speechService';

interface AIAssistantViewProps {
  students: Student[];
  selectedStudentId?: string;
  settings: SettingsConfig;
}

const PRESET_QUESTIONS = [
  'Why is this student at risk?',
  "What are this student's weakest subjects?",
  'Which subjects have declining IA performance?',
  'How can this student improve?',
  "Summarize this student's performance.",
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  students,
  selectedStudentId,
  settings,
}) => {
  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || (students.length > 0 ? students[0].id : '')
  );

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Initialize or reset chat when student changes
  useEffect(() => {
    if (activeStudent) {
      const performance = analyzeStudentPerformance(activeStudent, settings);
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `Hello! I am your AI Academic Assistant. I have loaded the academic profile for **${activeStudent.name}** (${activeStudent.registerNo}) enrolled in ${activeStudent.department}.\n\nCurrent status: **${performance.performanceLevel}** (${performance.overallScore}/100) with **${performance.overallAttendancePct}%** attendance.\n\nYou can type your academic question or tap the microphone to speak.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingMsgId(null);
  }, [activeStudentId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || !activeStudent || isAiResponding) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsAiResponding(true);

    const performance = analyzeStudentPerformance(activeStudent, settings);

    try {
      const result = await aiService.chatWithAssistant(
        message,
        activeStudent,
        performance,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-ai',
        sender: 'ai',
        text: result.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: 'An error occurred while generating the academic response. Please check your network or try asking another question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Toggle Voice Recognition (Speech-to-Text)
  const toggleVoiceInput = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert(
        'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    setIsListening(true);
    speechService.startListening({
      onResult: (transcript, isFinal) => {
        setInputMessage(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendMessage(transcript.trim());
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  // Toggle Text-to-Speech
  const toggleSpeakMessage = (msgId: string, text: string) => {
    if (isSpeaking && activeSpeakingMsgId === msgId) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeakingMsgId(null);
      return;
    }

    speechService.stopSpeaking();
    // Clean text for speaking (remove markdown symbols)
    const cleanText = text.replace(/[*_#`•-]/g, ' ');
    setIsSpeaking(true);
    setActiveSpeakingMsgId(msgId);

    speechService.speak(cleanText, () => {
      setIsSpeaking(false);
      setActiveSpeakingMsgId(null);
    });
  };

  if (!activeStudent) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No students registered.
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Please add a student record before consulting the AI Assistant.
        </p>
      </div>
    );
  }

  const isSpeechRecogSupported = speechService.isSpeechRecognitionSupported();

  return (
    <div className="space-y-4">
      {/* Top Header & Student Context Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>AI Academic Assistant</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Voice &amp; Text
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive pedagogical guidance grounded strictly in individual student metrics.
            </p>
          </div>
        </div>

        {/* Student Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Active Context:
          </label>
          <select
            id="chat-student-selector"
            value={activeStudent.id}
            onChange={(e) => setActiveStudentId(e.target.value)}
            className="py-1.5 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.registerNo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Inquiry Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
          Quick Inquiries:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isAiResponding}
            className="px-3 py-1 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm h-[520px] flex flex-col overflow-hidden">
        {/* Messages Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThisSpeaking = isSpeaking && activeSpeakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>

                  {/* Metadata and Speech controls for Assistant bubbles */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                      isUser
                        ? 'border-indigo-500 text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => toggleSpeakMessage(msg.id, msg.text)}
                        className="inline-flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title={isThisSpeaking ? 'Stop speaking' : 'Read aloud with Text-to-Speech'}
                      >
                        {isThisSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span className="text-rose-500 font-semibold">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking indicator */}
          {isAiResponding && (
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                <span>Analyzing student marks, attendance records, and pedagogical suggestions...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Voice Listening Active Alert Banner */}
        {isListening && (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/70 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="font-semibold">
                Listening to microphone input... Speak your academic question.
              </span>
            </div>
            <button
              onClick={toggleVoiceInput}
              className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input & Voice Controls Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Microphone Button (Speech-to-Text) */}
            <button
              type="button"
              id="voice-input-btn"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={
                isSpeechRecogSupported
                  ? isListening
                    ? 'Stop listening'
                    : 'Ask question via microphone (Speech to Text)'
                  : 'Speech recognition not supported in this browser'
              }
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Text Input */}
            <input
              id="chat-message-input"
              type="text"
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : `Ask about ${activeStudent.name}'s performance, weak subjects, attendance...`
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isAiResponding}
              className="flex-1 px-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            {/* Send Button */}
            <button
              type="submit"
              id="send-message-btn"
              disabled={!inputMessage.trim() || isAiResponding}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Academic Guidance Disclaimer */}
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
            <span>
              *AI suggestions serve as pedagogical indicators based on institutional data, not guaranteed predictions.
            </span>
            <span>
              Speech: {isSpeechRecogSupported ? 'Microphone Available' : 'Not Supported in Browser'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
