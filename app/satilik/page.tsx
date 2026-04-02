"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { properties, propertyTypes, roomOptions, cities } from "../data/properties";

export default function SatilikPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-airbnb-foggy">Yükleniyor...</div>}>
      <SatilikContent />
    </Suspense>
  );
}

function SatilikContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "";

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedType, setSelectedType] = useState("");
  const [selectedRooms, setSelectedRooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let result = properties.filter((p) => p.type === "sale");
    if (selectedCity) result = result.filter((p) => p.location.city === selectedCity);
    if (selectedType) result = result.filter((p) => p.propertyType === selectedType);
    if (selectedRooms) result = result.filter((p) => p.features.rooms === selectedRooms);
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => max ? p.price >= min && p.price <= max : p.price >= min);
    }
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "popular": result.sort((a, b) => b.views - a.views); break;
    }
    return result;
  }, [selectedCity, selectedType, selectedRooms, priceRange, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-sahi-bg">
      <Header />

      {/* Breadcrumb - Sahibinden style */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-[1280px] mx-auto px-4 py-2">
          <div className="flex items-center gap-1.5 text-[12px] text-airbnb-foggy">
            <a href="/" className="hover:text-sahi-blue">Ana Sayfa</a>
            <span>&gt;</span>
            <a href="#" className="hover:text-sahi-blue">Emlak</a>
            <span>&gt;</span>
            <span className="text-[#333]">Satılık</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-4 flex gap-5 flex-1 w-full">
        {/* Left sidebar filters - Sahibinden style */}
        <aside className="w-[220px] shrink-0 hidden lg:block">
          <div className="bg-white border border-[#e0e0e0] rounded">
            <div className="p-3 bg-[#f8f8f8] border-b border-[#e0e0e0]">
              <h3 className="text-[13px] font-bold text-[#333]">Filtreler</h3>
            </div>

            {/* City filter */}
            <div className="p-3 border-b border-[#f0f0f0]">
              <label className="block text-[12px] font-semibold text-[#333] mb-1.5">Şehir</label>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full border border-[#ddd] rounded px-2 py-1.5 text-[12px] cursor-pointer">
                <option value="">Tüm Şehirler</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Property type */}
            <div className="p-3 border-b border-[#f0f0f0]">
              <label className="block text-[12px] font-semibold text-[#333] mb-1.5">Emlak Tipi</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full border border-[#ddd] rounded px-2 py-1.5 text-[12px] cursor-pointer">
                <option value="">Tümü</option>
                {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Room count */}
            <div className="p-3 border-b border-[#f0f0f0]">
              <label className="block text-[12px] font-semibold text-[#333] mb-1.5">Oda Sayısı</label>
              <select value={selectedRooms} onChange={(e) => setSelectedRooms(e.target.value)} className="w-full border border-[#ddd] rounded px-2 py-1.5 text-[12px] cursor-pointer">
                <option value="">Tümü</option>
                {roomOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Price range */}
            <div className="p-3 border-b border-[#f0f0f0]">
              <label className="block text-[12px] font-semibold text-[#333] mb-1.5">Fiyat</label>
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full border border-[#ddd] rounded px-2 py-1.5 text-[12px] cursor-pointer">
                <option value="">Tüm Fiyatlar</option>
                <option value="0-2000000">0 - 2.000.000 TL</option>
                <option value="2000000-5000000">2M - 5M TL</option>
                <option value="5000000-10000000">5M - 10M TL</option>
                <option value="10000000-99999999999">10.000.000+ TL</option>
              </select>
            </div>

            <div className="p-3">
              <button className="w-full bg-sahi-blue hover:bg-sahi-blue-dark text-white text-[12px] font-semibold py-2 rounded transition-colors">
                Ara
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border border-[#e0e0e0] rounded p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[16px] font-bold text-[#333]">Satılık Konut İlanları</h1>
              <p className="text-[12px] text-airbnb-foggy">{filtered.length} ilan bulundu</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filters */}
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="lg:hidden pill-btn text-[12px] py-1.5">
                <option value="">Şehir</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-[#ddd] rounded px-2 py-1.5 text-[12px] cursor-pointer">
                <option value="newest">Tarihe Göre</option>
                <option value="price-asc">Fiyat (Artan)</option>
                <option value="price-desc">Fiyat (Azalan)</option>
                <option value="popular">Popüler</option>
              </select>

              <div className="flex border border-[#ddd] rounded overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-sahi-blue text-white" : "bg-white text-[#666]"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-sahi-blue text-white" : "bg-white text-[#666]"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#e0e0e0] rounded p-12 text-center">
              <p className="text-[14px] text-airbnb-foggy">İlan bulunamadı. Filtrelerinizi değiştirmeyi deneyin.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} layout="list" />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
