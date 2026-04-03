"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top dark bar */}
      <div className="bg-[#1a1a27] text-white text-[12px]">
        <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center h-[32px]">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Güvenli Kiralama Platformu</span>
            <span className="text-gray-600">|</span>
            <span className="text-[#FFE800] text-[11px]">%3 Komisyon ile Kirala & Kiraya Ver</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-gray-300">Hoş geldin, <span className="text-[#FFE800]">{user.name.split(" ")[0]}</span></span>
            ) : (
              <>
                <Link href="/giris" className="hover:text-[#FFE800] transition-colors">Giriş Yap</Link>
                <span className="text-gray-600">|</span>
                <Link href="/kayit" className="hover:text-[#FFE800] transition-colors">Kayıt Ol</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-[#e0e0e0] shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-airbnb-rausch text-white px-3 py-1.5 rounded-lg font-bold text-[18px]">
              RentHub
            </div>
          </Link>

          {/* Category nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/evler", label: "Evler", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
              { href: "/arabalar", label: "Arabalar", icon: "M5 17h14M5 17a2 2 0 0 1-2-2v-4l2-5h10l2 5v4a2 2 0 0 1-2 2" },
              { href: "/motorlar", label: "Motorlar", icon: "M5 16a2 2 0 1 0 4 0M15 16a2 2 0 1 0 4 0M7 16h8" },
              { href: "/tekneler", label: "Tekneler", icon: "M2 20l2-3c2-2 4-2 6 0s4 2 6 0l2 3M4 17V9l8-5 8 5v8" },
            ].map((cat) => (
              <Link key={cat.href} href={cat.href} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium text-[#333] hover:bg-[#f5f5f5] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon} /></svg>
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/ilan-ver" className="hidden sm:flex items-center gap-1.5 bg-airbnb-rausch hover:bg-airbnb-rausch-dark text-white text-[13px] font-semibold px-4 py-2 rounded-full transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                İlan Ver
              </Link>
            )}

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 pl-3 border border-[#ddd] rounded-full hover:shadow-md transition-shadow bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${user ? "bg-airbnb-rausch text-white" : "bg-gray-400 text-white"}`}>
                  {user ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-[#ddd] py-1 animate-fadeIn z-50" style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.28)" }}>
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-[#f0f0f0]">
                        <div className="text-[13px] font-semibold text-airbnb-hof">{user.name}</div>
                        <div className="text-[11px] text-airbnb-foggy">{user.email}</div>
                      </div>
                      <Link href="/hesabim" className="block px-4 py-2.5 text-[13px] text-airbnb-hof hover:bg-[#f7f7f7]" onClick={() => setProfileOpen(false)}>Hesabım</Link>
                      <Link href="/ilan-ver" className="block px-4 py-2.5 text-[13px] text-airbnb-hof hover:bg-[#f7f7f7]" onClick={() => setProfileOpen(false)}>İlan Ver</Link>
                      <hr className="my-1 border-[#f0f0f0]" />
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="block w-full text-left px-4 py-2.5 text-[13px] text-airbnb-hof hover:bg-[#f7f7f7]">Çıkış Yap</button>
                    </>
                  ) : (
                    <>
                      <Link href="/giris" className="block px-4 py-2.5 text-[13px] font-semibold text-airbnb-hof hover:bg-[#f7f7f7]" onClick={() => setProfileOpen(false)}>Giriş Yap</Link>
                      <Link href="/kayit" className="block px-4 py-2.5 text-[13px] text-airbnb-hof hover:bg-[#f7f7f7]" onClick={() => setProfileOpen(false)}>Kayıt Ol</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-[#f5f5f5] rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-[#e0e0e0] animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            {[
              { href: "/evler", label: "Evler" },
              { href: "/arabalar", label: "Arabalar" },
              { href: "/motorlar", label: "Motorlar" },
              { href: "/tekneler", label: "Tekneler" },
            ].map((cat) => (
              <Link key={cat.href} href={cat.href} className="block px-3 py-2.5 text-[14px] text-[#333] hover:bg-[#f5f5f5] rounded-lg" onClick={() => setMenuOpen(false)}>{cat.label}</Link>
            ))}
            {user ? (
              <>
                <Link href="/ilan-ver" className="block px-3 py-2.5 text-[14px] text-airbnb-rausch font-semibold" onClick={() => setMenuOpen(false)}>İlan Ver</Link>
                <Link href="/hesabim" className="block px-3 py-2.5 text-[14px] text-[#333]" onClick={() => setMenuOpen(false)}>Hesabım</Link>
              </>
            ) : (
              <Link href="/giris" className="block px-3 py-2.5 text-[14px] text-airbnb-rausch font-semibold" onClick={() => setMenuOpen(false)}>Giriş Yap / Kayıt Ol</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
