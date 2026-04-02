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

  const featuredSale = properties.filter((p) => p.type === "sale").slice(0, 4);
  const featuredDaily = properties.filter((p) => p.type === "daily").slice(0, 4);
  const popularProperties = [...properties].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Hayalindeki Evi<br />
              <span className="gradient-text">Bul, Sat veya Kirala</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Türkiye&apos;nin en kapsamlı emlak platformu. Satılık, kiralık ve günlük kiralık binlerce ilan.
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <SearchBar variant="hero" />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { number: "150K+", label: "Aktif İlan" },
              { number: "50K+", label: "Mutlu Müşteri" },
              { number: "81", label: "İl" },
              { number: "7/24", label: "Destek" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Bar - Airbnb style */}
      <CategoryBar onSelect={setActiveCategory} />

      {/* Popular Listings Section */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">En Çok İlgi Gören İlanlar</h2>
            <p className="text-gray-500 text-sm mt-1">Bu hafta en çok görüntülenen ilanlar</p>
          </div>
          <Link href="/satilik" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            Tümünü Gör
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Satılık Section - Sahibinden style */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Satılık Emlak</h2>
              <p className="text-gray-500 text-sm mt-1">Yatırımlık ve oturumlu satılık konutlar</p>
            </div>
            <Link href="/satilik" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
              Tümünü Gör
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSale.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner - Sahibinden style yellow CTA */}
      <section className="banner-yellow">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Evinizi Satmak veya Kiralamak mı İstiyorsunuz?</h3>
            <p className="text-gray-800 mt-1">Ücretsiz ilan verin, binlerce potansiyel alıcıya ulaşın.</p>
          </div>
          <Link href="/ilan-ver" className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shrink-0">
            Hemen İlan Ver
          </Link>
        </div>
      </section>

      {/* Günlük Kiralık Section - Airbnb style */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Günlük Kiralık</h2>
            <p className="text-gray-500 text-sm mt-1">Tatil ve kısa süreli konaklama için özel evler</p>
          </div>
          <Link href="/kiralik?type=daily" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            Tümünü Gör
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDaily.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Ara & Keşfet",
                desc: "Binlerce ilan arasından size en uygun evi bulun. Filtreler ile aradığınızı kolayca daraltın.",
                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
              },
              {
                step: "2",
                title: "İncele & İletişime Geç",
                desc: "İlan detaylarını inceleyin, fotoğrafları görüntüleyin ve ev sahibiyle güvenle iletişime geçin.",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              },
              {
                step: "3",
                title: "Satın Al veya Kirala",
                desc: "Güvenli ödeme sistemi ile evinizi satın alın veya kiralayın. 7/24 destek ekibimiz yanınızda.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Popüler Şehirler</h2>
        <p className="text-gray-500 text-center mb-8">Türkiye&apos;nin en çok tercih edilen lokasyonları</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { city: "İstanbul", count: "45.230", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
            { city: "Antalya", count: "18.450", img: "https://images.unsplash.com/photo-1593238739364-18cfde865990?w=400" },
            { city: "İzmir", count: "12.800", img: "https://images.unsplash.com/photo-1590846083693-f23fdede3a7e?w=400" },
            { city: "Muğla", count: "9.650", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400" },
            { city: "Ankara", count: "8.200", img: "https://images.unsplash.com/photo-1569922143706-43a0066fab69?w=400" },
            { city: "Bursa", count: "5.100", img: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400" },
          ].map((item) => (
            <Link key={item.city} href={`/satilik?city=${encodeURIComponent(item.city)}`}>
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer">
                <img src={item.img} alt={item.city} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg">{item.city}</h3>
                  <p className="text-sm text-gray-200">{item.count} ilan</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* App download CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">EmlakJet Uygulamasını İndirin</h2>
            <p className="text-gray-400 max-w-md">
              Anlık bildirimlerle yeni ilanlardan haberdar olun, favori ilanlarınızı kaydedin ve ev sahipleriyle mesajlaşın.
            </p>
            <div className="flex gap-3 mt-6">
              <button className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5S3 21.33 3 20.5zM16.5 12L8 7v10l8.5-5z"/></svg>
                Google Play
              </button>
              <button className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </button>
            </div>
          </div>
          <div className="w-64 h-48 bg-gray-800 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff385c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span className="text-gray-500 text-sm">Mobil Uygulama</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
