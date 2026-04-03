"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PropertyCard from "./components/PropertyCard";
import { getListings, Listing, Category, categoryLabels, categoryIcons } from "./data/properties";

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  useEffect(() => { setListings(getListings()); }, []);

  const filtered = activeCategory === "all" ? listings : listings.filter((l) => l.category === activeCategory);
  const popular = [...listings].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-[#1a1a27] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-airbnb-rausch rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FFE800] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">Her Şeyi Kirala, Her Şeyi Kiraya Ver</h1>
          <p className="text-[16px] text-gray-400 max-w-xl mx-auto">Ev, araba, motosiklet ve tekne - güvenli ödeme sistemi ile Türkiye&apos;nin en kapsamlı kiralama platformu.</p>

          {/* Category cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            {(["house", "car", "motorcycle", "boat"] as Category[]).map((cat) => (
              <Link key={cat} href={`/${cat === "house" ? "evler" : cat === "car" ? "arabalar" : cat === "motorcycle" ? "motorlar" : "tekneler"}`}>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all cursor-pointer group">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 group-hover:stroke-[#FFE800] transition-colors">
                    <path d={categoryIcons[cat]} />
                  </svg>
                  <div className="text-white text-[15px] font-semibold">{categoryLabels[cat]}</div>
                  <div className="text-gray-400 text-[12px] mt-0.5">{listings.filter((l) => l.category === cat).length} ilan</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter tabs */}
      <div className="border-b border-[#ebebeb] sticky top-[92px] z-40 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-6 overflow-x-auto scrollbar-hide py-3">
          <button onClick={() => setActiveCategory("all")} className={`text-[13px] font-medium pb-1 border-b-2 transition-all shrink-0 ${activeCategory === "all" ? "border-airbnb-hof text-airbnb-hof" : "border-transparent text-airbnb-foggy hover:text-airbnb-hof"}`}>
            Tümü
          </button>
          {(["house", "car", "motorcycle", "boat"] as Category[]).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex items-center gap-1.5 text-[13px] font-medium pb-1 border-b-2 transition-all shrink-0 ${activeCategory === cat ? "border-airbnb-hof text-airbnb-hof" : "border-transparent text-airbnb-foggy hover:text-airbnb-hof"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={categoryIcons[cat]} /></svg>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Listings grid */}
      <main className="max-w-[1280px] mx-auto px-4 py-8 w-full flex-1">
        {/* Commission info banner */}
        <div className="bg-[#FFF8D6] border border-[#f0e68c] rounded-lg p-3 mb-6 flex items-center gap-3 text-[13px]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span className="text-[#666]">RentHub üzerinden yapılan tüm kiralamalarda sadece <strong className="text-airbnb-hof">%3 komisyon</strong> alınır. Ödeme güvende tutulur, çıkış tarihinde satıcıya aktarılır.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-airbnb-foggy">Bu kategoride henüz ilan bulunmuyor.</div>
        )}

        {/* How it works */}
        <div className="mt-16 mb-8">
          <h2 className="text-[22px] font-bold text-airbnb-hof text-center mb-8">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Keşfet & Tarih Seç", desc: "İlanları inceleyin, uygun tarih aralığını seçin.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { title: "Güvenli Ödeme Yap", desc: "Ödeme RentHub güvencesinde tutulur. Çıkış tarihine kadar paranız güvende.", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              { title: "Keyfini Çıkarın", desc: "Çıkış tarihinde %3 komisyon düşülerek %97'si ev sahibine aktarılır.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-[#FFF0F3] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                </div>
                <h3 className="text-[16px] font-semibold text-airbnb-hof mb-1">{item.title}</h3>
                <p className="text-[13px] text-airbnb-foggy">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
