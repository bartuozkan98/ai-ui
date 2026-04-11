'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// --- Types ---
interface Plan {
  fikir_id: string;
  fikir_metni: string;
  plan_metni: string;
  onayland_tarih: string;
  durum: string;
}

interface Fikir {
  id: string;
  metin: string;
  onerilen_by: string;
  tarih: string;
  durum: string;
  analiz: string;
  plan: string | null;
}

interface TimelineMessage {
  kullanici: string;
  metin: string;
  tarih: string;
  bot?: boolean;
  source: 'telegram' | 'web';
}

interface TaskComment {
  text: string;
  date: string;
}

interface TaskState {
  done?: boolean;
  assignee?: string;
  comments?: TaskComment[];
}

// --- Helpers ---
function parsePlan(text: string) {
  const steps: { title: string; description: string; items: string[] }[] = [];
  const lines = text.split('\n');
  let current: { title: string; description: string; items: string[] } | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    const isHeader =
      /^(\*\*|##|#+)/.test(t) ||
      (/^[A-ZÇĞİÖŞÜ\d].*:$/.test(t) && t.length < 100) ||
      /^\d+\.\s+\*\*/.test(t) ||
      /^\d+\.\s+[A-ZÇĞİÖŞÜ]/.test(t);

    if (isHeader) {
      if (current) steps.push(current);
      current = {
        title: t
          .replace(/^\*\*|\*\*$/g, '')
          .replace(/^#+\s*/, '')
          .replace(/:$/, '')
          .replace(/^\d+\.\s*/, ''),
        description: '',
        items: [],
      };
    } else if (current) {
      if (t.startsWith('-') || t.startsWith('•') || t.startsWith('✓') || /^\d+[\.\)]/.test(t)) {
        current.items.push(t.replace(/^[-•✓]\s*/, '').replace(/^\d+[\.\)]\s*/, ''));
      } else {
        current.description += (current.description ? ' ' : '') + t;
      }
    } else {
      current = { title: '', description: t, items: [] };
    }
  }
  if (current) steps.push(current);
  return steps;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const same =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (same) {
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const ASSIGNEES = ['Bartu', 'Kerem', 'Ortak'];
const ASSIGNEE_COLORS: Record<string, string> = {
  Bartu: 'bg-blue-100 text-blue-700',
  Kerem: 'bg-purple-100 text-purple-700',
  Ortak: 'bg-amber-100 text-amber-700',
};

export default function PlanlarPage() {
  // Data
  const [planlar, setPlanlar] = useState<Plan[]>([]);
  const [fikirler, setFikirler] = useState<Record<string, Fikir>>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Record<string, Record<string, TaskState>>>({});
  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);

  // UI state
  const [view, setView] = useState<'plans' | 'chat'>('chat');
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const [planRes, taskRes, histRes] = await Promise.all([
        fetch('/api/planlar'),
        fetch('/api/tasks'),
        fetch('/api/telegram-history'),
      ]);
      const planData = await planRes.json();
      const taskData = await taskRes.json();
      const histData = await histRes.json();

      setPlanlar(planData.planlar || []);
      setFikirler(planData.fikirler || {});
      setTasks(taskData || {});
      setTimeline(histData.messages || []);

      setSelectedPlan((prev) => {
        if (prev) {
          const updated = (planData.planlar || []).find(
            (p: Plan) => p.fikir_id === prev.fikir_id
          );
          return updated || prev;
        }
        if ((planData.planlar || []).length > 0) return planData.planlar[0];
        return null;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 4000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (timeline.length > prevLen.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLen.current = timeline.length;
  }, [timeline]);

  async function sendChat() {
    if (!chatInput.trim() || chatSending) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatSending(true);

    // Optimistic add
    const optimistic: TimelineMessage = {
      kullanici: 'Web',
      metin: msg,
      tarih: new Date().toISOString(),
      source: 'web',
    };
    setTimeline((t) => [...t, optimistic]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, user: 'Web' }),
      });
      await res.json();
      await fetchData();
    } catch {
      setTimeline((t) => [
        ...t,
        {
          kullanici: 'Sistem',
          metin: 'Hata olustu, tekrar deneyin.',
          tarih: new Date().toISOString(),
          bot: true,
          source: 'web',
        },
      ]);
    } finally {
      setChatSending(false);
    }
  }

  async function updateTask(planId: string, taskId: string, field: string, value: any) {
    const newTasks = { ...tasks };
    if (!newTasks[planId]) newTasks[planId] = {};
    if (!newTasks[planId][taskId]) newTasks[planId][taskId] = {};
    if (field === 'comment') {
      if (!newTasks[planId][taskId].comments) newTasks[planId][taskId].comments = [];
      newTasks[planId][taskId].comments!.push({ text: value, date: new Date().toISOString() });
    } else {
      (newTasks[planId][taskId] as any)[field] = value;
    }
    setTasks(newTasks);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, taskId, field, value }),
    });
  }

  const sections = selectedPlan ? parsePlan(selectedPlan.plan_metni) : [];
  const progress = (() => {
    if (!selectedPlan || sections.length === 0) return 0;
    const t = tasks[selectedPlan.fikir_id] || {};
    let done = 0;
    sections.forEach((_, i) => {
      if (t[`step-${i}`]?.done) done++;
    });
    return Math.round((done / sections.length) * 100);
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  // --- Chat Panel Component ---
  const ChatPanel = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center">
            <span className="text-white text-sm font-semibold">B</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Bali</h3>
            <p className="text-[10px] text-gray-400">Telegram + Web birlikte</p>
          </div>
        </div>
        <button
          onClick={() => setMobileChatOpen(false)}
          className="lg:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          aria-label="Kapat"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-1">
        {timeline.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-14 h-14 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">Henuz konusma yok</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Telegram grubundaki konusmalar ve buradan gonderdigin mesajlar burada gorunecek.
            </p>
          </div>
        )}

        {timeline.map((m, i) => {
          const prev = i > 0 ? timeline[i - 1] : null;
          const showDay = !prev || dayKey(prev.tarih) !== dayKey(m.tarih);
          const isBali = m.bot === true || m.kullanici === 'Bali';
          const isWeb = m.source === 'web' && !isBali;

          return (
            <div key={`${m.tarih}-${i}`}>
              {showDay && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {dayKey(m.tarih)}
                  </span>
                </div>
              )}
              <div className={`flex ${isBali ? 'justify-start' : isWeb ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-[82%] group`}>
                  {!isBali && !isWeb && (
                    <div className="text-[10px] font-medium text-gray-500 ml-3 mb-0.5">
                      {m.kullanici}
                    </div>
                  )}
                  {isBali && (
                    <div className="text-[10px] font-medium text-gray-700 ml-3 mb-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-900"></span>
                      Bali
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isWeb
                        ? 'bg-gray-900 text-white rounded-br-md'
                        : isBali
                        ? 'bg-gray-100 text-gray-900 rounded-bl-md'
                        : 'bg-blue-50 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {m.metin}
                  </div>
                  <div
                    className={`text-[10px] text-gray-400 mt-1 ${
                      isWeb ? 'text-right mr-2' : 'ml-3'
                    }`}
                  >
                    {formatTime(m.tarih)}
                    {m.source === 'telegram' && (
                      <span className="ml-1.5 text-[9px] text-gray-300">• Telegram</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {chatSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
            placeholder="Bali'ye bir sey sor..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-gray-50 focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400"
          />
          <button
            onClick={sendChat}
            disabled={chatSending || !chatInput.trim()}
            className="w-11 h-11 bg-gray-900 active:bg-gray-700 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // --- Plans Panel ---
  const PlansPanel = (
    <div className="px-4 sm:px-6 py-4 sm:py-8 max-w-3xl mx-auto w-full">
      {planlar.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-14 h-14 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">Henuz plan yok</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            Bali ile konus, bir fikri olgunlastir ve &ldquo;plana ekle&rdquo; de.
          </p>
          <button
            onClick={() => {
              setView('chat');
              setMobileChatOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium active:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Bali ile konus
          </button>
        </div>
      ) : (
        <>
          {/* Plan selector */}
          {planlar.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {planlar.map((p) => (
                <button
                  key={p.fikir_id}
                  onClick={() => setSelectedPlan(p)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedPlan?.fikir_id === p.fikir_id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200'
                  }`}
                >
                  {p.fikir_id}
                </button>
              ))}
            </div>
          )}

          {selectedPlan && (
            <>
              {/* Plan header card */}
              <div className="bg-white rounded-3xl ring-1 ring-gray-200/60 p-5 sm:p-7 mb-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <span className="inline-block bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2 tracking-wide">
                      {selectedPlan.fikir_id}
                    </span>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight leading-snug">
                      {selectedPlan.fikir_metni}
                    </h2>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {selectedPlan.onayland_tarih?.slice(0, 10)}
                  </span>
                </div>

                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">Ilerleme</span>
                  <span className="text-[11px] font-semibold text-gray-900">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {fikirler[selectedPlan.fikir_id]?.analiz && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 select-none">
                      SWOT Analizi
                    </summary>
                    <pre className="mt-3 bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                      {fikirler[selectedPlan.fikir_id].analiz}
                    </pre>
                  </details>
                )}
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {sections.map((section, i) => {
                  const taskKey = `step-${i}`;
                  const planId = selectedPlan.fikir_id;
                  const task = tasks[planId]?.[taskKey] || {};
                  const isDone = task.done || false;
                  const expKey = `${planId}-${i}`;
                  const isExpanded = expandedSteps[expKey] !== false;
                  const commentKey = `${planId}-${taskKey}`;

                  return (
                    <div
                      key={i}
                      className={`bg-white rounded-2xl ring-1 ring-gray-200/60 overflow-hidden transition-all ${
                        isDone ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => updateTask(planId, taskKey, 'done', !isDone)}
                            className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                              isDone ? 'bg-gray-900 border-gray-900' : 'border-gray-300 active:border-gray-400'
                            }`}
                          >
                            {isDone && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-semibold text-gray-400 tabular-nums">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <h3
                                className={`text-sm sm:text-base font-semibold text-gray-900 ${
                                  isDone ? 'line-through' : ''
                                }`}
                              >
                                {section.title || `Adim ${i + 1}`}
                              </h3>
                            </div>
                            {section.description && (
                              <p className="text-xs text-gray-500 leading-relaxed">{section.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <select
                              value={task.assignee || ''}
                              onChange={(e) => updateTask(planId, taskKey, 'assignee', e.target.value)}
                              className={`text-[10px] font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                                task.assignee ? ASSIGNEE_COLORS[task.assignee] : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <option value="">Ata</option>
                              {ASSIGNEES.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                setExpandedSteps({ ...expandedSteps, [expKey]: !isExpanded })
                              }
                              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-3">
                          {section.items.length > 0 && (
                            <div className="space-y-1.5">
                              {section.items.map((item, j) => {
                                const subKey = `${taskKey}-sub-${j}`;
                                const subTask = tasks[planId]?.[subKey] || {};
                                const subDone = subTask.done || false;
                                return (
                                  <div
                                    key={j}
                                    className="flex items-start gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors"
                                  >
                                    <button
                                      onClick={() => updateTask(planId, subKey, 'done', !subDone)}
                                      className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                        subDone ? 'bg-gray-600 border-gray-600' : 'border-gray-300'
                                      }`}
                                    >
                                      {subDone && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                    <span
                                      className={`text-xs text-gray-700 flex-1 leading-relaxed ${
                                        subDone ? 'line-through text-gray-400' : ''
                                      }`}
                                    >
                                      {item}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Comments */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {(task.comments || []).map((c: TaskComment, ci: number) => (
                              <div key={ci} className="flex gap-2 mb-2">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">{c.text}</p>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(c.date).toLocaleString('tr-TR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={commentInputs[commentKey] || ''}
                                onChange={(e) =>
                                  setCommentInputs({ ...commentInputs, [commentKey]: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && commentInputs[commentKey]?.trim()) {
                                    updateTask(planId, taskKey, 'comment', commentInputs[commentKey].trim());
                                    setCommentInputs({ ...commentInputs, [commentKey]: '' });
                                  }
                                }}
                                placeholder="Not ekle..."
                                className="flex-1 text-xs bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center">
              <span className="text-white text-sm font-semibold">B</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">Bali</h1>
              <p className="text-[10px] text-gray-400">planlar & konusmalar</p>
            </div>
          </div>

          {/* Desktop view switcher */}
          <div className="hidden lg:flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setView('plans')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                view === 'plans' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Planlar
            </button>
            <button
              onClick={() => setView('chat')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                view === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Sohbet
            </button>
          </div>

          {/* Mobile: chat toggle */}
          <button
            onClick={() => setMobileChatOpen(true)}
            className="lg:hidden w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center active:bg-gray-700"
            aria-label="Sohbeti ac"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Mobile tab switcher */}
        <div className="lg:hidden border-t border-gray-100 flex bg-white">
          <button
            onClick={() => setView('plans')}
            className={`flex-1 py-2.5 text-xs font-medium transition-all ${
              view === 'plans' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'
            }`}
          >
            Planlar {planlar.length > 0 && `(${planlar.length})`}
          </button>
          <button
            onClick={() => setView('chat')}
            className={`flex-1 py-2.5 text-xs font-medium transition-all ${
              view === 'chat' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'
            }`}
          >
            Sohbet {timeline.length > 0 && `(${timeline.length})`}
          </button>
        </div>
      </header>

      {/* Desktop: 2-column layout */}
      <div className="hidden lg:flex max-w-7xl mx-auto">
        <main className="flex-1 min-w-0">
          {view === 'plans' ? PlansPanel : (
            <div className="max-w-2xl mx-auto h-[calc(100vh-70px)]">
              {ChatPanel}
            </div>
          )}
        </main>

        {/* Always-visible chat sidebar when viewing plans */}
        {view === 'plans' && (
          <aside className="w-[400px] shrink-0 border-l border-gray-100 h-[calc(100vh-70px)] sticky top-[70px]">
            {ChatPanel}
          </aside>
        )}
      </div>

      {/* Mobile: single panel */}
      <div className="lg:hidden">
        {view === 'plans' ? (
          PlansPanel
        ) : (
          <div className="h-[calc(100vh-110px)]">{ChatPanel}</div>
        )}
      </div>

      {/* Mobile chat overlay (when triggered from header button) */}
      {mobileChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          {ChatPanel}
        </div>
      )}
    </div>
  );
}
