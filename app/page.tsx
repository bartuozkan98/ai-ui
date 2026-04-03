"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PropertyCard from "./components/PropertyCard";
import { getListings, Listing, Category, categoryLabels } from "./data/properties";

const categoryFilters: { key: Category | "all"; label: string; icon: string }[] = [
  { key: "all", label: "Tumunu Goster", icon: "M4 6h16M4 12h16M4 18h16" },
  { key: "house", label: "Evler", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { key: "car", label: "Arabalar", icon: "M19 17H5m14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3 13l2-6h14l2 6" },
  { key: "motorcycle", label: "Motorlar", icon: "M5 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm8 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM8 16h5" },
  { key: "boat", label: "Tekneler", icon: "M2 20l2-3c2-2 4-2 6 0s4 2 6 0l2 3M4 17V9l8-5 8 5v8" },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  useEffect(() => { setListings(getListings()); }, []);

  const filtered = activeCategory === "all" ? listings : listings.filter((l) => l.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Category filter bar - Airbnb style */}
      <div className="sticky top-[80px] lg:top-[80px] z-40 bg-white border-b border-[#f0f0f0]">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide py-4">
            {categoryFilters.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex flex-col items-center gap-2 shrink-0 pb-2 border-b-2 transition-all ${
                  activeCategory === cat.key
                    ? "border-airbnb-hof text-airbnb-hof"
                    : "border-transparent text-airbnb-foggy hover:text-airbnb-hof hover:border-[#ddd]"
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cat.icon} />
                </svg>
                <span className="text-[12px] font-semibold whitespace-nowrap">{cat.label}</span>
              </button>
            ))}

            {/* Filter button */}
            <button className="ml-auto shrink-0 flex items-center gap-2 px-4 py-3 border border-[#ddd] rounded-xl text-[12px] font-semibold text-airbnb-hof hover:border-[#222] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round"/>
              </svg>
              Filtreler
            </button>
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 py-6 w-full flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[18px] text-airbnb-hof font-semibold">Sonuc bulunamadi</p>
            <p className="text-[14px] text-airbnb-foggy mt-1">Filtreleri degistirmeyi deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
            {filtered.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      {/* Info banner before footer */}
      <div className="bg-airbnb-hof text-white">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: "Genis secenekler", desc: "Ev, araba, motosiklet ve tekne - ihtiyaciniza uygun ilanlar", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { title: "Guvenli odeme", desc: "Odemeniz cikis tarihine kadar RentHub guvencesinde tutulur", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { title: "Dusuk komisyon", desc: "Tum kiralamalarda sadece %3 komisyon uygulanir", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item) => (
              <div key={item.title}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                </div>
                <h3 className="text-[16px] font-semibold mb-2">{item.title}</h3>
                <p className="text-[14px] text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
