"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { properties, propertyTypes, roomOptions, cities } from "../data/properties";

export default function SatilikPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Yükleniyor...</div></div>}>
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
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => p.type === "sale");

    if (selectedCity) result = result.filter((p) => p.location.city === selectedCity);
    if (selectedType) result = result.filter((p) => p.propertyType === selectedType);
    if (selectedRooms) result = result.filter((p) => p.features.rooms === selectedRooms);
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => {
        if (max) return p.price >= min && p.price <= max;
        return p.price >= min;
      });
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb & Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-primary">Ana Sayfa</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="text-gray-900">Satılık Emlak</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Satılık Emlak İlanları</h1>
              <p className="text-sm text-gray-500 mt-1">{filtered.length} ilan bulundu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[105px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white hover:border-gray-400 transition-colors cursor-pointer shrink-0">
              <option value="">Tüm Şehirler</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white hover:border-gray-400 transition-colors cursor-pointer shrink-0">
              <option value="">Emlak Tipi</option>
              {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select value={selectedRooms} onChange={(e) => setSelectedRooms(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white hover:border-gray-400 transition-colors cursor-pointer shrink-0">
              <option value="">Oda Sayısı</option>
              {roomOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white hover:border-gray-400 transition-colors cursor-pointer shrink-0">
              <option value="">Fiyat Aralığı</option>
              <option value="0-2000000">0 - 2.000.000 TL</option>
              <option value="2000000-5000000">2M - 5M TL</option>
              <option value="5000000-10000000">5M - 10M TL</option>
              <option value="10000000-99999999999">10M+ TL</option>
            </select>

            <button onClick={() => setShowFilters(!showFilters)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white hover:border-gray-400 transition-colors flex items-center gap-2 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
              Tüm Filtreler
            </button>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white cursor-pointer">
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Artan)</option>
                <option value="price-desc">Fiyat (Azalan)</option>
                <option value="popular">Popüler</option>
              </select>

              <div className="flex border border-gray-300 rounded-full overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-500"}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-500"}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" className="mx-auto mb-4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700">İlan Bulunamadı</h3>
            <p className="text-gray-500 mt-1">Filtrelerinizi değiştirmeyi deneyin</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} layout="list" />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
