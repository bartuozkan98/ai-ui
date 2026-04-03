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
  const [showFilters, setShowFilters] = useState(false);

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

      {/* Filter bar */}
      <div className="sticky top-[80px] lg:top-[80px] z-40 bg-white border-b border-[#f0f0f0]">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-semibold text-airbnb-hof mr-4 hidden md:block">{title}</h1>

            {/* Date range */}
            <div className="flex items-center border border-[#ddd] rounded-xl overflow-hidden hover:border-[#222] transition-colors">
              <div className="px-3 py-2">
                <div className="text-[10px] font-semibold text-airbnb-foggy uppercase">Giris</div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-[13px] border-none p-0 bg-transparent w-[110px]" />
              </div>
              <div className="w-[1px] h-8 bg-[#ddd]" />
              <div className="px-3 py-2">
                <div className="text-[10px] font-semibold text-airbnb-foggy uppercase">Cikis</div>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-[13px] border-none p-0 bg-transparent w-[110px]" />
              </div>
            </div>

            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="border border-[#ddd] rounded-xl px-4 py-3 text-[13px] bg-white hover:border-[#222] transition-colors">
              <option value="">Tum Sehirler</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-[#ddd] rounded-xl px-4 py-3 text-[13px] bg-white hover:border-[#222] transition-colors">
              <option value="popular">Populer</option>
              <option value="price-asc">Fiyat (Artan)</option>
              <option value="price-desc">Fiyat (Azalan)</option>
              <option value="rating">Puan</option>
            </select>

            <span className="ml-auto text-[14px] text-airbnb-foggy shrink-0">
              <strong className="text-airbnb-hof">{filtered.length}</strong> ilan bulundu
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 py-8 flex-1 w-full">
        {/* Mobile title */}
        <h1 className="text-[22px] font-semibold text-airbnb-hof mb-6 md:hidden">{title}</h1>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1" className="mx-auto mb-4"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <p className="text-[18px] font-semibold text-airbnb-hof">Uygun ilan bulunamadi</p>
            <p className="text-[14px] text-airbnb-foggy mt-1">Tarih veya sehir filtresini degistirmeyi deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {filtered.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
