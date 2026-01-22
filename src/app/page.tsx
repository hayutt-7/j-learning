'use client';

import { useState } from 'react';
import { AppShell } from '@/components/Layout/AppShell';
import { ViewMode } from '@/components/Layout/Sidebar';
import { InputArea } from '@/components/Translator/InputArea';
import { ResultArea } from '@/components/Translator/ResultArea';
import { AnalysisList } from '@/components/Learning/AnalysisList';
import { VocabStudy } from '@/components/Vocab/VocabStudy';
import { StatsPage } from '@/components/Stats/StatsPage';

import { AnalysisResult } from '@/lib/types';
import { translateAndAnalyze } from './actions';

import { ChatModal } from "@/components/Chat/ChatModal";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('translate');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleTranslate = async (text: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await translateAndAnalyze(text);
      setResult(data);
    } catch (err: any) {
      console.error("Analysis failed", err);
      setError(err.message || "번역 서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'translate' && (
        <div className="space-y-6 lg:space-y-8 relative animate-in fade-in duration-500">
          <div className="space-y-2 text-center mb-6 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              일본어, 자연스럽게 익히세요
            </h2>
            <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400">
              하고 싶은 말을 한국어로 입력하면, AI가 자연스러운 일본어로 바꿔줍니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative px-1">
            {/* Left Column: Input & Translation */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 transition-all duration-300">
              <InputArea onTranslate={handleTranslate} isLoading={isLoading} />

              {isLoading && (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-500"></div>
                  <p className="mt-4 text-sm text-gray-400 animate-pulse">Analyzing grammar & nuance...</p>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {result && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {result.isMock && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-200">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="font-bold text-sm">AI 서비스가 혼잡합니다.</p>
                        <p className="text-xs mt-1 opacity-90">
                          현재 시뮬레이션 데이터로 응답하고 있습니다. 잠시 후 다시 시도하면 실제 AI 분석이 제공됩니다.
                        </p>
                      </div>
                    </div>
                  )}
                  <ResultArea
                    result={result}
                    onChatClick={() => setIsChatOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Analysis List */}
            <div className="lg:col-span-7">
              {result && <AnalysisList items={result.items} />}
              {!result && !isLoading && (
                <div className="hidden lg:flex h-full min-h-[400px] items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <p>Translation analysis will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            contextText={result?.translatedText || ""}
          />
        </div>
      )}

      {currentView === 'vocab' && (
        <VocabStudy />
      )}

      {currentView === 'stats' && (
        <StatsPage />
      )}
    </AppShell>
  );
}
