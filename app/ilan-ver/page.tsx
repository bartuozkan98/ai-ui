"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Category, categoryLabels, cities, addListing, COMMISSION_RATE } from "../data/properties";

export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<Category>("house");
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState("");

  // Common fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  // House fields
  const [houseForm, setHouseForm] = useState({ propertyType: "apartment", accommodationType: "entire", area: "", bedrooms: "1", beds: "1", livingRooms: "1", bathrooms: "1", kitchens: "1", maxGuests: "2", floor: "", totalFloors: "", buildingAge: "", checkIn: "14:00", checkOut: "11:00", pool: false, garden: false, parking: false, balcony: false, terrace: false, airConditioning: false, heating: false, wifi: false, tv: false, washer: false, dryer: false, dishwasher: false, iron: false, elevator: false, security: false, generator: false, seaView: false, mountainView: false, cityView: false, petsAllowed: false, smokingAllowed: false, partiesAllowed: false });

  // Car fields
  const [carForm, setCarForm] = useState({ brand: "", model: "", year: "2024", fuelType: "gasoline", transmission: "automatic", engineSize: "", seats: "5", doors: "4", color: "", mileage: "", trunkSize: "medium", hasAC: true, hasGPS: false, hasBluetooth: true, hasBackupCamera: false, hasCruiseControl: false, hasUSB: true, hasChildSeat: false, insuranceIncluded: true, dailyKmLimit: "300", minDriverAge: "21", minLicenseYears: "2" });

  // Motorcycle fields
  const [motoForm, setMotoForm] = useState({ brand: "", model: "", year: "2024", engineCC: "", type: "naked", color: "", mileage: "", fuelCapacity: "", seatHeight: "", hasABS: true, hasTractionControl: false, hasQuickshifter: false, hasHeatedGrips: false, helmetIncluded: true, glovesIncluded: false, lockIncluded: true, minLicenseType: "A2" });

  // Boat fields
  const [boatForm, setBoatForm] = useState({ boatType: "motorboat", brand: "", model: "", year: "2024", length: "", maxPassengers: "", cabins: "0", beds: "0", bathrooms: "0", enginePower: "", fuelType: "diesel", captainIncluded: false, crewIncluded: false, hasGPS: false, hasRadar: false, hasSonar: false, hasAC: false, hasKitchen: false, hasBBQ: false, fishingEquipment: false });

  const priceNum = Number(price) || 0;
  const commission = Math.round(priceNum * COMMISSION_RATE);
  const netPayout = priceNum - commission;

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-airbnb-hof mb-2">İlan vermek için giriş yapmalısınız</h1>
            <p className="text-[14px] text-airbnb-foggy mb-4">Üye olun veya giriş yapın, ardından ilanınızı oluşturun.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/giris" className="bg-airbnb-rausch text-white px-6 py-2.5 rounded-lg font-semibold">Giriş Yap</Link>
              <Link href="/kayit" className="border border-[#ddd] px-6 py-2.5 rounded-lg font-semibold text-airbnb-hof">Kayıt Ol</Link>
            </div>
          </div>
        </div>
      <Footer /></div>
    );
  }

  const handleSubmit = () => {
    const listing: any = {
      id: "listing_" + Date.now(),
      userId: user!.id,
      category,
      title, description,
      pricePerDay: priceNum,
      currency: "TL",
      location: { city, district },
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false, views: 0, bookedDates: [],
      ownerName: user!.name, ownerAvatar: user!.name.split(" ").map((n: string) => n[0]).join(""),
    };

    if (category === "house") listing.houseDetails = { ...houseForm, area: Number(houseForm.area), bedrooms: Number(houseForm.bedrooms), beds: Number(houseForm.beds), livingRooms: Number(houseForm.livingRooms), bathrooms: Number(houseForm.bathrooms), kitchens: Number(houseForm.kitchens), maxGuests: Number(houseForm.maxGuests), floor: Number(houseForm.floor) || undefined, totalFloors: Number(houseForm.totalFloors) || undefined, buildingAge: Number(houseForm.buildingAge) || undefined };
    if (category === "car") listing.carDetails = { ...carForm, year: Number(carForm.year), seats: Number(carForm.seats), doors: Number(carForm.doors), mileage: Number(carForm.mileage), dailyKmLimit: Number(carForm.dailyKmLimit), minDriverAge: Number(carForm.minDriverAge), minLicenseYears: Number(carForm.minLicenseYears) };
    if (category === "motorcycle") listing.motorcycleDetails = { ...motoForm, year: Number(motoForm.year), engineCC: Number(motoForm.engineCC), mileage: Number(motoForm.mileage), fuelCapacity: Number(motoForm.fuelCapacity), seatHeight: Number(motoForm.seatHeight) };
    if (category === "boat") listing.boatDetails = { ...boatForm, year: Number(boatForm.year), length: Number(boatForm.length), maxPassengers: Number(boatForm.maxPassengers), cabins: Number(boatForm.cabins), beds: Number(boatForm.beds), bathrooms: Number(boatForm.bathrooms), enginePower: Number(boatForm.enginePower), waterToys: [] };

    addListing(listing);
    router.push("/hesabim");
  };

  return (
    <div className="min-h-screen flex flex-col bg-sahi-bg">
      <Header />
      <div className="max-w-[640px] mx-auto px-4 py-8 w-full flex-1">
        <h1 className="text-[22px] font-bold text-airbnb-hof mb-1">İlan Oluştur</h1>
        <p className="text-[14px] text-airbnb-foggy mb-6">Kiralık ilanınızı oluşturun. Tüm kiralamalarda %3 komisyon uygulanır.</p>

        {/* Step 1: Category + basic info */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-[#ddd] p-5 animate-fadeIn">
            <h2 className="text-[16px] font-semibold text-airbnb-hof mb-3">Kategori & Temel Bilgiler</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {(["house", "car", "motorcycle", "boat"] as Category[]).map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`p-3 rounded-xl border-2 text-center transition-all ${category === cat ? "border-airbnb-rausch bg-[#FFF0F3]" : "border-[#ddd] hover:border-[#999]"}`}>
                  <span className="text-[13px] font-semibold">{categoryLabels[cat]}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Input label="İlan Başlığı *" value={title} onChange={setTitle} placeholder="Kısa ve açıklayıcı bir başlık" />
              <div>
                <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Açıklama *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detaylı açıklama yazın..." className="w-full border border-[#ddd] rounded-lg px-4 py-2.5 text-[14px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Şehir *</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-[#ddd] rounded-lg px-4 py-2.5 text-[14px]">
                    <option value="">Seçin</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="İlçe *" value={district} onChange={setDistrict} placeholder="İlçe" />
              </div>

              {/* Price with commission calc */}
              <div>
                <Input label="Günlük Kiralama Fiyatı (TL) *" value={price} onChange={setPrice} placeholder="0" type="number" />
                {priceNum > 0 && (
                  <div className="mt-2 bg-[#f7f7f7] rounded-lg p-3 text-[13px]">
                    <div className="flex justify-between mb-1"><span className="text-airbnb-foggy">Listelenen Fiyat</span><span className="font-semibold">{priceNum.toLocaleString("tr-TR")} TL / gün</span></div>
                    <div className="flex justify-between mb-1"><span className="text-airbnb-foggy">RentHub Komisyonu (%3)</span><span className="text-airbnb-rausch">-{commission.toLocaleString("tr-TR")} TL</span></div>
                    <hr className="my-1.5 border-[#e0e0e0]" />
                    <div className="flex justify-between"><span className="font-semibold text-airbnb-hof">Net Kazancınız</span><span className="font-bold text-green-600">{netPayout.toLocaleString("tr-TR")} TL / gün</span></div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!title || !city || !price} className="w-full mt-5 bg-airbnb-rausch text-white py-3 rounded-lg font-semibold disabled:opacity-50">
              Devam Et
            </button>
          </div>
        )}

        {/* Step 2: Category-specific details */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-[#ddd] p-5 animate-fadeIn">
            <h2 className="text-[16px] font-semibold text-airbnb-hof mb-3">{categoryLabels[category]} Detayları</h2>

            {category === "house" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Tip" value={houseForm.propertyType} onChange={(v) => setHouseForm({ ...houseForm, propertyType: v })} options={[["apartment","Daire"],["villa","Villa"],["studio","Stüdyo"],["detached","Müstakil"]]} />
                  <Select label="Konaklama" value={houseForm.accommodationType} onChange={(v) => setHouseForm({ ...houseForm, accommodationType: v })} options={[["entire","Tüm Ev"],["private_room","Özel Oda"],["shared_room","Ortak Oda"]]} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Alan (m²)" value={houseForm.area} onChange={(v) => setHouseForm({ ...houseForm, area: v })} type="number" />
                  <Input label="Yatak Odası" value={houseForm.bedrooms} onChange={(v) => setHouseForm({ ...houseForm, bedrooms: v })} type="number" />
                  <Input label="Yatak" value={houseForm.beds} onChange={(v) => setHouseForm({ ...houseForm, beds: v })} type="number" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input label="Salon" value={houseForm.livingRooms} onChange={(v) => setHouseForm({ ...houseForm, livingRooms: v })} type="number" />
                  <Input label="Banyo" value={houseForm.bathrooms} onChange={(v) => setHouseForm({ ...houseForm, bathrooms: v })} type="number" />
                  <Input label="Mutfak" value={houseForm.kitchens} onChange={(v) => setHouseForm({ ...houseForm, kitchens: v })} type="number" />
                  <Input label="Maks Misafir" value={houseForm.maxGuests} onChange={(v) => setHouseForm({ ...houseForm, maxGuests: v })} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Giriş Saati" value={houseForm.checkIn} onChange={(v) => setHouseForm({ ...houseForm, checkIn: v })} type="time" />
                  <Input label="Çıkış Saati" value={houseForm.checkOut} onChange={(v) => setHouseForm({ ...houseForm, checkOut: v })} type="time" />
                </div>
                <h3 className="text-[14px] font-semibold text-airbnb-hof pt-2">Özellikler</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["pool:Havuz","garden:Bahçe","parking:Otopark","balcony:Balkon","terrace:Teras","airConditioning:Klima","heating:Isıtma","wifi:Wi-Fi","tv:TV","washer:Çamaşır Mak.","dryer:Kurutma","dishwasher:Bulaşık Mak.","iron:Ütü","elevator:Asansör","security:Güvenlik","generator:Jeneratör","seaView:Deniz Manz.","mountainView:Dağ Manz.","cityView:Şehir Manz.","petsAllowed:Evcil Hayvan","smokingAllowed:Sigara"] as const).map((item) => {
                    const [key, label] = item.split(":");
                    return <Toggle key={key} label={label} checked={(houseForm as any)[key]} onChange={(v) => setHouseForm({ ...houseForm, [key]: v })} />;
                  })}
                </div>
              </div>
            )}

            {category === "car" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Marka *" value={carForm.brand} onChange={(v) => setCarForm({ ...carForm, brand: v })} placeholder="BMW, Mercedes..." />
                  <Input label="Model *" value={carForm.model} onChange={(v) => setCarForm({ ...carForm, model: v })} placeholder="320i, C200..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Yıl" value={carForm.year} onChange={(v) => setCarForm({ ...carForm, year: v })} type="number" />
                  <Select label="Yakıt" value={carForm.fuelType} onChange={(v) => setCarForm({ ...carForm, fuelType: v })} options={[["gasoline","Benzin"],["diesel","Dizel"],["electric","Elektrik"],["hybrid","Hibrit"],["lpg","LPG"]]} />
                  <Select label="Vites" value={carForm.transmission} onChange={(v) => setCarForm({ ...carForm, transmission: v })} options={[["automatic","Otomatik"],["manual","Manuel"]]} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Motor" value={carForm.engineSize} onChange={(v) => setCarForm({ ...carForm, engineSize: v })} placeholder="2.0L" />
                  <Input label="Koltuk" value={carForm.seats} onChange={(v) => setCarForm({ ...carForm, seats: v })} type="number" />
                  <Input label="Renk" value={carForm.color} onChange={(v) => setCarForm({ ...carForm, color: v })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="KM" value={carForm.mileage} onChange={(v) => setCarForm({ ...carForm, mileage: v })} type="number" />
                  <Input label="Günlük KM Limit" value={carForm.dailyKmLimit} onChange={(v) => setCarForm({ ...carForm, dailyKmLimit: v })} type="number" />
                  <Input label="Min. Ehliyet (yıl)" value={carForm.minLicenseYears} onChange={(v) => setCarForm({ ...carForm, minLicenseYears: v })} type="number" />
                </div>
                <h3 className="text-[14px] font-semibold text-airbnb-hof pt-2">Özellikler</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[["hasAC","Klima"],["hasGPS","GPS"],["hasBluetooth","Bluetooth"],["hasBackupCamera","Geri Kamera"],["hasCruiseControl","Hız Sabitleyici"],["hasUSB","USB"],["hasChildSeat","Çocuk Koltuğu"],["insuranceIncluded","Sigorta Dahil"]].map(([key, label]) => (
                    <Toggle key={key} label={label} checked={(carForm as any)[key]} onChange={(v) => setCarForm({ ...carForm, [key]: v })} />
                  ))}
                </div>
              </div>
            )}

            {category === "motorcycle" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Marka *" value={motoForm.brand} onChange={(v) => setMotoForm({ ...motoForm, brand: v })} placeholder="Honda, Yamaha..." />
                  <Input label="Model *" value={motoForm.model} onChange={(v) => setMotoForm({ ...motoForm, model: v })} placeholder="CB650R, MT-07..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Yıl" value={motoForm.year} onChange={(v) => setMotoForm({ ...motoForm, year: v })} type="number" />
                  <Input label="Motor (cc)" value={motoForm.engineCC} onChange={(v) => setMotoForm({ ...motoForm, engineCC: v })} type="number" />
                  <Select label="Tip" value={motoForm.type} onChange={(v) => setMotoForm({ ...motoForm, type: v })} options={[["sport","Sport"],["touring","Touring"],["cruiser","Cruiser"],["naked","Naked"],["scooter","Scooter"],["enduro","Enduro"],["adventure","Adventure"]]} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Renk" value={motoForm.color} onChange={(v) => setMotoForm({ ...motoForm, color: v })} />
                  <Input label="KM" value={motoForm.mileage} onChange={(v) => setMotoForm({ ...motoForm, mileage: v })} type="number" />
                  <Select label="Ehliyet" value={motoForm.minLicenseType} onChange={(v) => setMotoForm({ ...motoForm, minLicenseType: v })} options={[["A1","A1"],["A2","A2"],["A","A"]]} />
                </div>
                <h3 className="text-[14px] font-semibold text-airbnb-hof pt-2">Özellikler</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[["hasABS","ABS"],["hasTractionControl","Traction Control"],["hasQuickshifter","Quickshifter"],["hasHeatedGrips","Isıtmalı Elcik"],["helmetIncluded","Kask Dahil"],["glovesIncluded","Eldiven Dahil"],["lockIncluded","Kilit Dahil"]].map(([key, label]) => (
                    <Toggle key={key} label={label} checked={(motoForm as any)[key]} onChange={(v) => setMotoForm({ ...motoForm, [key]: v })} />
                  ))}
                </div>
              </div>
            )}

            {category === "boat" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Tekne Tipi" value={boatForm.boatType} onChange={(v) => setBoatForm({ ...boatForm, boatType: v })} options={[["sailboat","Yelkenli"],["motorboat","Motorlu"],["yacht","Yat"],["catamaran","Katamaran"],["gulet","Gulet"],["speedboat","Sürat Teknesi"],["jetski","Jet Ski"]]} />
                  <Input label="Marka" value={boatForm.brand} onChange={(v) => setBoatForm({ ...boatForm, brand: v })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Model" value={boatForm.model} onChange={(v) => setBoatForm({ ...boatForm, model: v })} />
                  <Input label="Yıl" value={boatForm.year} onChange={(v) => setBoatForm({ ...boatForm, year: v })} type="number" />
                  <Input label="Uzunluk (ft)" value={boatForm.length} onChange={(v) => setBoatForm({ ...boatForm, length: v })} type="number" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input label="Kapasite" value={boatForm.maxPassengers} onChange={(v) => setBoatForm({ ...boatForm, maxPassengers: v })} type="number" />
                  <Input label="Kabin" value={boatForm.cabins} onChange={(v) => setBoatForm({ ...boatForm, cabins: v })} type="number" />
                  <Input label="Yatak" value={boatForm.beds} onChange={(v) => setBoatForm({ ...boatForm, beds: v })} type="number" />
                  <Input label="Motor (HP)" value={boatForm.enginePower} onChange={(v) => setBoatForm({ ...boatForm, enginePower: v })} type="number" />
                </div>
                <h3 className="text-[14px] font-semibold text-airbnb-hof pt-2">Özellikler</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[["captainIncluded","Kaptan Dahil"],["crewIncluded","Mürettebat"],["hasGPS","GPS"],["hasRadar","Radar"],["hasSonar","Sonar"],["hasAC","Klima"],["hasKitchen","Mutfak"],["hasBBQ","BBQ"],["fishingEquipment","Balıkçılık Ekip."]].map(([key, label]) => (
                    <Toggle key={key} label={label} checked={(boatForm as any)[key]} onChange={(v) => setBoatForm({ ...boatForm, [key]: v })} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#ddd] py-3 rounded-lg font-semibold text-airbnb-hof">Geri</button>
              <button onClick={handleSubmit} className="flex-1 bg-airbnb-rausch text-white py-3 rounded-lg font-semibold hover:bg-airbnb-rausch-dark transition-colors">İlanı Yayınla</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-airbnb-hof mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-[#ddd] rounded-lg px-3 py-2 text-[14px]" />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-airbnb-hof mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-[#ddd] rounded-lg px-3 py-2 text-[14px]">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`p-2 rounded-lg border text-[12px] text-left transition-all ${checked ? "border-airbnb-rausch bg-[#FFF0F3] text-airbnb-rausch font-semibold" : "border-[#ddd] text-airbnb-foggy"}`}>
      {checked ? "✓ " : ""}{label}
    </button>
  );
}
