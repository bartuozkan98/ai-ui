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
      <div className="min-h-screen flex flex-col"><Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-airbnb-hof mb-2">Giriş yapmalısınız</h1>
            <Link href="/giris" className="bg-airbnb-rausch text-white px-6 py-2.5 rounded-lg font-semibold inline-block mt-2">Giriş Yap</Link>
          </div>
        </div>
      <Footer /></div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-airbnb-foggy">Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-sahi-bg">
      <Header />
      <div className="max-w-[960px] mx-auto px-4 py-8 w-full flex-1">
        <h1 className="text-[22px] font-bold text-airbnb-hof mb-1">Hesabım</h1>
        <p className="text-[14px] text-airbnb-foggy mb-6">Hoş geldin, {user?.name}</p>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#e0e0e0] mb-6">
          {[
            { key: "rentals" as const, label: "Kiralarım", count: myRentals.length },
            { key: "listings" as const, label: "İlanlarım", count: myListings.length },
            { key: "profile" as const, label: "Profil" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-all ${tab === t.key ? "border-airbnb-rausch text-airbnb-rausch" : "border-transparent text-airbnb-foggy hover:text-airbnb-hof"}`}>
              {t.label} {t.count !== undefined && <span className="ml-1 text-[12px] bg-[#f0f0f0] px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Rentals tab */}
        {tab === "rentals" && (
          <div>
            {myRentals.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#ddd] p-8 text-center">
                <p className="text-[14px] text-airbnb-foggy mb-3">Henüz bir kiralama yapmadınız.</p>
                <Link href="/" className="text-airbnb-rausch font-semibold underline">İlanları keşfet</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myRentals.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl border border-[#ddd] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/ilan/${b.listingId}`} className="text-[15px] font-semibold text-airbnb-hof hover:underline">{b.listingTitle}</Link>
                        <div className="text-[13px] text-airbnb-foggy mt-1">
                          <span className="bg-[#f0f0f0] px-2 py-0.5 rounded text-[11px] font-medium mr-2">{categoryLabels[b.category]}</span>
                          {b.startDate} → {b.endDate} · {b.totalDays} gün
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-bold text-airbnb-hof">{formatPrice(b.totalPrice)}</div>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                          {b.status === "confirmed" ? "Onaylandı" : b.status === "completed" ? "Tamamlandı" : b.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-[12px] text-green-700 bg-green-50 rounded p-2">
                      Ödemeniz çıkış tarihine kadar RentHub güvencesindedir.
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Earnings section for owners */}
            {myEarnings.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[16px] font-semibold text-airbnb-hof mb-3">Kazançlarım (Kiraya Veren Olarak)</h2>
                <div className="bg-white rounded-xl border border-[#ddd] p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-[20px] font-bold text-airbnb-hof">{myEarnings.length}</div>
                      <div className="text-[12px] text-airbnb-foggy">Toplam Kiralama</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[20px] font-bold text-green-600">{formatPrice(myEarnings.reduce((s, b) => s + b.netPayout, 0))}</div>
                      <div className="text-[12px] text-airbnb-foggy">Net Kazanç</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[20px] font-bold text-airbnb-rausch">{formatPrice(myEarnings.reduce((s, b) => s + b.commission, 0))}</div>
                      <div className="text-[12px] text-airbnb-foggy">Komisyon (%3)</div>
                    </div>
                  </div>
                  {myEarnings.map((b) => (
                    <div key={b.id} className="flex justify-between items-center py-2 border-t border-[#f0f0f0] text-[13px]">
                      <span className="text-airbnb-hof">{b.listingTitle}</span>
                      <span className="text-airbnb-foggy">{b.startDate} → {b.endDate}</span>
                      <span className="font-semibold text-green-600">{formatPrice(b.netPayout)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings tab */}
        {tab === "listings" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] text-airbnb-foggy">{myListings.length} ilan</span>
              <Link href="/ilan-ver" className="bg-airbnb-rausch text-white px-4 py-2 rounded-lg text-[13px] font-semibold">+ Yeni İlan</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#ddd] p-8 text-center">
                <p className="text-[14px] text-airbnb-foggy mb-3">Henüz ilan oluşturmadınız.</p>
                <Link href="/ilan-ver" className="text-airbnb-rausch font-semibold underline">İlk ilanınızı oluşturun</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((l) => (
                  <Link key={l.id} href={`/ilan/${l.id}`}>
                    <div className="bg-white rounded-xl border border-[#ddd] p-4 flex gap-4 hover:shadow-md transition-shadow">
                      <img src={l.images[0]} alt="" className="w-24 h-20 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-airbnb-hof line-clamp-1">{l.title}</h3>
                        <div className="text-[12px] text-airbnb-foggy mt-0.5">
                          <span className="bg-[#f0f0f0] px-2 py-0.5 rounded text-[11px] font-medium mr-2">{categoryLabels[l.category]}</span>
                          {l.location.city}, {l.location.district}
                        </div>
                        <div className="text-[14px] font-bold text-airbnb-hof mt-1">{formatPrice(l.pricePerDay)} / gün</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="bg-white rounded-xl border border-[#ddd] p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Ad Soyad</label>
                <input type="text" value={user?.name || ""} readOnly className="w-full border border-[#ddd] rounded-lg px-4 py-2.5 text-[14px] bg-[#f7f7f7]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-airbnb-hof mb-1">E-posta</label>
                <input type="email" value={user?.email || ""} readOnly className="w-full border border-[#ddd] rounded-lg px-4 py-2.5 text-[14px] bg-[#f7f7f7]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Telefon</label>
                <input type="tel" value={user?.phone || ""} readOnly className="w-full border border-[#ddd] rounded-lg px-4 py-2.5 text-[14px] bg-[#f7f7f7]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Banka IBAN (Kazanç Ödemeleri İçin)</label>
                <input type="text" value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="TR00 0000 0000 0000 0000 0000 00" className="w-full border border-[#ddd] rounded-lg px-4 py-2.5 text-[14px]" />
                <p className="text-[11px] text-airbnb-foggy mt-1">Çıkış tarihinde %3 komisyon düşüldükten sonra kalan tutar bu IBAN&apos;a aktarılır.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
