"use client";
import { useState, useMemo, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PropertyCard from "./PropertyCard";
import { getListings, Listing, Category, categoryLabels, cities } from "../data/properties";

export default function CategoryPage({ category, title }: { category: Category; title: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { setListings(getListings()); }, []);

  const filtered = useMemo(() => {
    let result = listings.filter((l) => l.category === category);
    if (selectedCity) result = result.filter((l) => l.location.city === selectedCity);
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      result = result.filter((l) => {
        for (const booked of l.bookedDates) {
          const bs = new Date(booked.start).getTime();
          const be = new Date(booked.end).getTime();
          if (s < be && e > bs) return false;
        }
        return true;
      });
    }
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.pricePerDay - b.pricePerDay); break;
      case "price-desc": result.sort((a, b) => b.pricePerDay - a.pricePerDay); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "popular": result.sort((a, b) => b.views - a.views); break;
    }
    return result;
  }, [listings, category, selectedCity, sortBy, startDate, endDate]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="bg-white border-b border-[#ebebeb]">
        <div className="max-w-[1280px] mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-airbnb-foggy">
            <a href="/" className="hover:text-airbnb-rausch">Ana Sayfa</a><span>&gt;</span><span className="text-airbnb-hof">{title}</span>
          </div>
          <h1 className="text-[20px] font-bold text-airbnb-hof mt-1">{title}</h1>
        </div>
      </div>

      <div className="border-b border-[#ebebeb] bg-white sticky top-[92px] z-40">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-[#ddd] rounded-full px-3 py-1.5 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-[13px] border-none p-0 w-[110px] bg-transparent" />
            <span className="text-[#ddd]">→</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-[13px] border-none p-0 w-[110px] bg-transparent" />
          </div>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="pill-btn text-[13px]">
            <option value="">Tüm Şehirler</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pill-btn text-[13px]">
            <option value="popular">Popüler</option>
            <option value="price-asc">Fiyat (Artan)</option>
            <option value="price-desc">Fiyat (Azalan)</option>
            <option value="rating">Puan</option>
          </select>
          <span className="ml-auto text-[13px] text-airbnb-foggy shrink-0">{filtered.length} {categoryLabels[category].toLowerCase()} bulundu</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8 flex-1 w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-[16px] text-airbnb-foggy">Uygun ilan bulunamadı.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filtered.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
