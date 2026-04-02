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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-airbnb-foggy">Yükleniyor...</div>}>
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
  const [rentalType, setRentalType] = useState<"all" | "daily">(isDaily ? "daily" : "all");

  const filtered = useMemo(() => {
    let result = properties.filter((p) => p.type === "daily" || p.type === "rent");
    if (rentalType === "daily") result = result.filter((p) => p.type === "daily");
    if (selectedCity) result = result.filter((p) => p.location.city === selectedCity);
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "popular": result.sort((a, b) => b.views - a.views); break;
    }
    return result;
  }, [selectedCity, sortBy, rentalType]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Airbnb category bar */}
      <CategoryBar />

      {/* Filter pills - Airbnb style */}
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide w-full">
        {/* Rental type toggle */}
        <div className="flex border border-[#ddd] rounded-full overflow-hidden shrink-0">
          <button onClick={() => setRentalType("all")} className={`px-4 py-2 text-[13px] font-medium transition-colors ${rentalType === "all" ? "bg-airbnb-hof text-white" : "bg-white text-airbnb-hof hover:bg-[#f7f7f7]"}`}>
            Tümü
          </button>
          <button onClick={() => setRentalType("daily")} className={`px-4 py-2 text-[13px] font-medium transition-colors ${rentalType === "daily" ? "bg-airbnb-hof text-white" : "bg-white text-airbnb-hof hover:bg-[#f7f7f7]"}`}>
            Günlük
          </button>
        </div>

        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="pill-btn text-[13px]">
          <option value="">Tüm Şehirler</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pill-btn text-[13px]">
          <option value="newest">En Yeni</option>
          <option value="price-asc">Fiyat (Artan)</option>
          <option value="price-desc">Fiyat (Azalan)</option>
          <option value="rating">Puan</option>
          <option value="popular">Popüler</option>
        </select>

        <div className="ml-auto text-[13px] text-airbnb-foggy shrink-0">{filtered.length} ilan</div>
      </div>

      {/* Airbnb grid */}
      <div className="max-w-[1280px] mx-auto px-4 pb-10 flex-1 w-full">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[16px] text-airbnb-foggy">Aradığınız kriterlere uygun ilan bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} layout="grid" />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
