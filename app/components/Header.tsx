"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar - Sahibinden style */}
      <div className="bg-gray-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
          <div className="flex gap-4">
            <span>Yardım & Destek</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Güvenli Alışveriş</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hidden sm:inline">Uygulamayı İndir</span>
            <span>|</span>
            <span>TR</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Emlak</span>
              <span className="text-xl font-bold text-primary">Jet</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/satilik" className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Satılık
            </Link>
            <Link href="/kiralik" className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Kiralık
            </Link>
            <Link href="/kiralik?type=daily" className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Günlük Kiralık
            </Link>
            <Link href="/satilik?type=project" className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Projeler
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/ilan-ver" className="hidden sm:flex items-center gap-2 btn-primary text-sm !py-2 !px-5 !rounded-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              İlan Ver
            </Link>

            {/* Favorites */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pl-3 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slide-in">
                  <a href="#" className="block px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50">Kayıt Ol</a>
                  <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Giriş Yap</a>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/ilan-ver" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">İlan Ver</Link>
                  <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">İlanlarım</a>
                  <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Favorilerim</a>
                  <hr className="my-1 border-gray-100" />
                  <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Yardım</a>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            <Link href="/satilik" className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Satılık</Link>
            <Link href="/kiralik" className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Kiralık</Link>
            <Link href="/kiralik?type=daily" className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Günlük Kiralık</Link>
            <Link href="/satilik?type=project" className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Projeler</Link>
            <Link href="/ilan-ver" className="block px-4 py-3 rounded-lg bg-primary text-white font-medium text-center mt-2">İlan Ver</Link>
          </div>
        </div>
      )}
    </header>
  );
}
