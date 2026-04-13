'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plan, TimelineMessage, TaskState, Section, parsePlan, serializePlan } from './components/types';
import { useCanvas, useNodeDrag, NodePos } from './components/canvas';
import ChatDrawer from './components/ChatDrawer';
import CanvasNode from './components/CanvasNode';

const NODE_W = 280;
const NODE_GAP_X = 100;
const ROW_GAP = 60;

interface PlanSections { plan: Plan; sections: Section[]; }

function allPositions(groups: PlanSections[]): Record<string, NodePos> {
  const p: Record<string, NodePos> = {};
  let yOffset = 80;
  for (const g of groups) {
    const labelH = 40;
    for (let i = 0; i < g.sections.length; i++) {
      p[`${g.plan.fikir_id}-${i}`] = { x: 80 + i * (NODE_W + NODE_GAP_X), y: yOffset + labelH };
    }
    const rows = Math.max(1, Math.ceil(g.sections.length / 1));
    yOffset += labelH + rows * 260 + ROW_GAP;
  }
  return p;
}

export default function PlanlarPage() {
  const [planlar, setPlanlar] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Record<string, Record<string, TaskState>>>({});
  const [timeline, setTimeline] = useState<TimelineMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [positions, setPositions] = useState<Record<string, NodePos>>({});
  const [ordering, setOrdering] = useState(false);

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
      setTasks(tD || {});
      setTimeline(hD.messages || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const id = setInterval(fetchData, 4000); return () => clearInterval(id); }, [fetchData]);

  const groups: PlanSections[] = useMemo(() =>
    planlar.map(p => ({ plan: p, sections: parsePlan(p.plan_metni) })), [planlar]);

  useEffect(() => {
    setPositions(prev => {
      const def = allPositions(groups);
      const merged: Record<string, NodePos> = {};
      for (const key of Object.keys(def)) merged[key] = prev[key] || def[key];
      return merged;
    });
  }, [groups]);

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

  async function savePlanFor(planId: string, newSections: Section[]) {
    await fetch('/api/planlar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fikir_id: planId, plan_metni: serializePlan(newSections) }) });
    await fetchData();
  }

  function deleteStage(planId: string, sections: Section[], i: number) {
    const s = [...sections]; s.splice(i, 1); savePlanFor(planId, s);
  }

  async function updateAllPlans() {
    if (ordering) return;
    setOrdering(true);
    try {
      await fetch('/api/planlar/guncelle', { method: 'POST' });
      setPositions({});
      await fetchData();
    } catch {} finally { setOrdering(false); }
  }

  // Arrow connections across all plans
  const arrows = useMemo(() => {
    const a: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const g of groups) {
      for (let i = 0; i < g.sections.length - 1; i++) {
        const from = positions[`${g.plan.fikir_id}-${i}`];
        const to = positions[`${g.plan.fikir_id}-${i + 1}`];
        if (!from || !to) continue;
        a.push({ x1: from.x + NODE_W + 2, y1: from.y + 60, x2: to.x - 2, y2: to.y + 60 });
      }
    }
    return a;
  }, [positions, groups]);

  if (loading) return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bali-gradient rounded-lg flex items-center justify-center"><span className="text-white text-[10px] sm:text-xs font-bold">B</span></div>
          <span className="text-xs sm:text-sm font-bold text-gray-900">Bali</span>
          {planlar.length > 0 && (
            <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">{planlar.length} plan, {groups.reduce((s, g) => s + g.sections.length, 0)} asama</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs text-gray-400">{Math.round(canvas.zoom * 100)}%</span>
          <button onClick={canvas.resetView} className="text-[10px] sm:text-xs text-gray-500 hover:text-gray-800 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100">Sifirla</button>
          <button onClick={() => setChatOpen(true)} className="h-8 sm:h-9 px-3 sm:px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="hidden sm:inline">Sohbet</span>
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 shrink-0">
        {planlar.length > 0 && (
          <button onClick={updateAllPlans} disabled={ordering} className="h-7 sm:h-8 px-3 sm:px-4 bg-violet-50 hover:bg-violet-100 text-violet-700 disabled:opacity-50 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors">
            {ordering ? (
              <><div className="w-3 h-3 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /> <span className="hidden sm:inline">Guncelleniyor...</span></>
            ) : (
              <><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Asamalari Guncelle</>
            )}
          </button>
        )}
        <div className="flex-1" />
        {(() => {
          const total = groups.reduce((s, g) => s + g.sections.length, 0);
          const done = groups.reduce((s, g) => s + g.sections.filter((_, i) => tasks[g.plan.fikir_id]?.[`step-${i}`]?.done).length, 0);
          const pct = total > 0 ? Math.round(done / total * 100) : 0;
          return total > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500">{pct}%</span>
            </div>
          ) : null;
        })()}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative touch-none"
        onMouseDown={canvas.onMouseDown} onMouseMove={canvas.onMouseMove} onMouseUp={canvas.onMouseUp} onWheel={canvas.onWheel}
        onTouchStart={canvas.onTouchStart} onTouchMove={canvas.onTouchMove} onTouchEnd={canvas.onTouchEnd}>

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
            {groups.map(g => g.sections.map((section, i) => {
              const nodeId = `${g.plan.fikir_id}-${i}`;
              const pos = positions[nodeId] || { x: 0, y: 0 };
              return (
                <div key={nodeId}>
                  {i === 0 && (
                    <div className="absolute" style={{ left: pos.x, top: pos.y - 32 }}>
                      <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                        {g.plan.fikir_id} — {g.plan.fikir_metni.slice(0, 40)}
                      </span>
                    </div>
                  )}
                  <CanvasNode id={nodeId} index={i} section={section}
                    task={tasks[g.plan.fikir_id]?.[`step-${i}`] || {}}
                    planId={g.plan.fikir_id} pos={pos}
                    onUpdateTask={updateTask} onDelete={() => deleteStage(g.plan.fikir_id, g.sections, i)}
                    onDragStart={nodeDrag.startDrag}
                    zoom={canvas.zoom} subTasks={tasks[g.plan.fikir_id] || {}} />
                </div>
              );
            }))}

          </div>
        )}
      </div>

      {/* Chat FAB */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bali-gradient text-white rounded-full flex items-center justify-center bali-shadow-brand hover:scale-105 active:scale-95 transition-transform z-30">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} timeline={timeline} chatInput={chatInput} setChatInput={setChatInput} onSend={sendChat} sending={chatSending} />
    </div>
  );
}
