"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { cities, propertyTypes, roomOptions } from "../data/properties";

type ListingType = "sale" | "rent" | "daily";
type Step = 1 | 2 | 3 | 4;

export default function IlanVerPage() {
  const [step, setStep] = useState<Step>(1);
  const [listingType, setListingType] = useState<ListingType>("sale");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    city: "",
    district: "",
    neighborhood: "",
    rooms: "",
    bathrooms: "1",
    area: "",
    floor: "",
    totalFloors: "",
    buildingAge: "",
    price: "",
    heating: "",
    furnished: false,
    balcony: false,
    parking: false,
    elevator: false,
    pool: false,
    garden: false,
    security: false,
    airConditioning: false,
    wifi: false,
    kitchen: false,
    washer: false,
    tv: false,
    minStay: "1",
    maxStay: "30",
    checkIn: "14:00",
    checkOut: "11:00",
    name: "",
    phone: "",
    email: "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    { num: 1, label: "İlan Tipi" },
    { num: 2, label: "Detaylar" },
    { num: 3, label: "Özellikler" },
    { num: 4, label: "Fotoğraflar & İletişim" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ücretsiz İlan Ver</h1>
        <p className="text-gray-500 mb-8">Evinizi binlerce potansiyel alıcı ve kiracıya ulaştırın.</p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 ${
                  step > s.num ? "bg-primary border-primary text-white" :
                  step === s.num ? "border-primary text-primary" :
                  "border-gray-300 text-gray-400"
                }`}>
                  {step > s.num ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : s.num}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${step > s.num ? "bg-primary" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Listing Type */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">İlan tipini seçin</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "sale" as const, title: "Satılık", desc: "Mülkünüzü satışa çıkarın", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { key: "rent" as const, title: "Kiralık", desc: "Aylık kiralama ilanı verin", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                { key: "daily" as const, title: "Günlük Kiralık", desc: "Kısa süreli kiralama ilanı", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setListingType(type.key)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    listingType === type.key
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={listingType === type.key ? "var(--primary)" : "#666"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d={type.icon} />
                  </svg>
                  <h3 className="font-semibold text-gray-900">{type.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Emlak Tipi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => updateField("propertyType", t.value)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.propertyType === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.propertyType}
              className="mt-6 w-full btn-primary !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Devam Et
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">İlan Detayları</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Örn: Kadıköy Moda'da Deniz Manzaralı 3+1 Daire"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  placeholder="Mülkünüzü detaylı olarak tanımlayın..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                  <select value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm cursor-pointer">
                    <option value="">Seçiniz</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                  <input type="text" value={formData.district} onChange={(e) => updateField("district", e.target.value)} placeholder="İlçe" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mahalle</label>
                  <input type="text" value={formData.neighborhood} onChange={(e) => updateField("neighborhood", e.target.value)} placeholder="Mahalle" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oda Sayısı *</label>
                  <select value={formData.rooms} onChange={(e) => updateField("rooms", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm cursor-pointer">
                    <option value="">Seçiniz</option>
                    {roomOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banyo</label>
                  <select value={formData.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm cursor-pointer">
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">m² *</label>
                  <input type="number" value={formData.area} onChange={(e) => updateField("area", e.target.value)} placeholder="120" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL) *</label>
                  <input type="number" value={formData.price} onChange={(e) => updateField("price", e.target.value)} placeholder={listingType === "daily" ? "Gecelik fiyat" : "Satış fiyatı"} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulunduğu Kat</label>
                  <input type="number" value={formData.floor} onChange={(e) => updateField("floor", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Toplam Kat</label>
                  <input type="number" value={formData.totalFloors} onChange={(e) => updateField("totalFloors", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bina Yaşı</label>
                  <input type="number" value={formData.buildingAge} onChange={(e) => updateField("buildingAge", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isıtma</label>
                  <select value={formData.heating} onChange={(e) => updateField("heating", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm cursor-pointer">
                    <option value="">Seçiniz</option>
                    <option value="Doğalgaz">Doğalgaz</option>
                    <option value="Merkezi">Merkezi</option>
                    <option value="Klima">Klima</option>
                    <option value="Soba">Soba</option>
                    <option value="Şömine">Şömine</option>
                  </select>
                </div>
              </div>

              {/* Daily rental specific fields */}
              {listingType === "daily" && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Konaklama Bilgileri</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min. Konaklama (gece)</label>
                      <input type="number" value={formData.minStay} onChange={(e) => updateField("minStay", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max. Konaklama (gece)</label>
                      <input type="number" value={formData.maxStay} onChange={(e) => updateField("maxStay", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Giriş Saati</label>
                      <input type="time" value={formData.checkIn} onChange={(e) => updateField("checkIn", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Çıkış Saati</label>
                      <input type="time" value={formData.checkOut} onChange={(e) => updateField("checkOut", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 !rounded-xl">Geri</button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.title || !formData.city || !formData.price}
                className="btn-primary flex-1 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Features */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">Özellikler</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "furnished", label: "Eşyalı" },
                { key: "balcony", label: "Balkon" },
                { key: "parking", label: "Otopark" },
                { key: "elevator", label: "Asansör" },
                { key: "pool", label: "Yüzme Havuzu" },
                { key: "garden", label: "Bahçe" },
                { key: "security", label: "Güvenlik / Kapıcı" },
                { key: "airConditioning", label: "Klima" },
                ...(listingType === "daily" ? [
                  { key: "wifi", label: "Wi-Fi" },
                  { key: "kitchen", label: "Mutfak" },
                  { key: "washer", label: "Çamaşır Makinesi" },
                  { key: "tv", label: "TV" },
                ] : []),
              ].map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => updateField(feature.key, !(formData as Record<string, unknown>)[feature.key])}
                  className={`p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                    (formData as Record<string, unknown>)[feature.key]
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {feature.label}
                    {Boolean((formData as Record<string, unknown>)[feature.key]) ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn-outline flex-1 !rounded-xl">Geri</button>
              <button onClick={() => setStep(4)} className="btn-primary flex-1 !rounded-xl">Devam Et</button>
            </div>
          </div>
        )}

        {/* Step 4: Photos & Contact */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">Fotoğraflar</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-gray-700 font-medium">Fotoğraf yüklemek için tıklayın</p>
              <p className="text-sm text-gray-500 mt-1">veya sürükleyip bırakın (max. 20 fotoğraf)</p>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG - Max 10MB</p>
            </div>

            <h2 className="text-lg font-semibold mb-4">İletişim Bilgileri</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                  <input type="text" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="05XX XXX XX XX" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="btn-outline flex-1 !rounded-xl">Geri</button>
              <button
                disabled={!formData.name || !formData.phone}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İlanı Yayınla
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
