"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/satilik", label: "Emlak" },
  { href: "/satilik?type=apartment", label: "Satılık Daire" },
  { href: "/satilik?type=villa", label: "Satılık Villa" },
  { href: "/kiralik", label: "Kiralık" },
  { href: "/kiralik?type=daily", label: "Günlük Kiralık" },
  { href: "/ilan-ver", label: "İlan Ver" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top dark bar - Sahibinden style */}
      <div className="bg-sahi-dark text-white text-[12px]">
        <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center h-[32px]">
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-sahi-yellow transition-colors">Yardım & Destek</a>
            <span className="text-gray-500">|</span>
            <a href="#" className="hover:text-sahi-yellow transition-colors hidden sm:inline">Güvenli Alışveriş</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-sahi-yellow transition-colors hidden sm:inline">Uygulamayı İndir</a>
            <span className="text-gray-500">|</span>
            <a href="#" className="hover:text-sahi-yellow transition-colors">Giriş Yap</a>
            <span className="text-gray-500">|</span>
            <a href="#" className="hover:text-sahi-yellow transition-colors">Kayıt Ol</a>
          </div>
        </div>
      </div>

      {/* Yellow header bar - Sahibinden style */}
      <div className="sahi-header border-b border-[#d4c600]">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-[64px]">
          {/* Logo - Sahibinden style */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <div className="bg-sahi-dark text-sahi-yellow px-3 py-1.5 rounded font-bold text-lg">
              emlakjet
            </div>
            <span className="text-[11px] text-sahi-dark font-medium hidden sm:block">.com</span>
          </Link>

          {/* Search bar - Sahibinden style */}
          <div className="flex-1 max-w-[560px] mx-4 hidden md:flex items-center">
            <select className="h-[38px] px-3 border border-r-0 border-[#b8b800] rounded-l bg-white text-[13px] text-gray-700 cursor-pointer focus:ring-0 focus:border-[#b8b800]">
              <option>Tüm Kategoriler</option>
              <option>Emlak</option>
              <option>Satılık</option>
              <option>Kiralık</option>
              <option>Günlük Kiralık</option>
            </select>
            <input
              type="text"
              placeholder="Kelime, ilan no veya mağaza adı ile ara"
              className="flex-1 h-[38px] px-3 border border-[#b8b800] text-[13px] focus:ring-0 focus:border-[#b8b800]"
            />
            <button className="h-[38px] px-4 bg-sahi-blue hover:bg-sahi-blue-dark text-white rounded-r transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/ilan-ver" className="hidden sm:flex items-center gap-1.5 bg-sahi-blue hover:bg-sahi-blue-dark text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Ücretsiz İlan Ver
            </Link>

            {/* Favorites */}
            <button className="relative p-2 hover:bg-[#e6d000] rounded transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-airbnb-rausch text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>

            {/* Profile - Airbnb style pill */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-3 border border-[#b8b800] rounded-full hover:shadow-md transition-shadow bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 animate-fadeIn z-50" style={{ boxShadow: "var(--shadow-high)" }}>
                  <a href="#" className="block px-4 py-2.5 text-[14px] font-semibold text-airbnb-hof hover:bg-gray-50">Kayıt Ol</a>
                  <a href="#" className="block px-4 py-2.5 text-[14px] text-airbnb-hof hover:bg-gray-50">Giriş Yap</a>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/ilan-ver" className="block px-4 py-2.5 text-[14px] text-airbnb-hof hover:bg-gray-50">İlan Ver</Link>
                  <a href="#" className="block px-4 py-2.5 text-[14px] text-airbnb-hof hover:bg-gray-50">Favorilerim</a>
                  <hr className="my-1 border-gray-100" />
                  <a href="#" className="block px-4 py-2.5 text-[14px] text-airbnb-hof hover:bg-gray-50">Yardım</a>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-[#e6d000] rounded transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar - Sahibinden style */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-[1280px] mx-auto px-4">
          <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.href + cat.label}
                href={cat.href}
                className="px-4 py-3 text-[13px] font-medium text-[#333] hover:text-sahi-blue hover:bg-[#f5f5f5] whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-sahi-blue"
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fadeIn">
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <input type="text" placeholder="Ara..." className="flex-1 px-3 py-2.5 text-[14px] border-none" />
              <button className="px-4 py-2.5 bg-sahi-blue text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </button>
            </div>
          </div>
          <div className="px-2 pb-3">
            {categories.map((cat) => (
              <Link key={cat.href + cat.label} href={cat.href} className="block px-3 py-2.5 text-[14px] text-[#333] hover:bg-gray-50 rounded">
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
