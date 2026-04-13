'use client';
import { Section, TaskState, ASSIGNEES, ASSIGNEE_COLORS } from './types';
import { NodePos } from './canvas';

interface Props {
  id: string;
  index: number;
  section: Section;
  task: TaskState;
  planId: string;
  pos: NodePos;
  onUpdateTask: (planId: string, taskId: string, field: string, value: any) => void;
  onDelete: () => void;
  onDragStart: (id: string, pos: NodePos, e: React.MouseEvent, zoom: number) => void;
  zoom: number;
  subTasks: Record<string, TaskState>;
}

export default function CanvasNode({ id, index, section, task, planId, pos, onUpdateTask, onDelete, onDragStart, zoom, subTasks }: Props) {
  const isDone = task.done || false;
  const taskKey = `step-${index}`;
  const subCount = section.items.length;
  const subDoneCount = section.items.filter((_, j) => subTasks[`step-${index}-sub-${j}`]?.done).length;
  const pct = subCount > 0 ? Math.round(subDoneCount / subCount * 100) : (isDone ? 100 : 0);

  return (
    <div className={`absolute select-none ${isDone ? 'opacity-70' : ''}`}
      style={{ left: pos.x, top: pos.y, width: 280 }}>
      <div className={`bg-white rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing group hover:shadow-lg ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-indigo-300'}`}
        onMouseDown={e => onDragStart(id, pos, e, zoom)}>

        {/* Progress bar at very top */}
        <div className="h-1.5 rounded-t-2xl bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-t-2xl transition-all ${pct >= 100 ? 'bg-emerald-400' : 'bg-indigo-400'}`} style={{ width: `${pct}%` }} />
        </div>

        {/* Header */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isDone ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
              {isDone ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs font-semibold leading-tight ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {section.title || `Asama ${index + 1}`}
              </h3>
              {section.description && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{section.description}</p>}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <span className={`text-[10px] font-bold ${pct >= 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>{pct}%</span>
              <button onClick={e => { e.stopPropagation(); onDelete(); }}
                className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-items inline */}
        {subCount > 0 && (
          <div className="px-3 pb-2 space-y-0.5">
            {section.items.map((item, j) => {
              const subKey = `step-${index}-sub-${j}`;
              const subDone = subTasks[subKey]?.done || false;
              return (
                <div key={j} className="flex items-start gap-2 py-0.5" onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}>
                  <button onClick={() => onUpdateTask(planId, subKey, 'done', !subDone)}
                    className={`mt-0.5 w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-all ${subDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                    {subDone && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <span className={`text-[11px] leading-tight ${subDone ? 'line-through text-gray-400' : 'text-gray-600'}`}>{item}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center gap-1 px-3 pb-2.5 pt-1 border-t border-gray-100">
          <button onClick={e => { e.stopPropagation(); onUpdateTask(planId, taskKey, 'done', !isDone); }}
            className={`h-7 px-2.5 rounded-md text-[10px] font-medium transition-all ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            {isDone ? 'Tamamlandi' : 'Tamamla'}
          </button>
          <select value={task.assignee || ''} onClick={e => e.stopPropagation()}
            onChange={e => onUpdateTask(planId, taskKey, 'assignee', e.target.value)}
            className={`h-7 text-[10px] font-semibold px-1.5 rounded-md border-0 cursor-pointer ${task.assignee ? ASSIGNEE_COLORS[task.assignee] : 'bg-gray-100 text-gray-400'}`}>
            <option value="">Ata</option>
            {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Connection dots */}
      <div className="absolute top-1/2 -right-2 w-3.5 h-3.5 bg-white border-2 border-gray-300 rounded-full -translate-y-1/2" />
      <div className="absolute top-1/2 -left-2 w-3.5 h-3.5 bg-white border-2 border-gray-300 rounded-full -translate-y-1/2" />
    </div>
  );
}
