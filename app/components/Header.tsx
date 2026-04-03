"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#f0f0f0]">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="#FF385C">
              <path d="M16 1C7.7 1 1 7.7 1 16s6.7 15 15 15 15-6.7 15-15S24.3 1 16 1zm6.9 22.5c-1.4 2.3-3.6 3.7-6.2 4-.3 0-.5 0-.7 0-.3 0-.5 0-.7 0-2.6-.3-4.8-1.7-6.2-4-1.5-2.4-1.9-5.3-1.1-8 .5-1.8 1.5-3.5 2.8-4.9L16 4l5.2 6.5c1.3 1.5 2.3 3.1 2.8 4.9.8 2.8.4 5.7-1.1 8z"/>
            </svg>
            <span className="text-[#FF385C] font-bold text-[22px] hidden sm:block">RentHub</span>
          </Link>

          {/* Center - Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center bg-white border border-[#ddd] rounded-full shadow-sm hover:shadow-md transition-shadow">
              {[
                { href: "/evler", label: "Evler" },
                { href: "/arabalar", label: "Arabalar" },
                { href: "/motorlar", label: "Motorlar" },
                { href: "/tekneler", label: "Tekneler" },
              ].map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-3 text-[14px] font-medium text-airbnb-hof hover:bg-[#f7f7f7] transition-colors ${i === 0 ? "rounded-l-full" : ""} ${i === 3 ? "rounded-r-full" : "border-r border-[#ddd]"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/ilan-ver"
                className="hidden md:block text-[14px] font-semibold text-airbnb-hof hover:bg-[#f7f7f7] px-4 py-3 rounded-full transition-colors"
              >
                Kiraya ver
              </Link>
            )}

            {/* Profile menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-[5px] pl-3 border border-[#ddd] rounded-full hover:shadow-md transition-shadow bg-white"
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M4 8h24M4 16h24M4 24h24" />
                </svg>
                <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-semibold ${user ? "bg-airbnb-hof text-white" : "bg-[#717171] text-white"}`}>
                  {user ? user.name.charAt(0).toUpperCase() : (
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="white">
                      <path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 1 1 13 0 6.51 6.51 0 0 1-3.02 5.5 12.42 12.42 0 0 1 6.45 4.4A12.67 12.67 0 0 1 16 28.7z"/>
                    </svg>
                  )}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[52px] w-[240px] bg-white rounded-xl py-2 animate-fadeIn z-50" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#f0f0f0]">
                        <div className="text-[14px] font-semibold">{user.name}</div>
                        <div className="text-[12px] text-airbnb-foggy">{user.email}</div>
                      </div>
                      <Link href="/hesabim" className="block px-4 py-3 text-[14px] hover:bg-[#f7f7f7] transition-colors" onClick={() => setProfileOpen(false)}>Hesabim</Link>
                      <Link href="/ilan-ver" className="block px-4 py-3 text-[14px] hover:bg-[#f7f7f7] transition-colors" onClick={() => setProfileOpen(false)}>Kiraya ver</Link>
                      <hr className="my-1 border-[#f0f0f0]" />
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="block w-full text-left px-4 py-3 text-[14px] hover:bg-[#f7f7f7] transition-colors">Cikis Yap</button>
                    </>
                  ) : (
                    <>
                      <Link href="/kayit" className="block px-4 py-3 text-[14px] font-semibold hover:bg-[#f7f7f7] transition-colors" onClick={() => setProfileOpen(false)}>Kayit Ol</Link>
                      <Link href="/giris" className="block px-4 py-3 text-[14px] hover:bg-[#f7f7f7] transition-colors" onClick={() => setProfileOpen(false)}>Giris Yap</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile category bar */}
      <div className="lg:hidden border-t border-[#f0f0f0]">
        <div className="flex items-center justify-around px-2">
          {[
            { href: "/evler", label: "Evler", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
            { href: "/arabalar", label: "Arabalar", icon: "M19 17H5m14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3 13l2-6h14l2 6" },
            { href: "/motorlar", label: "Motorlar", icon: "M5 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm8 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM8 16h5" },
            { href: "/tekneler", label: "Tekneler", icon: "M2 20l2-3c2-2 4-2 6 0s4 2 6 0l2 3M4 17V9l8-5 8 5v8" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center py-3 px-3 text-airbnb-foggy hover:text-airbnb-hof transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
