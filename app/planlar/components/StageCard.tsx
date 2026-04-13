'use client';
import { useState } from 'react';
import { Section, TaskState, TaskComment, ASSIGNEES, ASSIGNEE_COLORS } from './types';

interface Props {
  index: number;
  section: Section;
  task: TaskState;
  planId: string;
  onUpdateTask: (planId: string, taskId: string, field: string, value: any) => void;
  onDelete: () => void;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: () => void;
  subTasks: Record<string, TaskState>;
}

export default function StageCard({ index, section, task, planId, onUpdateTask, onDelete, onDragStart, onDragOver, onDrop, subTasks }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [comment, setComment] = useState('');
  const isDone = task.done || false;
  const taskKey = `step-${index}`;

  return (
    <div draggable onDragStart={() => onDragStart(index)} onDragOver={e => onDragOver(e, index)} onDrop={onDrop}
      className={`group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing ${isDone ? 'opacity-60' : ''}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Number circle */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all ${isDone ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
            {isDone ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold text-gray-900 ${isDone ? 'line-through text-gray-400' : ''}`}>
              {section.title || `Asama ${index + 1}`}
            </h3>
            {section.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{section.description}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onUpdateTask(planId, taskKey, 'done', !isDone)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDone ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-100 text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>

            <select value={task.assignee || ''} onChange={e => onUpdateTask(planId, taskKey, 'assignee', e.target.value)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer ${task.assignee ? ASSIGNEE_COLORS[task.assignee] : 'bg-gray-100 text-gray-400'}`}>
              <option value="">Ata</option>
              {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <button onClick={() => setExpanded(!expanded)} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <button onClick={onDelete} className="w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: sub-items + comments */}
      {expanded && (section.items.length > 0 || (task.comments || []).length > 0) && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-gray-100 pt-4 ml-14">
            {section.items.map((item, j) => {
              const subKey = `step-${index}-sub-${j}`;
              const subDone = subTasks[subKey]?.done || false;
              return (
                <div key={j} className="flex items-start gap-3 py-1.5 hover:bg-gray-50 rounded-lg px-2 -mx-2">
                  <button onClick={() => onUpdateTask(planId, subKey, 'done', !subDone)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${subDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                    {subDone && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <span className={`text-sm text-gray-700 ${subDone ? 'line-through text-gray-400' : ''}`}>{item}</span>
                </div>
              );
            })}
            {/* Comments */}
            {(task.comments || []).map((c: TaskComment, ci: number) => (
              <div key={ci} className="flex gap-2 mt-2 text-xs text-gray-500">
                <span className="shrink-0">💬</span>
                <div><p>{c.text}</p><span className="text-gray-300">{new Date(c.date).toLocaleString('tr-TR')}</span></div>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && comment.trim()) { onUpdateTask(planId, taskKey, 'comment', comment.trim()); setComment(''); } }}
                placeholder="Not ekle..." className="flex-1 text-sm bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
