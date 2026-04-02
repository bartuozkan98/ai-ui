"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cities } from "../data/properties";

export default function SearchBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sale" | "rent" | "daily">("sale");
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    if (activeTab === "sale") {
      router.push(`/satilik${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    } else {
      const params = new URLSearchParams();
      if (activeTab === "daily") params.set("type", "daily");
      if (city) params.set("city", city);
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      router.push(`/kiralik?${params.toString()}`);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Airbnb-style tabs */}
      <div className="flex justify-center gap-6 mb-5">
        {[
          { key: "sale" as const, label: "Satılık" },
          { key: "rent" as const, label: "Kiralık" },
          { key: "daily" as const, label: "Günlük Kiralık" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[15px] pb-2 transition-all border-b-2 ${
              activeTab === tab.key
                ? "text-airbnb-hof font-semibold border-airbnb-hof"
                : "text-airbnb-foggy font-normal border-transparent hover:text-airbnb-hof hover:border-[#ddd]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Airbnb pill search bar */}
      <div className="bg-white rounded-full search-shadow border border-[#ddd] flex items-center h-[56px] divide-x divide-[#ddd] hover:shadow-lg transition-shadow">
        {/* Location */}
        <div className="flex-1 px-5 py-2 rounded-l-full hover:bg-[#ebebeb] transition-colors cursor-pointer">
          <div className="text-[11px] font-semibold text-airbnb-hof">Konum</div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full text-[13px] text-airbnb-foggy bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
          >
            <option value="">Nereye gidiyorsunuz?</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {activeTab === "daily" ? (
          <>
            <div className="px-4 py-2 hover:bg-[#ebebeb] transition-colors cursor-pointer">
              <div className="text-[11px] font-semibold text-airbnb-hof">Giriş</div>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="text-[13px] text-airbnb-foggy bg-transparent border-none p-0 w-[100px]" />
            </div>
            <div className="px-4 py-2 hover:bg-[#ebebeb] transition-colors cursor-pointer">
              <div className="text-[11px] font-semibold text-airbnb-hof">Çıkış</div>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="text-[13px] text-airbnb-foggy bg-transparent border-none p-0 w-[100px]" />
            </div>
            <div className="px-4 py-2 hover:bg-[#ebebeb] transition-colors cursor-pointer">
              <div className="text-[11px] font-semibold text-airbnb-hof">Misafir</div>
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className="text-[13px] text-airbnb-foggy bg-transparent border-none p-0 focus:ring-0 cursor-pointer">
                <option value="">Misafir ekle</option>
                {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} misafir</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 py-2 hover:bg-[#ebebeb] transition-colors cursor-pointer">
              <div className="text-[11px] font-semibold text-airbnb-hof">Emlak Tipi</div>
              <select className="text-[13px] text-airbnb-foggy bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-[100px]">
                <option value="">Tümü</option>
                <option>Daire</option>
                <option>Villa</option>
                <option>Residence</option>
                <option>Müstakil</option>
              </select>
            </div>
            <div className="px-5 py-2 hover:bg-[#ebebeb] transition-colors cursor-pointer">
              <div className="text-[11px] font-semibold text-airbnb-hof">Fiyat</div>
              <select className="text-[13px] text-airbnb-foggy bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-[100px]">
                <option value="">Fiyat ekle</option>
                <option>0-2M TL</option>
                <option>2M-5M TL</option>
                <option>5M-10M TL</option>
                <option>10M+ TL</option>
              </select>
            </div>
          </>
        )}

        {/* Search button - Airbnb pink circle */}
        <div className="pr-2 pl-2">
          <button
            onClick={handleSearch}
            className="w-[40px] h-[40px] bg-airbnb-rausch hover:bg-airbnb-rausch-dark rounded-full flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
