"use client";

import { useState } from "react";

const categories = [
  { id: "all", label: "Tümü", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { id: "apartment", label: "Daire", svg: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6v4H9z"/>' },
  { id: "villa", label: "Villa", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
  { id: "seaside", label: "Deniz Kenarı", svg: '<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="12" cy="6" r="3"/>' },
  { id: "pool", label: "Havuzlu", svg: '<path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><rect x="6" y="3" width="12" height="9" rx="1"/>' },
  { id: "mountain", label: "Dağ Evi", svg: '<path d="M8 21l4-10 4 10"/><path d="M2 21l6-12 6 12"/><path d="M14 21l4-8 4 8"/>' },
  { id: "historical", label: "Tarihi", svg: '<path d="M12 2L2 7h20L12 2z"/><rect x="4" y="7" width="16" height="13"/><line x1="9" y1="22" x2="9" y2="11"/><line x1="15" y1="22" x2="15" y2="11"/><rect x="2" y="20" width="20" height="2"/>' },
  { id: "luxury", label: "Lüks", svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  { id: "garden", label: "Bahçeli", svg: '<path d="M12 22V12"/><path d="M8 12C5 12 2 9 2 6c0 4 4 6 10 2"/><path d="M16 12c3 0 6-3 6-6 0 4-4 6-10 2"/>' },
  { id: "studio", label: "Stüdyo", svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/>' },
  { id: "furnished", label: "Eşyalı", svg: '<path d="M4 16h16"/><path d="M4 16V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M2 16v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2"/>' },
  { id: "new", label: "Sıfır Bina", svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>' },
];

interface CategoryBarProps {
  onSelect?: (id: string) => void;
}

export default function CategoryBar({ onSelect }: CategoryBarProps) {
  const [active, setActive] = useState("all");

  return (
    <div className="bg-white border-b border-[#ebebeb] sticky top-[128px] z-40">
      <div className="max-w-[1280px] mx-auto px-4 flex items-center">
        <div className="flex-1 flex items-center gap-8 overflow-x-auto scrollbar-hide py-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActive(cat.id); onSelect?.(cat.id); }}
              className={`flex flex-col items-center gap-[6px] shrink-0 pb-1 transition-all ${
                active === cat.id ? "cat-active opacity-100" : "cat-inactive opacity-70 hover:opacity-100"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: cat.svg }} />
              <span className="text-[12px] font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filters button - Airbnb style */}
        <button className="pill-btn flex items-center gap-2 ml-4 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          </svg>
          <span className="text-[13px]">Filtreler</span>
        </button>
      </div>
    </div>
  );
}
