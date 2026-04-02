"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PropertyCard from "../../components/PropertyCard";
import { properties, formatPrice } from "../../data/properties";

export default function PropertyDetailPage() {
  const params = useParams();
  const property = properties.find((p) => p.id === params.id);
  const [currentImage, setCurrentImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h1>
            <p className="text-gray-500 mb-4">Aradığınız ilan mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/" className="btn-primary inline-block">Ana Sayfaya Dön</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isDaily = property.type === "daily";
  const typeLabel = property.type === "sale" ? "Satılık" : property.type === "daily" ? "Günlük Kiralık" : "Kiralık";

  const featureList = [
    { label: "Oda", value: property.features.rooms },
    { label: "Banyo", value: property.features.bathrooms },
    { label: "Alan", value: `${property.features.area} m²` },
    property.features.floor ? { label: "Kat", value: `${property.features.floor}/${property.features.totalFloors}` } : null,
    property.features.buildingAge !== undefined ? { label: "Bina Yaşı", value: property.features.buildingAge === 0 ? "Sıfır" : `${property.features.buildingAge} yıl` } : null,
    { label: "Isıtma", value: property.features.heating },
  ].filter(Boolean);

  const amenities = [
    { key: "furnished", label: "Eşyalı", icon: "M4 20h16M4 16h16V8H4v8z" },
    { key: "balcony", label: "Balkon", icon: "M3 9h18v12H3V9zM3 9l9-6 9 6" },
    { key: "parking", label: "Otopark", icon: "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm4 4v10M9 7h4a3 3 0 010 6H9" },
    { key: "elevator", label: "Asansör", icon: "M3 3h18v18H3V3zm6 12l3-4 3 4M12 7v8" },
    { key: "pool", label: "Havuz", icon: "M2 12h2c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2h2M2 18h2c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2h2" },
    { key: "garden", label: "Bahçe", icon: "M12 22V8M9 12c-3 0-6-2-6-5.5S6 1 12 5.5C18 1 21 3 21 6.5S18 12 15 12" },
    { key: "security", label: "Güvenlik", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { key: "airConditioning", label: "Klima", icon: "M12 3v18M3 12h18M5.5 5.5l13 13M5.5 18.5l13-13" },
    { key: "wifi", label: "Wi-Fi", icon: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" },
    { key: "kitchen", label: "Mutfak", icon: "M3 3h18v18H3V3zM12 3v18" },
    { key: "washer", label: "Çamaşır Mak.", icon: "M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm8 5a5 5 0 100 10 5 5 0 000-10z" },
    { key: "tv", label: "TV", icon: "M2 7h20v13H2V7zM12 20v3M7 23h10" },
  ];

  const activeAmenities = amenities.filter((a) => (property.features as Record<string, unknown>)[a.key]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <Link href={property.type === "sale" ? "/satilik" : "/kiralik"} className="hover:text-primary">{typeLabel}</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="text-gray-900 line-clamp-1">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm">
              {property.rating && (
                <div className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-500">({property.reviewCount} değerlendirme)</span>
                </div>
              )}
              {property.host?.isSuperHost && <span className="badge-superhost">Süper Ev Sahibi</span>}
              <span className="text-gray-500 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {property.location.city}, {property.location.district}
                {property.location.neighborhood && `, ${property.location.neighborhood}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="btn-outline !py-2 !px-4 flex items-center gap-2 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
              Paylaş
            </button>
            <button className="btn-outline !py-2 !px-4 flex items-center gap-2 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              Kaydet
            </button>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-8">
          <div className="relative aspect-[4/3] md:aspect-auto md:row-span-2 cursor-pointer" onClick={() => setShowAllPhotos(true)}>
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
          </div>
          {property.images.slice(1, 3).map((img, i) => (
            <div key={i} className="relative aspect-[4/3] hidden md:block cursor-pointer" onClick={() => { setCurrentImage(i + 1); setShowAllPhotos(true); }}>
              <img src={img} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
              {i === 1 && (
                <button onClick={(e) => { e.stopPropagation(); setShowAllPhotos(true); }} className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                  Tüm Fotoğraflar ({property.images.length})
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2">
            {/* Host info for daily rentals */}
            {isDaily && property.host && (
              <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Ev sahibi: {property.host.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {property.features.rooms} oda · {property.features.bathrooms} banyo · {property.features.area} m²
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                  {property.host.avatar}
                </div>
              </div>
            )}

            {/* Key features for sale */}
            {!isDaily && (
              <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-200 mb-6">
                {featureList.map((f) => f && (
                  <div key={f.label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{f.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{f.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">İlan Açıklaması</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Özellikler</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {activeAmenities.map((a) => (
                  <div key={a.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={a.icon} />
                    </svg>
                    <span className="text-sm text-gray-700">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily rental specific info */}
            {isDaily && property.dates && (
              <div className="pb-6 border-b border-gray-200 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Konaklama Bilgileri</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">Giriş</div>
                    <div className="font-semibold">{property.dates.checkIn}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">Çıkış</div>
                    <div className="font-semibold">{property.dates.checkOut}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">Min. Konaklama</div>
                    <div className="font-semibold">{property.dates.minStay} gece</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500">Max. Konaklama</div>
                    <div className="font-semibold">{property.dates.maxStay} gece</div>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="font-medium">{property.location.city}, {property.location.district}</p>
                  {property.location.neighborhood && <p className="text-sm">{property.location.neighborhood}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - Booking/Contact card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(property.price, property.currency)}</span>
                  {isDaily && <span className="text-gray-500">/ gece</span>}
                </div>
                {property.rating && (
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span className="font-semibold">{property.rating}</span>
                    <span className="text-gray-500">· {property.reviewCount} değerlendirme</span>
                  </div>
                )}
              </div>

              {/* Daily rental booking form */}
              {isDaily ? (
                <>
                  <div className="border border-gray-300 rounded-xl overflow-hidden mb-4">
                    <div className="grid grid-cols-2">
                      <div className="p-3 border-r border-b border-gray-300">
                        <label className="block text-[10px] font-semibold uppercase text-gray-600">Giriş</label>
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full text-sm border-none p-0 mt-1" />
                      </div>
                      <div className="p-3 border-b border-gray-300">
                        <label className="block text-[10px] font-semibold uppercase text-gray-600">Çıkış</label>
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full text-sm border-none p-0 mt-1" />
                      </div>
                    </div>
                    <div className="p-3">
                      <label className="block text-[10px] font-semibold uppercase text-gray-600">Misafir</label>
                      <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full text-sm border-none p-0 mt-1 cursor-pointer">
                        {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} misafir</option>)}
                      </select>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
                    Rezervasyon Yap
                  </button>

                  {checkIn && checkOut && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>{formatPrice(property.price)} x {Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))} gece</span>
                        <span>{formatPrice(property.price * Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)))}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Temizlik ücreti</span>
                        <span>{formatPrice(1500)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Hizmet bedeli</span>
                        <span>{formatPrice(Math.round(property.price * 0.12))}</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>Toplam</span>
                        <span>{formatPrice(property.price * Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) + 1500 + Math.round(property.price * 0.12))}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Sale/Rent contact form */}
                  <div className="space-y-3 mb-4">
                    <input type="text" placeholder="Adınız Soyadınız" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                    <input type="tel" placeholder="Telefon Numaranız" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                    <textarea placeholder="Mesajınız..." rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none" defaultValue="Bu ilan hakkında bilgi almak istiyorum." />
                  </div>

                  <button className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity mb-3">
                    Mesaj Gönder
                  </button>

                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full border-2 border-success text-success py-3 rounded-xl font-semibold hover:bg-success hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    {showPhone ? "0532 XXX XX XX" : "Telefonu Göster"}
                  </button>
                </>
              )}

              {/* Host info */}
              {property.host && (
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {property.host.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{property.host.name}</div>
                      <div className="text-xs text-gray-500">{property.host.memberSince}&apos;den beri üye</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Yanıt oranı: %{property.host.responseRate}</span>
                    {property.host.isSuperHost && <span className="text-primary font-semibold">Süper Ev Sahibi</span>}
                  </div>
                </div>
              )}

              {/* Report */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-xs text-gray-500 underline hover:text-gray-700">Bu ilanı şikayet et</button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Benzer İlanlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties
              .filter((p) => p.id !== property.id && p.type === property.type)
              .slice(0, 4)
              .map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
          </div>
        </div>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setShowAllPhotos(false)} className="text-white flex items-center gap-2 hover:opacity-80">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              Geri
            </button>
            <span className="text-white text-sm">{currentImage + 1} / {property.images.length}</span>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <button onClick={() => setCurrentImage((currentImage - 1 + property.images.length) % property.images.length)} className="p-2 text-white hover:opacity-80 shrink-0">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <img src={property.images[currentImage]} alt="" className="max-h-[80vh] max-w-full object-contain rounded-lg" />
            <button onClick={() => setCurrentImage((currentImage + 1) % property.images.length)} className="p-2 text-white hover:opacity-80 shrink-0">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
