"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import PropertyCard from "./components/PropertyCard";
import CategoryBar from "./components/CategoryBar";
import { properties } from "./data/properties";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");

  const saleProperties = properties.filter((p) => p.type === "sale");
  const dailyProperties = properties.filter((p) => p.type === "daily");
  const popularProperties = [...properties].sort((a, b) => b.views - a.views).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Airbnb-style search hero */}
      <section className="bg-white pt-8 pb-6 border-b border-[#ebebeb]">
        <div className="max-w-[1280px] mx-auto px-4">
          <SearchBar />
        </div>
      </section>

      {/* Airbnb category bar */}
      <CategoryBar onSelect={setActiveCategory} />

      {/* Main content */}
      <main className="max-w-[1280px] mx-auto px-4 py-6 w-full">

        {/* Airbnb-style grid - Popular */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {popularProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Sahibinden-style section divider */}
        <div className="mt-12 mb-6 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-[#e0e0e0]" />
          <h2 className="text-[18px] font-bold text-airbnb-hof">Satılık Konut İlanları</h2>
          <div className="h-[1px] flex-1 bg-[#e0e0e0]" />
        </div>

        {/* Sahibinden-style yellow banner */}
        <div className="bg-[#FFF8D6] border border-[#f0e68c] rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sahi-yellow rounded-full flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#333]">Evinizi satmak mı istiyorsunuz?</p>
              <p className="text-[12px] text-[#666]">Ücretsiz ilan verin, binlerce alıcıya ulaşın.</p>
            </div>
          </div>
          <Link href="/ilan-ver" className="bg-sahi-blue hover:bg-sahi-blue-dark text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors shrink-0">
            Hemen İlan Ver
          </Link>
        </div>

        {/* Sale listings - Airbnb grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {saleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/satilik" className="inline-block text-[14px] font-semibold text-airbnb-hof underline hover:text-airbnb-foggy transition-colors">
            Tüm satılık ilanları göster &rarr;
          </Link>
        </div>

        {/* Section divider */}
        <div className="mt-12 mb-6 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-[#e0e0e0]" />
          <h2 className="text-[18px] font-bold text-airbnb-hof">Günlük Kiralık</h2>
          <div className="h-[1px] flex-1 bg-[#e0e0e0]" />
        </div>

        {/* Daily rental listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {dailyProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/kiralik?type=daily" className="inline-block text-[14px] font-semibold text-airbnb-hof underline hover:text-airbnb-foggy transition-colors">
            Tüm günlük kiralık ilanları göster &rarr;
          </Link>
        </div>

        {/* Popular cities - Sahibinden style */}
        <div className="mt-12 mb-6">
          <h2 className="text-[18px] font-bold text-airbnb-hof mb-4">Popüler Lokasyonlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { city: "İstanbul", count: "45.230 ilan", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
              { city: "Antalya", count: "18.450 ilan", img: "https://images.unsplash.com/photo-1593238739364-18cfde865990?w=400" },
              { city: "İzmir", count: "12.800 ilan", img: "https://images.unsplash.com/photo-1590846083693-f23fdede3a7e?w=400" },
              { city: "Muğla", count: "9.650 ilan", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400" },
              { city: "Ankara", count: "8.200 ilan", img: "https://images.unsplash.com/photo-1569922143706-43a0066fab69?w=400" },
              { city: "Bursa", count: "5.100 ilan", img: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400" },
            ].map((item) => (
              <Link key={item.city} href={`/satilik?city=${encodeURIComponent(item.city)}`}>
                <div className="relative rounded-[12px] overflow-hidden aspect-[3/4] group cursor-pointer">
                  <img src={item.img} alt={item.city} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-semibold text-[15px]">{item.city}</h3>
                    <p className="text-white/80 text-[12px]">{item.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
