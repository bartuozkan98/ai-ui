'use client';
import { useRef, useEffect } from 'react';
import { TimelineMessage, formatTime, dayKey } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  timeline: TimelineMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSend: () => void;
  sending: boolean;
}

export default function ChatDrawer({ open, onClose, timeline, chatInput, setChatInput, onSend, sending }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [timeline.length, open]);

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col transition-transform duration-300 bali-shadow-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bali-gradient rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Bali Asistan</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                <span className="text-[11px] text-gray-400">Telegram + Web</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scrollbar-hide">
          {timeline.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-sm text-gray-500 mb-1">Henuz konusma yok</p>
              <p className="text-xs text-gray-400">Bali&apos;ye bir sey sor veya Telegram&apos;dan yaz.</p>
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
                  <div className="flex justify-center my-4">
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{dayKey(m.tarih)}</span>
                  </div>
                )}
                <div className={`flex ${isWeb ? 'justify-end' : 'justify-start'} mb-2 animate-bubble`}>
                  <div className="max-w-[85%]">
                    {!isWeb && <div className="text-[10px] font-semibold text-gray-500 ml-3 mb-0.5">{m.kullanici}</div>}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isWeb ? 'bg-indigo-600 text-white rounded-br-md' : isBali ? 'bg-gray-100 text-gray-900 rounded-bl-md' : 'bg-blue-50 text-gray-900 rounded-bl-md'}`}>
                      {m.metin}
                    </div>
                    <div className={`text-[10px] text-gray-400 mt-1 ${isWeb ? 'text-right mr-2' : 'ml-3'}`}>
                      {formatTime(m.tarih)}
                      {m.source === 'telegram' && <span className="ml-1 text-gray-300">TG</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">{[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
            </div></div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()} placeholder="Bali'ye bir sey sor..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all" />
            <button onClick={onSend} disabled={sending || !chatInput.trim()} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
