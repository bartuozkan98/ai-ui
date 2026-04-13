'use client';
import { useState } from 'react';
import { Section, TaskState, TaskComment, ASSIGNEES, ASSIGNEE_COLORS } from './types';
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
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const isDone = task.done || false;
  const taskKey = `step-${index}`;

  return (
    <div
      className={`absolute select-none ${isDone ? 'opacity-70' : ''}`}
      style={{ left: pos.x, top: pos.y, width: 320 }}
    >
      <div className={`bg-white rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing group hover:shadow-lg ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-indigo-300'}`}
        onMouseDown={e => onDragStart(id, pos, e, zoom)}>

        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isDone ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
              {isDone ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold leading-tight ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {section.title || `Asama ${index + 1}`}
              </h3>
              {section.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{section.description}</p>}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <button onClick={e => { e.stopPropagation(); onUpdateTask(planId, taskKey, 'done', !isDone); }}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              {isDone ? 'Tamamlandi' : 'Tamamla'}
            </button>
            <select value={task.assignee || ''} onClick={e => e.stopPropagation()}
              onChange={e => onUpdateTask(planId, taskKey, 'assignee', e.target.value)}
              className={`h-8 text-xs font-semibold px-2 rounded-lg border-0 cursor-pointer ${task.assignee ? ASSIGNEE_COLORS[task.assignee] : 'bg-gray-100 text-gray-400'}`}>
              <option value="">Ata</option>
              {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 ml-auto">
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3" onClick={e => e.stopPropagation()}>
            {section.items.length > 0 && (
              <div className="space-y-1">
                {section.items.map((item, j) => {
                  const subKey = `step-${index}-sub-${j}`;
                  const subDone = subTasks[subKey]?.done || false;
                  return (
                    <div key={j} className="flex items-start gap-2 py-1">
                      <button onClick={() => onUpdateTask(planId, subKey, 'done', !subDone)}
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${subDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                        {subDone && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`text-xs ${subDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {(task.comments || []).map((c: TaskComment, ci: number) => (
              <div key={ci} className="text-xs text-gray-500 mt-2 flex gap-1.5"><span>💬</span><span>{c.text}</span></div>
            ))}
            <input type="text" value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && comment.trim()) { onUpdateTask(planId, taskKey, 'comment', comment.trim()); setComment(''); } }}
              placeholder="Not ekle..." className="w-full text-xs bg-gray-50 rounded-lg px-3 py-2 mt-2 outline-none focus:ring-1 focus:ring-indigo-200" />
          </div>
        )}
      </div>

      {/* Connection dot (right side) */}
      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2" />
      {/* Connection dot (left side) */}
      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2" />
    </div>
  );
}
