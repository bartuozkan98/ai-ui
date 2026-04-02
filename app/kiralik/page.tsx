"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import CategoryBar from "../components/CategoryBar";
import { properties, cities } from "../data/properties";

export default function KiralikPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Yükleniyor...</div></div>}>
      <KiralikContent />
    </Suspense>
  );
}

function KiralikContent() {
  const searchParams = useSearchParams();
  const isDaily = searchParams.get("type") === "daily";
  const initialCity = searchParams.get("city") || "";

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rentalType, setRentalType] = useState<"all" | "daily" | "monthly">(isDaily ? "daily" : "all");

  const filtered = useMemo(() => {
    let result = properties.filter((p) => p.type === "daily" || p.type === "rent");

    if (rentalType === "daily") result = result.filter((p) => p.type === "daily");
    if (rentalType === "monthly") result = result.filter((p) => p.type === "rent");
    if (selectedCity) result = result.filter((p) => p.location.city === selectedCity);
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "popular": result.sort((a, b) => b.views - a.views); break;
    }

    return result;
  }, [selectedCity, sortBy, minPrice, maxPrice, rentalType]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Airbnb-style category bar */}
      <CategoryBar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-primary">Ana Sayfa</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="text-gray-900">Kiralık Emlak</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {rentalType === "daily" ? "Günlük Kiralık Evler" : rentalType === "monthly" ? "Aylık Kiralık" : "Kiralık Emlak İlanları"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} ilan bulundu</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-[105px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {/* Rental type tabs */}
            <div className="flex border border-gray-300 rounded-full overflow-hidden shrink-0">
              {[
                { key: "all" as const, label: "Tümü" },
                { key: "daily" as const, label: "Günlük" },
                { key: "monthly" as const, label: "Aylık" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRentalType(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    rentalType === tab.key ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white cursor-pointer shrink-0">
              <option value="">Tüm Şehirler</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                placeholder="Min TL"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-gray-300 rounded-full px-3 py-2 text-sm w-24"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max TL"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border border-gray-300 rounded-full px-3 py-2 text-sm w-24"
              />
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white cursor-pointer">
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Artan)</option>
                <option value="price-desc">Fiyat (Azalan)</option>
                <option value="rating">Puan</option>
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
