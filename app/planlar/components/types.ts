export interface Plan {
  fikir_id: string;
  fikir_metni: string;
  plan_metni: string;
  onayland_tarih: string;
  durum: string;
}

export interface Fikir {
  id: string;
  metin: string;
  onerilen_by: string;
  tarih: string;
  durum: string;
  analiz: string;
  plan: string | null;
}

export interface TimelineMessage {
  kullanici: string;
  metin: string;
  tarih: string;
  bot?: boolean;
  source: 'telegram' | 'web' | 'permanent';
}

export interface TaskComment { text: string; date: string; }
export interface TaskState { done?: boolean; assignee?: string; comments?: TaskComment[]; }

export interface Section { title: string; description: string; items: string[]; }

export interface HavuzItem {
  id: string;
  metin: string;
  kaynak: string;
  tarih: string;
  plan_id: string;
}

export const ASSIGNEES = ['Bartu', 'Kerem', 'Ortak'];
export const ASSIGNEE_COLORS: Record<string, string> = {
  Bartu: 'bg-blue-100 text-blue-700 ring-blue-200',
  Kerem: 'bg-purple-100 text-purple-700 ring-purple-200',
  Ortak: 'bg-amber-100 text-amber-700 ring-amber-200',
};

export function parsePlan(text: string): Section[] {
  const steps: Section[] = [];
  const lines = text.split('\n');
  let current: Section | null = null;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const isHeader = /^(\*\*|##|#+)/.test(t) || (/^[A-ZÇĞİÖŞÜ\d].*:$/.test(t) && t.length < 100) || /^\d+\.\s+\*\*/.test(t) || /^\d+\.\s+[A-ZÇĞİÖŞÜ]/.test(t);
    if (isHeader) {
      if (current) steps.push(current);
      current = { title: t.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '').replace(/:$/, '').replace(/^\d+\.\s*/, ''), description: '', items: [] };
    } else if (current) {
      if (t.startsWith('-') || t.startsWith('•') || /^\d+[\.\)]/.test(t)) {
        current.items.push(t.replace(/^[-•✓]\s*/, '').replace(/^\d+[\.\)]\s*/, ''));
      } else { current.description += (current.description ? ' ' : '') + t; }
    } else { current = { title: '', description: t, items: [] }; }
  }
  if (current) steps.push(current);
  return steps;
}

export function serializePlan(sections: Section[]): string {
  return sections.map((s, i) => {
    let text = `**${i + 1}. ${s.title}**\n`;
    if (s.description) text += `${s.description}\n`;
    for (const item of s.items) text += `- ${item}\n`;
    return text;
  }).join('\n');
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const same = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  if (same) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
