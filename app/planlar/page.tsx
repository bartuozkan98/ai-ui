'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plan, Fikir, TimelineMessage, TaskState, TaskComment, Section, HavuzItem, parsePlan, serializePlan, ASSIGNEES, ASSIGNEE_COLORS } from './components/types';
import { useCanvas, useNodeDrag, NodePos } from './components/canvas';
import ChatDrawer from './components/ChatDrawer';
import CanvasNode from './components/CanvasNode';

const NODE_W = 320;
const NODE_GAP_X = 120;
const NODE_GAP_Y = 40;
const COLS = 3;

function defaultPositions(count: number): Record<string, NodePos> {
  const p: Record<string, NodePos> = {};
  for (let i = 0; i < count; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    p[`node-${i}`] = { x: 80 + col * (NODE_W + NODE_GAP_X), y: 80 + row * (260 + NODE_GAP_Y) };
  }
  return p;
}

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
  const [positions, setPositions] = useState<Record<string, NodePos>>({});
  // Pool (havuz)
  const [havuz, setHavuz] = useState<HavuzItem[]>([]);
  const [havuzOpen, setHavuzOpen] = useState(false);
  const [havuzInput, setHavuzInput] = useState('');
  const [ordering, setOrdering] = useState(false);
  // Detail modal
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [detailComment, setDetailComment] = useState('');

  const canvas = useCanvas();

  const moveNode = useCallback((id: string, pos: NodePos) => {
    setPositions(p => ({ ...p, [id]: pos }));
  }, []);
  const nodeDrag = useNodeDrag(moveNode);

  const fetchHavuz = useCallback(async (planId: string) => {
    try {
      const r = await fetch(`/api/havuz?plan_id=${planId}`);
      const d = await r.json();
      setHavuz(Array.isArray(d) ? d : []);
    } catch { setHavuz([]); }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [pR, tR, hR] = await Promise.all([fetch('/api/planlar'), fetch('/api/tasks'), fetch('/api/telegram-history')]);
      const pD = await pR.json(), tD = await tR.json(), hD = await hR.json();
      setPlanlar(pD.planlar || []);
      setFikirler(pD.fikirler || {});
      setTasks(tD || {});
      setTimeline(hD.messages || []);
      setSelectedPlan(prev => {
        const next = prev
          ? (pD.planlar || []).find((p: Plan) => p.fikir_id === prev.fikir_id) || prev
          : (pD.planlar || [])[0] || null;
        if (next) fetchHavuz(next.fikir_id);
        return next;
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [fetchHavuz]);

  useEffect(() => { fetchData(); const id = setInterval(fetchData, 4000); return () => clearInterval(id); }, [fetchData]);

  const sections = useMemo(() => selectedPlan ? parsePlan(selectedPlan.plan_metni) : [], [selectedPlan]);

  useEffect(() => {
    setPositions(prev => {
      const def = defaultPositions(sections.length);
      const merged: Record<string, NodePos> = {};
      for (const key of Object.keys(def)) merged[key] = prev[key] || def[key];
      return merged;
    });
  }, [sections.length]);

  async function sendChat() {
    if (!chatInput.trim() || chatSending) return;
    const msg = chatInput.trim();
    setChatInput(''); setChatSending(true);
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

  async function savePlan(newSections: Section[]) {
    if (!selectedPlan) return;
    await fetch('/api/planlar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fikir_id: selectedPlan.fikir_id, plan_metni: serializePlan(newSections) }) });
    await fetchData();
  }

  function deleteStage(i: number) { const s = [...sections]; s.splice(i, 1); savePlan(s); }

  // Pool operations
  async function addToHavuz() {
    if (!havuzInput.trim() || !selectedPlan) return;
    await fetch('/api/havuz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_id: selectedPlan.fikir_id, metin: havuzInput.trim() }) });
    setHavuzInput('');
    fetchHavuz(selectedPlan.fikir_id);
  }

  async function removeFromHavuz(itemId: string) {
    if (!selectedPlan) return;
    await fetch('/api/havuz', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_id: selectedPlan.fikir_id, item_id: itemId }) });
    fetchHavuz(selectedPlan.fikir_id);
  }

  async function aiOrder() {
    if (!selectedPlan || havuz.length === 0 || ordering) return;
    setOrdering(true);
    try {
      await fetch('/api/havuz/sirala', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_id: selectedPlan.fikir_id }) });
      setPositions({});
      await fetchData();
    } catch {} finally { setOrdering(false); }
  }

  // Arrow connections
  const arrows = useMemo(() => {
    const a: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < sections.length - 1; i++) {
      const from = positions[`node-${i}`];
      const to = positions[`node-${i + 1}`];
      if (!from || !to) continue;
      a.push({ x1: from.x + NODE_W + 2, y1: from.y + 60, x2: to.x - 2, y2: to.y + 60 });
    }
    return a;
  }, [positions, sections.length]);

  // Detail modal data
  const detailSection = detailIndex !== null ? sections[detailIndex] : null;
  const detailTask = detailIndex !== null && selectedPlan ? (tasks[selectedPlan.fikir_id]?.[`step-${detailIndex}`] || {}) : {};
  const detailSubTasks = selectedPlan ? (tasks[selectedPlan.fikir_id] || {}) : {};

  if (loading) return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bali-gradient rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">B</span></div>
          <span className="text-sm font-bold text-gray-900">Bali</span>
          <span className="text-xs text-gray-300">|</span>
          {planlar.length > 0 && (
            <select value={selectedPlan?.fikir_id || ''} onChange={e => { const p = planlar.find(p => p.fikir_id === e.target.value) || null; setSelectedPlan(p); setPositions({}); if (p) fetchHavuz(p.fikir_id); }}
              className="text-sm font-medium text-gray-700 bg-transparent border-0 cursor-pointer outline-none">
              {planlar.map(p => <option key={p.fikir_id} value={p.fikir_id}>{p.fikir_id} — {p.fikir_metni.slice(0, 50)}</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{Math.round(canvas.zoom * 100)}%</span>
          <button onClick={canvas.resetView} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100">Sifirla</button>
          <button onClick={() => setChatOpen(true)} className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Sohbet
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
        <button onClick={() => setHavuzOpen(true)} className="h-8 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          Havuz {havuz.length > 0 && <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{havuz.length}</span>}
        </button>
        {havuz.length > 0 && (
          <button onClick={aiOrder} disabled={ordering} className="h-8 px-4 bg-violet-50 hover:bg-violet-100 text-violet-700 disabled:opacity-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            {ordering ? (
              <><div className="w-3 h-3 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /> Siralaniyor...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> AI ile Sirala</>
            )}
          </button>
        )}
        {selectedPlan && <span className="text-xs text-gray-400">{sections.length} asama</span>}
        <div className="flex-1" />
        {selectedPlan && sections.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.round(sections.filter((_, i) => tasks[selectedPlan.fikir_id]?.[`step-${i}`]?.done).length / sections.length * 100)}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500">{Math.round(sections.filter((_, i) => tasks[selectedPlan.fikir_id]?.[`step-${i}`]?.done).length / sections.length * 100)}%</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
        onMouseDown={canvas.onMouseDown} onMouseMove={canvas.onMouseMove} onMouseUp={canvas.onMouseUp} onWheel={canvas.onWheel}>

        {planlar.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Henuz plan yok</h2>
            <p className="text-gray-500 mb-6">Bali ile konus, bir fikri olgunlastir ve plana ekle.</p>
            <button onClick={() => setChatOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">Bali ile konus</button>
          </div>
        ) : (
          <div style={{ transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px) scale(${canvas.zoom})`, transformOrigin: '0 0' }} className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: 5000, height: 5000 }}>
              <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e5e7eb" /></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <svg className="absolute inset-0 pointer-events-none" style={{ width: 5000, height: 5000 }}>
              <defs><marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="10" markerHeight="7" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" /></marker></defs>
              {arrows.map((a, i) => (
                <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#d1d5db" strokeWidth="2" markerEnd="url(#arrow)" />
              ))}
            </svg>
            {sections.map((section, i) => (
              <CanvasNode key={i} id={`node-${i}`} index={i} section={section}
                task={tasks[selectedPlan?.fikir_id || '']?.[`step-${i}`] || {}}
                planId={selectedPlan?.fikir_id || ''} pos={positions[`node-${i}`] || { x: 0, y: 0 }}
                onUpdateTask={updateTask} onDelete={() => deleteStage(i)}
                onDragStart={nodeDrag.startDrag} onOpenDetail={() => setDetailIndex(i)}
                zoom={canvas.zoom} subTasks={tasks[selectedPlan?.fikir_id || ''] || {}} />
            ))}
          </div>
        )}
      </div>

      {/* Pool (Havuz) drawer - left side */}
      {havuzOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setHavuzOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-[380px] bg-white z-50 flex flex-col transition-transform duration-300 shadow-2xl ${havuzOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Asama Havuzu</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Sirasiz fikirler — AI siralamadan once</p>
          </div>
          <button onClick={() => setHavuzOpen(false)} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {havuz.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <p className="text-sm text-gray-500">Havuz bos</p>
              <p className="text-xs text-gray-400 mt-1">Asama ekle, sonra AI ile sirala</p>
            </div>
          )}
          {havuz.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3 group">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{item.metin}</p>
                <span className="text-[10px] text-gray-400">{item.kaynak} — {new Date(item.tarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <button onClick={() => removeFromHavuz(item.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-3">
          {havuz.length > 0 && (
            <button onClick={() => { aiOrder(); setHavuzOpen(false); }} disabled={ordering}
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {ordering ? 'Siralaniyor...' : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> AI ile Sirala</>)}
            </button>
          )}
          <div className="flex gap-2">
            <input type="text" value={havuzInput} onChange={e => setHavuzInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addToHavuz()}
              placeholder="Yeni asama ekle..." className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-200" />
            <button onClick={addToHavuz} disabled={!havuzInput.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">Ekle</button>
          </div>
        </div>
      </div>

      {/* Stage Detail Modal */}
      {detailIndex !== null && detailSection && selectedPlan && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => { setDetailIndex(null); setDetailComment(''); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Detail header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-base font-bold ${detailTask.done ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                  {detailTask.done ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : detailIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">{detailSection.title || `Asama ${detailIndex + 1}`}</h2>
                  {detailSection.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{detailSection.description}</p>}
                </div>
                <button onClick={() => { setDetailIndex(null); setDetailComment(''); }}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Status & assignee */}
              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => updateTask(selectedPlan.fikir_id, `step-${detailIndex}`, 'done', !detailTask.done)}
                  className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all ${detailTask.done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                  {detailTask.done ? 'Tamamlandi' : 'Tamamla'}
                </button>
                <select value={detailTask.assignee || ''}
                  onChange={e => updateTask(selectedPlan.fikir_id, `step-${detailIndex}`, 'assignee', e.target.value)}
                  className={`h-9 text-xs font-semibold px-3 rounded-lg border-0 cursor-pointer ${detailTask.assignee ? ASSIGNEE_COLORS[detailTask.assignee] : 'bg-gray-100 text-gray-400'}`}>
                  <option value="">Kisi Ata</option>
                  {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Sub-items */}
            {detailSection.items.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Yapilacaklar</h4>
                <div className="space-y-1">
                  {detailSection.items.map((item, j) => {
                    const subKey = `step-${detailIndex}-sub-${j}`;
                    const subDone = detailSubTasks[subKey]?.done || false;
                    return (
                      <div key={j} className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50">
                        <button onClick={() => updateTask(selectedPlan.fikir_id, subKey, 'done', !subDone)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${subDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                          {subDone && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <span className={`text-sm ${subDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="px-6 py-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notlar</h4>
              {(detailTask.comments || []).length === 0 && <p className="text-xs text-gray-300 mb-3">Henuz not yok</p>}
              {(detailTask.comments || []).map((c: TaskComment, ci: number) => (
                <div key={ci} className="flex gap-2 mb-2 text-sm">
                  <span className="text-gray-300 shrink-0">•</span>
                  <div>
                    <p className="text-gray-700">{c.text}</p>
                    <span className="text-[10px] text-gray-300">{new Date(c.date).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <input type="text" value={detailComment} onChange={e => setDetailComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && detailComment.trim()) { updateTask(selectedPlan.fikir_id, `step-${detailIndex}`, 'comment', detailComment.trim()); setDetailComment(''); } }}
                  placeholder="Not ekle..." className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                <button onClick={() => { if (detailComment.trim()) { updateTask(selectedPlan.fikir_id, `step-${detailIndex}`, 'comment', detailComment.trim()); setDetailComment(''); } }}
                  disabled={!detailComment.trim()} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">Ekle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat FAB */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bali-gradient text-white rounded-full flex items-center justify-center bali-shadow-brand hover:scale-105 active:scale-95 transition-transform z-30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} timeline={timeline} chatInput={chatInput} setChatInput={setChatInput} onSend={sendChat} sending={chatSending} />
    </div>
  );
}
