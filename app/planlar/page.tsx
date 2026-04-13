'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plan, Fikir, TimelineMessage, TaskState, Section, parsePlan, serializePlan } from './components/types';
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
  const [addingNode, setAddingNode] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');

  const canvas = useCanvas();

  const moveNode = useCallback((id: string, pos: NodePos) => {
    setPositions(p => ({ ...p, [id]: pos }));
  }, []);
  const nodeDrag = useNodeDrag(moveNode);

  const fetchData = useCallback(async () => {
    try {
      const [pR, tR, hR] = await Promise.all([fetch('/api/planlar'), fetch('/api/tasks'), fetch('/api/telegram-history')]);
      const pD = await pR.json(), tD = await tR.json(), hD = await hR.json();
      setPlanlar(pD.planlar || []);
      setFikirler(pD.fikirler || {});
      setTasks(tD || {});
      setTimeline(hD.messages || []);
      setSelectedPlan(prev => {
        if (prev) return (pD.planlar || []).find((p: Plan) => p.fikir_id === prev.fikir_id) || prev;
        return (pD.planlar || [])[0] || null;
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const id = setInterval(fetchData, 4000); return () => clearInterval(id); }, [fetchData]);

  const sections = useMemo(() => selectedPlan ? parsePlan(selectedPlan.plan_metni) : [], [selectedPlan]);

  useEffect(() => {
    setPositions(prev => {
      const def = defaultPositions(sections.length);
      const merged: Record<string, NodePos> = {};
      for (const key of Object.keys(def)) {
        merged[key] = prev[key] || def[key];
      }
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
  function addStage() {
    if (!newNodeTitle.trim()) return;
    savePlan([...sections, { title: newNodeTitle.trim(), description: '', items: [] }]);
    setNewNodeTitle(''); setAddingNode(false);
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
            <select value={selectedPlan?.fikir_id || ''} onChange={e => { setSelectedPlan(planlar.find(p => p.fikir_id === e.target.value) || null); setPositions({}); }}
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
            {timeline.length > 0 && <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{timeline.length}</span>}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
        <button onClick={() => setAddingNode(true)} className="h-8 px-4 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Yeni Asama
        </button>
        {selectedPlan && <span className="text-xs text-gray-400">{sections.length} asama</span>}
        <div className="flex-1" />
        {selectedPlan && (
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${sections.length > 0 ? Math.round(sections.filter((_, i) => tasks[selectedPlan.fikir_id]?.[`step-${i}`]?.done).length / sections.length * 100) : 0}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500">{sections.length > 0 ? Math.round(sections.filter((_, i) => tasks[selectedPlan.fikir_id]?.[`step-${i}`]?.done).length / sections.length * 100) : 0}%</span>
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
            {/* Grid dots background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: 5000, height: 5000 }}>
              <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#e5e7eb" /></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Arrows between nodes */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: 5000, height: 5000 }}>
              <defs><marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="10" markerHeight="7" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" /></marker></defs>
              {arrows.map((a, i) => (
                <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#d1d5db" strokeWidth="2" markerEnd="url(#arrow)" />
              ))}
            </svg>

            {/* Nodes */}
            {sections.map((section, i) => (
              <CanvasNode key={i} id={`node-${i}`} index={i} section={section}
                task={tasks[selectedPlan?.fikir_id || '']?.[`step-${i}`] || {}}
                planId={selectedPlan?.fikir_id || ''} pos={positions[`node-${i}`] || { x: 0, y: 0 }}
                onUpdateTask={updateTask} onDelete={() => deleteStage(i)}
                onDragStart={nodeDrag.startDrag} zoom={canvas.zoom}
                subTasks={tasks[selectedPlan?.fikir_id || ''] || {}} />
            ))}
          </div>
        )}
      </div>

      {/* Add stage modal */}
      {addingNode && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center" onClick={() => setAddingNode(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Yeni Asama Ekle</h3>
            <input type="text" value={newNodeTitle} onChange={e => setNewNodeTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStage()}
              placeholder="Asama adi..." autoFocus className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAddingNode(false); setNewNodeTitle(''); }} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium">Iptal</button>
              <button onClick={addStage} disabled={!newNodeTitle.trim()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold">Ekle</button>
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
