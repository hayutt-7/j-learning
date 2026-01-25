'use client';

import { useState, useRef, useEffect } from 'react';
import { AppShell } from '@/components/Layout/AppShell';
import { ViewMode } from '@/components/Layout/Sidebar';
import { InputArea } from '@/components/Translator/InputArea';
import { ChatMessage } from '@/components/Translator/ChatMessage';
import { VocabStudy } from '@/components/Vocab/VocabStudy';
import { ContentStudy } from '@/components/Content/ContentStudy';
import { StatsPage } from '@/components/Stats/StatsPage';
import { SpeakingStudy } from '@/components/Speaking/SpeakingStudy';

import { createSession, getMessages, saveMessage } from '@/lib/chat-service';
import { useAuth } from '@/hooks/useAuth';
import { AnalysisResult } from '@/lib/types';
import { translateAndAnalyze } from './actions';
import { ChatModal } from "@/components/Chat/ChatModal";
import { Sparkles } from 'lucide-react';

interface Message {
  id: string;
  userInput: string;
  result: AnalysisResult;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('translate');

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState('');

  // Chat History State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when session creates/changes
  const loadSessionMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const history = await getMessages(sessionId);
      const convertedMessages: Message[] = history.map(msg => ({
        id: msg.id,
        userInput: msg.role === 'user' ? (typeof msg.content === 'string' ? msg.content : '...') : '',  // We need to pair user input with result properly
        // This is tricky. Our DB stores individual messages (user, assistant).
        // But the UI expects combined [User + Result] pairs (Message interface).
        // We need to reconstruct pairs.
        result: msg.role === 'assistant' ? (msg.content as AnalysisResult) : { translatedText: '', items: [] },
      })).filter(msg => {
        // Simple reconstruction: assume strictly alternating User -> Assistant in DB?
        // Actually, let's rethink the Message interface or how we load it.
        // Current UI: Mapped by Message object which contains { userInput, result }.
        // DB: Rows of { role: 'user', content: string } and { role: 'assistant', content: json }.
        // We should group them.
        return true;
      });

      // Grouping logic
      const pairedMessages: Message[] = [];
      let tempUserMsg: { id: string, text: string } | null = null;

      for (const msg of history) {
        if (msg.role === 'user') {
          tempUserMsg = { id: msg.id, text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) };
        } else if (msg.role === 'assistant' && tempUserMsg) {
          pairedMessages.push({
            id: msg.id, // Use assistant msg id as the pair id
            userInput: tempUserMsg.text,
            result: msg.content as AnalysisResult
          });
          tempUserMsg = null;
        }
      }

      setMessages(pairedMessages);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setCurrentContext('');
  };

  const handleSessionSelect = (sessionId: string) => {
    loadSessionMessages(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  const handleTranslate = async (text: string) => {
    setIsLoading(true);
    setError(null);

    // Optimistic UI update
    const tempId = Date.now().toString();
    // We can't show it immediately in the list unless we have the result.
    // So just loading state is fine.

    try {
      // 1. Create session if needed
      let sessionId = currentSessionId;
      if (!sessionId && user) {
        const session = await createSession(user.id, text.slice(0, 30) + (text.length > 30 ? '...' : ''));
        sessionId = session.id;
        setCurrentSessionId(sessionId);
      }

      // 2. Save User Message
      if (sessionId && user) {
        await saveMessage(sessionId, 'user', text);
      }

      // 3. Get AI Response
      const data = await translateAndAnalyze(text);

      const newMessage: Message = {
        id: Date.now().toString(),
        userInput: text,
        result: data,
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentContext(data.translatedText);

      // 4. Save Assistant Message
      if (sessionId && user) {
        await saveMessage(sessionId, 'assistant', data);
      }

      // Record exposures
      if (data.items && data.items.length > 0) {
        import('@/hooks/useLearningHistory').then(({ useLearningHistory }) => {
          useLearningHistory.getState().recordExposures(data.items);
        });
      }
    } catch (err: any) {
      console.error("Analysis failed", err);
      setError(err.message || "번역 서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <AppShell
      currentView={currentView}
      onViewChange={setCurrentView}
      currentSessionId={currentSessionId}
      onSessionSelect={handleSessionSelect}
      onNewChat={handleNewChat}
      onDeleteSession={handleDeleteSession}
    >
      {currentView === 'translate' && (
        <div className="flex flex-col h-full relative">
          {/* Chat Messages Area */}
          <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto px-4 py-6 ${!hasMessages ? 'flex items-center justify-center' : ''}`}
          >
            {/* ... rest of chat messages content ... */}
            {!hasMessages && !isLoading ? (
              /* Welcome Screen - Centered */
              <div className="text-center max-w-2xl mx-auto animate-in fade-in duration-700">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
                  日本語、自然に身につけましょう
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                  하고 싶은 말을 한국어로 입력하면,<br />
                  AI가 자연스러운 일본어로 바꿔드려요.
                </p>
              </div>
            ) : (
              /* Messages List */
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    userInput={message.userInput}
                    result={message.result}
                    onChatClick={() => {
                      setCurrentContext(message.result.translatedText);
                      setIsChatOpen(true);
                    }}
                  />
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Input Area */}
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <InputArea onTranslate={handleTranslate} isLoading={isLoading} />
            </div>
          </div>

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            contextText={currentContext}
          />
        </div>
      )}

      {currentView === 'vocab' && <VocabStudy />}
      {currentView === 'song' && <ContentStudy />}
      {currentView === 'speaking' && <SpeakingStudy />}
      {currentView === 'stats' && <StatsPage />}
    </AppShell>

  );
}
