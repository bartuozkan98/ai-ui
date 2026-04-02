"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cities } from "../data/properties";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sale" | "rent" | "daily">("sale");
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    if (activeTab === "sale") {
      router.push(`/satilik${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    } else if (activeTab === "rent") {
      router.push(`/kiralik${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    } else {
      const params = new URLSearchParams();
      params.set("type", "daily");
      if (city) params.set("city", city);
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      router.push(`/kiralik?${params.toString()}`);
    }
  };

  if (variant === "hero") {
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-4">
          {[
            { key: "sale" as const, label: "Satılık" },
            { key: "rent" as const, label: "Kiralık" },
            { key: "daily" as const, label: "Günlük Kiralık" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search box */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col md:flex-row items-stretch">
          {/* Location */}
          <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Konum</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-sm text-gray-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            >
              <option value="">Tüm Türkiye</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date pickers for daily rental */}
          {activeTab === "daily" && (
            <>
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Giriş Tarihi</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm text-gray-800 bg-transparent border-none p-0"
                />
              </div>
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Çıkış Tarihi</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm text-gray-800 bg-transparent border-none p-0"
                />
              </div>
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Misafir</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-sm text-gray-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                >
                  <option value="">Misafir Sayısı</option>
                  {[1,2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>{n} Misafir</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Property type for sale/rent */}
          {activeTab !== "daily" && (
            <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Emlak Tipi</label>
              <select className="w-full text-sm text-gray-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer">
                <option value="">Tümü</option>
                <option value="apartment">Daire</option>
                <option value="villa">Villa</option>
                <option value="residence">Residence</option>
                <option value="penthouse">Penthouse</option>
                <option value="detached">Müstakil</option>
                <option value="studio">Stüdyo</option>
              </select>
            </div>
          )}

          {/* Price range for sale/rent */}
          {activeTab !== "daily" && (
            <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Fiyat Aralığı</label>
              <select className="w-full text-sm text-gray-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer">
                <option value="">Tüm Fiyatlar</option>
                <option value="0-2000000">0 - 2.000.000 TL</option>
                <option value="2000000-5000000">2.000.000 - 5.000.000 TL</option>
                <option value="5000000-10000000">5.000.000 - 10.000.000 TL</option>
                <option value="10000000+">10.000.000+ TL</option>
              </select>
            </div>
          )}

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-6 py-3 m-1 flex items-center justify-center gap-2 transition-colors font-semibold shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden sm:inline">Ara</span>
          </button>
        </div>
      </div>
    );
  }

  // Compact variant for listing pages
  return (
    <div className="bg-white border border-gray-200 rounded-full shadow-sm p-1.5 flex items-center gap-2 max-w-2xl mx-auto">
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-1 text-sm text-gray-700 bg-transparent border-none px-4 py-2 focus:ring-0 cursor-pointer"
      >
        <option value="">Tüm Konumlar</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <div className="w-px h-6 bg-gray-200" />
      <select className="flex-1 text-sm text-gray-700 bg-transparent border-none px-4 py-2 focus:ring-0 cursor-pointer">
        <option value="">Tüm Tipler</option>
        <option value="apartment">Daire</option>
        <option value="villa">Villa</option>
        <option value="residence">Residence</option>
      </select>
      <button
        onClick={handleSearch}
        className="bg-primary hover:bg-primary-dark text-white rounded-full p-2.5 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
