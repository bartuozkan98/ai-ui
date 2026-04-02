"use client";

import { useState } from "react";

interface Category {
  id: string;
  label: string;
  icon: string;
}

const categories: Category[] = [
  { id: "all", label: "Tümü", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "apartment", label: "Daire", icon: "M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" },
  { id: "villa", label: "Villa", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "seaside", label: "Deniz Kenarı", icon: "M2 12h2l2-3 3 6 3-6 3 6 3-6 2 3h2" },
  { id: "mountain", label: "Dağ Evi", icon: "M8 21l4-10 4 10M12 11V3M4 21h16" },
  { id: "historical", label: "Tarihi", icon: "M12 2L2 7h20L12 2zM4 7v10h16V7M8 17v4M16 17v4M2 21h20" },
  { id: "modern", label: "Modern", icon: "M4 4h16v16H4zM4 12h16M12 4v16" },
  { id: "pool", label: "Havuzlu", icon: "M2 12h2c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2h2M2 18h2c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2h2" },
  { id: "garden", label: "Bahçeli", icon: "M12 22V8M9 12c-3 0-6-2-6-5.5S6 1 12 5.5C18 1 21 3 21 6.5S18 12 15 12" },
  { id: "luxury", label: "Lüks", icon: "M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6z" },
  { id: "investment", label: "Yatırımlık", icon: "M12 8v8M8 12h8M3 3v18h18" },
  { id: "furnished", label: "Eşyalı", icon: "M4 20h16M4 16h16V8H4v8zM6 8V4M18 8V4" },
];

interface CategoryBarProps {
  onSelect?: (id: string) => void;
}

export default function CategoryBar({ onSelect }: CategoryBarProps) {
  const [active, setActive] = useState("all");

  const handleClick = (id: string) => {
    setActive(id);
    onSelect?.(id);
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 pb-2 border-b-2 transition-all ${
                active === cat.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={cat.icon} />
              </svg>
              <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
