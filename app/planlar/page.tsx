'use client';

import { useState, useEffect, useRef } from 'react';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TaskComment {
  text: string;
  date: string;
}

interface TaskState {
  done?: boolean;
  assignee?: string;
  comments?: TaskComment[];
  subtasks?: Record<string, { done?: boolean; assignee?: string; comments?: TaskComment[] }>;
}

// --- Parse plan text into structured steps ---
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
      /^(PROJE|HEDEF|AŞAMA|BAŞARI|POTANSİYEL|GÖREV|SÜRE|SORUMLU|MALİYET|RİSK|DETAY|ADIM|FAZ|YAPIL)/.test(t);

    if (isHeader) {
      if (current) steps.push(current);
      current = {
        title: t.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '').replace(/:$/, '').replace(/^\d+\.\s*/, ''),
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

const ASSIGNEES = ['Bartu', 'Kerem', 'Ortak'];
const ASSIGNEE_COLORS: Record<string, string> = {
  Bartu: 'bg-blue-100 text-blue-700',
  Kerem: 'bg-purple-100 text-purple-700',
  Ortak: 'bg-amber-100 text-amber-700',
};

const STEP_ACCENTS = [
  { gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50', ring: 'ring-blue-200' },
  { gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { gradient: 'from-violet-500 to-violet-600', light: 'bg-violet-50', ring: 'ring-violet-200' },
  { gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50', ring: 'ring-amber-200' },
  { gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-50', ring: 'ring-rose-200' },
  { gradient: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', ring: 'ring-cyan-200' },
  { gradient: 'from-pink-500 to-pink-600', light: 'bg-pink-50', ring: 'ring-pink-200' },
];

export default function PlanlarPage() {
  const [planlar, setPlanlar] = useState<Plan[]>([]);
  const [fikirler, setFikirler] = useState<Record<string, Fikir>>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Record<string, Record<string, TaskState>>>({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  async function fetchData() {
    try {
      const [planRes, taskRes] = await Promise.all([
        fetch('/api/planlar'),
        fetch('/api/tasks'),
      ]);
      const planData = await planRes.json();
      const taskData = await taskRes.json();
      setPlanlar(planData.planlar || []);
      setFikirler(planData.fikirler || {});
      setTasks(taskData || {});
      if (planData.planlar?.length > 0 && !selectedPlan) {
        setSelectedPlan(planData.planlar[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
    setTasks({ ...newTasks });

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, taskId, field, value }),
    });
  }

  // Progress calculation
  function getProgress(planId: string, sections: ReturnType<typeof parsePlan>) {
    const t = tasks[planId] || {};
    let total = sections.length;
    let done = 0;
    sections.forEach((_, i) => {
      if (t[`step-${i}`]?.done) done++;
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          plan_context: selectedPlan
            ? `Fikir ID: ${selectedPlan.fikir_id}\nFikir: ${selectedPlan.fikir_metni}\nPlan:\n${selectedPlan.plan_metni}`
            : '',
        }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      if (data.updatedPlan && selectedPlan) {
        await fetch('/api/planlar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fikir_id: selectedPlan.fikir_id, plan_metni: data.updatedPlan }),
        });
        setSelectedPlan({ ...selectedPlan, plan_metni: data.updatedPlan });
        fetchData();
      }
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Hata olustu, tekrar deneyin.' }]);
    } finally { setChatLoading(false); }
  }

  const sections = selectedPlan ? parsePlan(selectedPlan.plan_metni) : [];
  const progress = selectedPlan ? getProgress(selectedPlan.fikir_id, sections) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header - Apple style */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white text-base sm:text-lg font-bold">B</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">Bali Planner</h1>
              <p className="text-[10px] sm:text-xs text-gray-400 tracking-wide">IS AKIS PLANLARI</p>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all ${
              chatOpen
                ? 'bg-gray-100 text-gray-700'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">{chatOpen ? 'Kapat' : 'Asistan'}</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Main */}
        <main className={`flex-1 transition-all duration-500 ease-out ${chatOpen ? 'lg:mr-[420px]' : ''}`}>
          {planlar.length === 0 ? (
            /* Empty state */
            <div className="max-w-md mx-auto mt-20 text-center px-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Henuz Plan Yok</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Telegram grubunda <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">/ai</code> komutuyla fikir konusun,
                &quot;plana ekle&quot; deyin.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
              {/* Plan selector */}
              {planlar.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {planlar.map((p) => (
                    <button
                      key={p.fikir_id}
                      onClick={() => { setSelectedPlan(p); setChatMessages([]); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedPlan?.fikir_id === p.fikir_id
                          ? 'bg-black text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'
                      }`}
                    >
                      {p.fikir_id}
                    </button>
                  ))}
                </div>
              )}

              {selectedPlan && (
                <>
                  {/* Plan card */}
                  <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-200/50 p-5 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div className="flex-1">
                        <span className="inline-block bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 tracking-wider">
                          {selectedPlan.fikir_id}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight leading-tight">
                          {selectedPlan.fikir_metni}
                        </h2>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {selectedPlan.onayland_tarih?.slice(0, 10)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Ilerleme</span>
                        <span className="text-xs font-bold text-gray-900">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex gap-2 flex-wrap">
                      {ASSIGNEES.map((a) => (
                        <span key={a} className={`text-[10px] font-medium px-2 py-1 rounded-full ${ASSIGNEE_COLORS[a]}`}>
                          {a}
                        </span>
                      ))}
                    </div>

                    {/* SWOT toggle */}
                    {fikirler[selectedPlan.fikir_id]?.analiz && (
                      <details className="mt-5">
                        <summary className="cursor-pointer text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">
                          SWOT Analizi
                        </summary>
                        <pre className="mt-3 bg-[#f5f5f7] rounded-2xl p-4 text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                          {fikirler[selectedPlan.fikir_id].analiz}
                        </pre>
                      </details>
                    )}
                  </div>

                  {/* Steps timeline */}
                  <div className="space-y-4">
                    {sections.map((section, i) => {
                      const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];
                      const taskKey = `step-${i}`;
                      const planId = selectedPlan.fikir_id;
                      const task = tasks[planId]?.[taskKey] || {};
                      const isDone = task.done || false;
                      const isExpanded = expandedSteps[i] !== false; // default expanded
                      const commentKey = `${planId}-${taskKey}`;

                      return (
                        <div key={i} className={`bg-white rounded-2xl ring-1 ring-gray-200/50 shadow-sm overflow-hidden transition-all ${isDone ? 'opacity-60' : ''}`}>
                          {/* Step header */}
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3 sm:gap-4">
                              {/* Checkbox */}
                              <button
                                onClick={() => updateTask(planId, taskKey, 'done', !isDone)}
                                className={`mt-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? `bg-gradient-to-br ${accent.gradient} border-transparent`
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {isDone && (
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br ${accent.gradient} text-white text-[10px] font-bold shrink-0`}>
                                    {i + 1}
                                  </span>
                                  <h3 className={`text-sm sm:text-base font-semibold text-gray-900 ${isDone ? 'line-through' : ''}`}>
                                    {section.title || `Adim ${i + 1}`}
                                  </h3>
                                </div>
                                {section.description && (
                                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">{section.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Assignee dropdown */}
                                <select
                                  value={task.assignee || ''}
                                  onChange={(e) => updateTask(planId, taskKey, 'assignee', e.target.value)}
                                  className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer transition-colors ${
                                    task.assignee
                                      ? ASSIGNEE_COLORS[task.assignee]
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  <option value="">Ata</option>
                                  {ASSIGNEES.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                  ))}
                                </select>

                                {/* Expand/collapse */}
                                <button
                                  onClick={() => setExpandedSteps({ ...expandedSteps, [i]: !isExpanded })}
                                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                  <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded content: sub-items + comments */}
                          {isExpanded && (section.items.length > 0 || true) && (
                            <div className={`px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100`}>
                              {/* Sub-items */}
                              {section.items.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {section.items.map((item, j) => {
                                    const subKey = `${taskKey}-sub-${j}`;
                                    const subTask = tasks[planId]?.[subKey] || {};
                                    const subDone = subTask.done || false;

                                    return (
                                      <div key={j} className={`flex items-start gap-3 group rounded-xl px-3 py-2 transition-colors ${subDone ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                                        <button
                                          onClick={() => updateTask(planId, subKey, 'done', !subDone)}
                                          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                            subDone
                                              ? 'bg-gray-400 border-transparent'
                                              : 'border-gray-300 hover:border-gray-400'
                                          }`}
                                        >
                                          {subDone && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                        </button>
                                        <span className={`text-xs sm:text-sm text-gray-700 flex-1 ${subDone ? 'line-through text-gray-400' : ''}`}>
                                          {item}
                                        </span>
                                        <select
                                          value={subTask.assignee || ''}
                                          onChange={(e) => updateTask(planId, subKey, 'assignee', e.target.value)}
                                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${
                                            subTask.assignee
                                              ? ASSIGNEE_COLORS[subTask.assignee]
                                              : 'bg-gray-100 text-gray-400'
                                          }`}
                                        >
                                          <option value="">Ata</option>
                                          {ASSIGNEES.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                          ))}
                                        </select>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Comments */}
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                {(task.comments || []).map((c: TaskComment, ci: number) => (
                                  <div key={ci} className="flex gap-2 mb-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">{c.text}</p>
                                      <span className="text-[10px] text-gray-400">{new Date(c.date).toLocaleString('tr-TR')}</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={commentInputs[commentKey] || ''}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [commentKey]: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && commentInputs[commentKey]?.trim()) {
                                        updateTask(planId, taskKey, 'comment', commentInputs[commentKey].trim());
                                        setCommentInputs({ ...commentInputs, [commentKey]: '' });
                                      }
                                    }}
                                    placeholder="Not ekle..."
                                    className="flex-1 text-xs bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400"
                                  />
                                  <button
                                    onClick={() => {
                                      if (commentInputs[commentKey]?.trim()) {
                                        updateTask(planId, taskKey, 'comment', commentInputs[commentKey].trim());
                                        setCommentInputs({ ...commentInputs, [commentKey]: '' });
                                      }
                                    }}
                                    className="text-xs text-gray-400 hover:text-gray-600 px-2 transition-colors"
                                  >
                                    Ekle
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Raw text */}
                  <details className="mt-8 mb-10">
                    <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      Ham plan metni
                    </summary>
                    <pre className="mt-3 bg-white rounded-2xl ring-1 ring-gray-200/50 p-5 text-xs text-gray-600 whitespace-pre-wrap font-sans">
                      {selectedPlan.plan_metni}
                    </pre>
                  </details>
                </>
              )}
            </div>
          )}
        </main>

        {/* Chatbot sidebar */}
        {chatOpen && (
          <aside className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-white/95 backdrop-blur-xl border-l border-gray-200/50 flex flex-col z-50">
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white text-sm font-bold">B</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Bali Asistan</h3>
                    <p className="text-[10px] text-gray-400">Plan duzenle ve soru sor</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="mt-8 space-y-3">
                  <p className="text-xs text-gray-400 text-center mb-6">Planla ilgili ne yapmak istersin?</p>
                  {['Bu planin maliyetini acikla', 'Sureleri kisalt', 'Yeni adim ekle', 'Risk analizini detaylandir'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setChatInput(s)}
                      className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 text-gray-600 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-br-lg'
                      : 'bg-gray-100 text-gray-800 rounded-bl-lg'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-lg px-4 py-3">
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((d) => (
                        <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex gap-2 items-end">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Mesaj yaz..."
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-10 h-10 bg-black hover:bg-gray-800 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
