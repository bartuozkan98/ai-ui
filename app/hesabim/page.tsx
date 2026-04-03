"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getListings, getBookings, Listing, Booking, formatPrice, categoryLabels } from "../data/properties";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"rentals" | "listings" | "profile">("rentals");
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myRentals, setMyRentals] = useState<Booking[]>([]);
  const [myEarnings, setMyEarnings] = useState<Booking[]>([]);
  const [bankIban, setBankIban] = useState("");

  useEffect(() => {
    if (!user) return;
    const allListings = getListings();
    const allBookings = getBookings();
    setMyListings(allListings.filter((l) => l.userId === user.id));
    setMyRentals(allBookings.filter((b) => b.renterId === user.id));
    setMyEarnings(allBookings.filter((b) => b.ownerId === user.id));
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-white"><Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-[22px] font-semibold text-airbnb-hof mb-4">Giris yapin</h1>
            <Link href="/giris" className="bg-airbnb-rausch text-white px-8 py-3 rounded-xl font-semibold inline-block">Giris Yap</Link>
          </div>
        </div>
      <Footer /></div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-airbnb-foggy">Yukleniyor...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-10 w-full flex-1">
        <h1 className="text-[32px] font-semibold text-airbnb-hof">Hesabim</h1>
        <p className="text-[18px] text-airbnb-foggy mt-1 mb-8">{user?.name} · {user?.email}</p>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#ebebeb] mb-8">
          {[
            { key: "rentals" as const, label: "Kiralarim" },
            { key: "listings" as const, label: "Ilanlarim" },
            { key: "profile" as const, label: "Profil" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`pb-4 text-[16px] font-medium border-b-2 transition-all ${tab === t.key ? "border-airbnb-hof text-airbnb-hof" : "border-transparent text-airbnb-foggy hover:text-airbnb-hof"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Rentals */}
        {tab === "rentals" && (
          <div className="animate-fadeIn">
            {myRentals.length === 0 ? (
              <div className="text-center py-16">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1" className="mx-auto mb-4"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>
                <p className="text-[18px] font-semibold text-airbnb-hof mb-1">Henuz kiralama yapmadiniz</p>
                <p className="text-[14px] text-airbnb-foggy mb-6">Ilanlari kesfedip ilk kiralamanizi yapin</p>
                <Link href="/" className="bg-airbnb-rausch text-white px-6 py-3 rounded-xl font-semibold inline-block">Kesfet</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myRentals.map((b) => (
                  <div key={b.id} className="border border-[#ebebeb] rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/ilan/${b.listingId}`} className="text-[16px] font-semibold text-airbnb-hof hover:underline">{b.listingTitle}</Link>
                        <div className="flex items-center gap-2 mt-2 text-[14px] text-airbnb-foggy">
                          <span className="bg-[#f7f7f7] px-3 py-1 rounded-full text-[12px] font-medium text-airbnb-hof">{categoryLabels[b.category]}</span>
                          <span>{b.startDate} &rarr; {b.endDate}</span>
                          <span>·</span>
                          <span>{b.totalDays} gun</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[18px] font-semibold">{formatPrice(b.totalPrice)}</div>
                        <span className={`text-[12px] font-medium px-3 py-1 rounded-full inline-block mt-1 ${b.status === "confirmed" ? "bg-[#f0fff4] text-[#008A05]" : "bg-[#f7f7f7] text-airbnb-foggy"}`}>
                          {b.status === "confirmed" ? "Onaylandi" : b.status === "completed" ? "Tamamlandi" : b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {myEarnings.length > 0 && (
              <div className="mt-12">
                <h2 className="text-[22px] font-semibold text-airbnb-hof mb-6">Kazanclarim</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="border border-[#ebebeb] rounded-xl p-5 text-center">
                    <div className="text-[28px] font-semibold text-airbnb-hof">{myEarnings.length}</div>
                    <div className="text-[14px] text-airbnb-foggy mt-1">Kiralama</div>
                  </div>
                  <div className="border border-[#ebebeb] rounded-xl p-5 text-center">
                    <div className="text-[28px] font-semibold text-[#008A05]">{formatPrice(myEarnings.reduce((s, b) => s + b.netPayout, 0))}</div>
                    <div className="text-[14px] text-airbnb-foggy mt-1">Net Kazanc</div>
                  </div>
                  <div className="border border-[#ebebeb] rounded-xl p-5 text-center">
                    <div className="text-[28px] font-semibold text-airbnb-foggy">{formatPrice(myEarnings.reduce((s, b) => s + b.commission, 0))}</div>
                    <div className="text-[14px] text-airbnb-foggy mt-1">Komisyon</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings */}
        {tab === "listings" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[16px] text-airbnb-foggy">{myListings.length} ilan</span>
              <Link href="/ilan-ver" className="bg-airbnb-rausch text-white px-5 py-3 rounded-xl text-[14px] font-semibold hover:bg-airbnb-rausch-dark transition-colors">Yeni Ilan</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[18px] font-semibold text-airbnb-hof mb-1">Henuz ilan olusturmadiniz</p>
                <p className="text-[14px] text-airbnb-foggy mb-6">Ilk ilaninizi olusturun ve kiraya verin</p>
                <Link href="/ilan-ver" className="bg-airbnb-hof text-white px-6 py-3 rounded-xl font-semibold inline-block">Ilan Olustur</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((l) => (
                  <Link key={l.id} href={`/ilan/${l.id}`}>
                    <div className="border border-[#ebebeb] rounded-xl p-4 flex gap-5 hover:shadow-md transition-shadow">
                      <img src={l.images[0]} alt="" className="w-28 h-24 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[16px] font-semibold text-airbnb-hof line-clamp-1">{l.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[14px] text-airbnb-foggy">
                          <span className="bg-[#f7f7f7] px-3 py-1 rounded-full text-[12px] font-medium text-airbnb-hof">{categoryLabels[l.category]}</span>
                          <span>{l.location.city}</span>
                        </div>
                        <div className="text-[16px] font-semibold text-airbnb-hof mt-2">{formatPrice(l.pricePerDay)} <span className="font-normal text-airbnb-foggy text-[14px]">/ gun</span></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === "profile" && (
          <div className="animate-fadeIn max-w-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">Ad Soyad</label>
                <input type="text" value={user?.name || ""} readOnly className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px] bg-[#f7f7f7] text-airbnb-foggy" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">E-posta</label>
                <input type="email" value={user?.email || ""} readOnly className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px] bg-[#f7f7f7] text-airbnb-foggy" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">Telefon</label>
                <input type="tel" value={user?.phone || ""} readOnly className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px] bg-[#f7f7f7] text-airbnb-foggy" />
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">Banka IBAN</label>
                <input type="text" value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px]" />
                <p className="text-[13px] text-airbnb-foggy mt-2">Kiralama kazanclariniz %3 komisyon dusuldukten sonra bu IBAN&apos;a aktarilir.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
