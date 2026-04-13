'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plan, Fikir, TimelineMessage, TaskState, Section, parsePlan, serializePlan } from './components/types';
import ChatDrawer from './components/ChatDrawer';
import StageCard from './components/StageCard';

export default function PlanlarPage() {
  const [planlar, setPlanlar] = useState<Plan[]>([]);
  const [fikirler, setFikirler] = useState<Record<string, Fikir>>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Record<string, Record<string, TaskState>>>({});
  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [newStage, setNewStage] = useState('');
  const [addingStage, setAddingStage] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pR, tR, hR] = await Promise.all([fetch('/api/planlar'), fetch('/api/tasks'), fetch('/api/telegram-history')]);
      const pD = await pR.json(), tD = await tR.json(), hD = await hR.json();
      setPlanlar(pD.planlar || []);
      setFikirler(pD.fikirler || {});
      setTasks(tD || {});
      setTimeline(hD.messages || []);
      setSelectedPlan(prev => {
        if (prev) { const u = (pD.planlar || []).find((p: Plan) => p.fikir_id === prev.fikir_id); return u || prev; }
        return (pD.planlar || [])[0] || null;
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const id = setInterval(fetchData, 4000); return () => clearInterval(id); }, [fetchData]);

  async function sendChat() {
    if (!chatInput.trim() || chatSending) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatSending(true);
    setTimeline(t => [...t, { kullanici: 'Web', metin: msg, tarih: new Date().toISOString(), source: 'web' }]);
    try { await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, user: 'Web' }) }); await fetchData(); } catch {} finally { setChatSending(false); }
  }

  async function updateTask(planId: string, taskId: string, field: string, value: any) {
    const n = { ...tasks }; if (!n[planId]) n[planId] = {}; if (!n[planId][taskId]) n[planId][taskId] = {};
    if (field === 'comment') { if (!n[planId][taskId].comments) n[planId][taskId].comments = []; n[planId][taskId].comments!.push({ text: value, date: new Date().toISOString() }); }
    else { (n[planId][taskId] as any)[field] = value; }
    setTasks(n);
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, taskId, field, value }) });
  }

  async function savePlan(sections: Section[]) {
    if (!selectedPlan) return;
    const plan_metni = serializePlan(sections);
    await fetch('/api/planlar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fikir_id: selectedPlan.fikir_id, plan_metni }) });
    await fetchData();
  }

  const sections = selectedPlan ? parsePlan(selectedPlan.plan_metni) : [];
  const progress = (() => {
    if (!selectedPlan || sections.length === 0) return 0;
    const t = tasks[selectedPlan.fikir_id] || {};
    let done = 0; sections.forEach((_, i) => { if (t[`step-${i}`]?.done) done++; });
    return Math.round((done / sections.length) * 100);
  })();

  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); }
  function handleDrop(dropIdx: number) {
    if (dragIdx === null || dragIdx === dropIdx) return;
    const s = [...sections]; const [moved] = s.splice(dragIdx, 1); s.splice(dropIdx, 0, moved);
    savePlan(s); setDragIdx(null);
  }
  function deleteStage(i: number) { const s = [...sections]; s.splice(i, 1); savePlan(s); }
  function addStage() {
    if (!newStage.trim()) return;
    const s = [...sections, { title: newStage.trim(), description: '', items: [] }];
    savePlan(s); setNewStage(''); setAddingStage(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bali-gradient rounded-xl flex items-center justify-center"><span className="text-white text-sm font-bold">B</span></div>
            <h1 className="text-lg font-bold text-gray-900">Bali</h1>
          </div>
          {planlar.length > 1 && (
            <select value={selectedPlan?.fikir_id || ''} onChange={e => setSelectedPlan(planlar.find(p => p.fikir_id === e.target.value) || null)}
              className="text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 cursor-pointer focus:ring-2 focus:ring-indigo-200 outline-none">
              {planlar.map(p => <option key={p.fikir_id} value={p.fikir_id}>{p.fikir_id} - {p.fikir_metni.slice(0, 40)}</option>)}
            </select>
          )}
          <button onClick={() => setChatOpen(true)} className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {timeline.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{timeline.length > 99 ? '99+' : timeline.length}</span>}
          </button>
        </div>
      </header>

      {/* Pipeline */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {planlar.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henuz plan yok</h2>
            <p className="text-gray-500 mb-8">Bali ile konus, bir fikri olgunlastir ve &ldquo;plana ekle&rdquo; de.</p>
            <button onClick={() => setChatOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors">
              Bali ile konus
            </button>
          </div>
        ) : selectedPlan && (
          <>
            {/* Plan header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{selectedPlan.fikir_id}</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2 leading-snug">{selectedPlan.fikir_metni}</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg shrink-0">{selectedPlan.onayland_tarih?.slice(0, 10)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-sm font-bold text-indigo-600">{progress}%</span>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>{sections.length} asama</span>
                <span>{sections.filter((_, i) => tasks[selectedPlan.fikir_id]?.[`step-${i}`]?.done).length} tamamlandi</span>
              </div>
              {fikirler[selectedPlan.fikir_id]?.analiz && (
                <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold text-gray-500 hover:text-indigo-600">SWOT Analizi</summary>
                  <pre className="mt-3 bg-gray-50 rounded-xl p-4 text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{fikirler[selectedPlan.fikir_id].analiz}</pre>
                </details>
              )}
            </div>

            {/* Stages */}
            <div className="space-y-0">
              {sections.map((section, i) => (
                <div key={i}>
                  <StageCard index={i} section={section} task={tasks[selectedPlan.fikir_id]?.[`step-${i}`] || {}} planId={selectedPlan.fikir_id}
                    onUpdateTask={updateTask} onDelete={() => deleteStage(i)} onDragStart={setDragIdx}
                    onDragOver={handleDragOver} onDrop={() => handleDrop(i)} subTasks={tasks[selectedPlan.fikir_id] || {}} />
                  {/* Connector */}
                  {i < sections.length - 1 && (
                    <div className="flex justify-center py-1"><div className="w-0.5 h-6 bg-gray-200 rounded-full" /></div>
                  )}
                </div>
              ))}
            </div>

            {/* Add stage */}
            <div className="mt-4">
              {addingStage ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-5">
                  <input type="text" value={newStage} onChange={e => setNewStage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addStage()}
                    placeholder="Yeni asama adi..." autoFocus
                    className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-gray-400 mb-3" />
                  <div className="flex gap-2">
                    <button onClick={addStage} disabled={!newStage.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Ekle</button>
                    <button onClick={() => { setAddingStage(false); setNewStage(''); }} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">Iptal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingStage(true)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-400 hover:text-indigo-600 text-sm font-semibold transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Yeni asama ekle
                </button>
              )}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bali-gradient text-white rounded-full flex items-center justify-center bali-shadow-brand hover:scale-105 active:scale-95 transition-transform z-30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}

      {/* Chat Drawer */}
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} timeline={timeline} chatInput={chatInput} setChatInput={setChatInput} onSend={sendChat} sending={chatSending} />
    </div>
  );
}
