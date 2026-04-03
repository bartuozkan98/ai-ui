"use client";
import { useState } from "react";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [houseForm, setHouseForm] = useState({ propertyType: "apartment", accommodationType: "entire", area: "", bedrooms: "1", beds: "1", livingRooms: "1", bathrooms: "1", kitchens: "1", maxGuests: "2", floor: "", totalFloors: "", buildingAge: "", checkIn: "14:00", checkOut: "11:00", pool: false, garden: false, parking: false, balcony: false, terrace: false, airConditioning: false, heating: false, wifi: false, tv: false, washer: false, dryer: false, dishwasher: false, iron: false, elevator: false, security: false, generator: false, seaView: false, mountainView: false, cityView: false, petsAllowed: false, smokingAllowed: false, partiesAllowed: false });
  const [carForm, setCarForm] = useState({ brand: "", model: "", year: "2024", fuelType: "gasoline", transmission: "automatic", engineSize: "", seats: "5", doors: "4", color: "", mileage: "", trunkSize: "medium", hasAC: true, hasGPS: false, hasBluetooth: true, hasBackupCamera: false, hasCruiseControl: false, hasUSB: true, hasChildSeat: false, insuranceIncluded: true, dailyKmLimit: "300", minDriverAge: "21", minLicenseYears: "2" });
  const [motoForm, setMotoForm] = useState({ brand: "", model: "", year: "2024", engineCC: "", type: "naked", color: "", mileage: "", fuelCapacity: "", seatHeight: "", hasABS: true, hasTractionControl: false, hasQuickshifter: false, hasHeatedGrips: false, helmetIncluded: true, glovesIncluded: false, lockIncluded: true, minLicenseType: "A2" });
  const [boatForm, setBoatForm] = useState({ boatType: "motorboat", brand: "", model: "", year: "2024", length: "", maxPassengers: "", cabins: "0", beds: "0", bathrooms: "0", enginePower: "", fuelType: "diesel", captainIncluded: false, crewIncluded: false, hasGPS: false, hasRadar: false, hasSonar: false, hasAC: false, hasKitchen: false, hasBBQ: false, fishingEquipment: false });

  const priceNum = Number(price) || 0;
  const commission = Math.round(priceNum * COMMISSION_RATE);
  const netPayout = priceNum - commission;

  if (!loading && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-white"><Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-[#f7f7f7] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 className="text-[22px] font-semibold text-airbnb-hof mb-2">Giris yapin</h1>
            <p className="text-[16px] text-airbnb-foggy mb-8">Ilan vermek icin hesabiniza giris yapin veya yeni hesap olusturun.</p>
            <div className="flex flex-col gap-3">
              <Link href="/giris" className="bg-airbnb-rausch text-white px-6 py-3 rounded-xl font-semibold text-[16px] text-center">Giris Yap</Link>
              <Link href="/kayit" className="border border-airbnb-hof text-airbnb-hof px-6 py-3 rounded-xl font-semibold text-[16px] text-center">Kayit Ol</Link>
            </div>
          </div>
        </div>
      <Footer /></div>
    );
  }

  const handleSubmit = () => {
    const listing: any = {
      id: "listing_" + Date.now(), userId: user!.id, category, title, description,
      pricePerDay: priceNum, currency: "TL", location: { city, district },
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

  const catIcons: Record<Category, string> = {
    house: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    car: "M19 17H5m14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3 13l2-6h14l2 6",
    motorcycle: "M5 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm8 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM8 16h5",
    boat: "M2 20l2-3c2-2 4-2 6 0s4 2 6 0l2 3M4 17V9l8-5 8 5v8",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Progress bar */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="max-w-[640px] mx-auto px-4">
          <div className="flex gap-2 py-4">
            <div className={`h-[3px] flex-1 rounded-full transition-all ${step >= 1 ? "bg-airbnb-hof" : "bg-[#ddd]"}`} />
            <div className={`h-[3px] flex-1 rounded-full transition-all ${step >= 2 ? "bg-airbnb-hof" : "bg-[#ddd]"}`} />
          </div>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-10 w-full flex-1">
        {step === 1 && (
          <div className="animate-slideUp">
            <h1 className="text-[32px] font-semibold text-airbnb-hof mb-2">Ilaninizi olusturun</h1>
            <p className="text-[18px] text-airbnb-foggy mb-10">Tum kiralamalarda sadece %3 komisyon uygulanir.</p>

            {/* Category selection */}
            <div className="mb-8">
              <label className="block text-[14px] font-semibold text-airbnb-hof mb-3">Kategori secin</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["house", "car", "motorcycle", "boat"] as Category[]).map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`p-4 rounded-xl border-2 text-left transition-all ${category === cat ? "border-airbnb-hof bg-[#f7f7f7]" : "border-[#ddd] hover:border-[#222]"}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={category === cat ? "#222" : "#717171"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={catIcons[cat]}/></svg>
                    <span className="block text-[14px] font-semibold mt-2">{categoryLabels[cat]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <FormInput label="Ilan Basligi" value={title} onChange={setTitle} placeholder="Kisa ve aciklayici bir baslik" />
              <div>
                <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">Aciklama</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Detayli aciklama yazin..." className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px] resize-none focus:border-airbnb-hof" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">Sehir</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px]">
                    <option value="">Secin</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <FormInput label="Ilce" value={district} onChange={setDistrict} placeholder="Ilce" />
              </div>

              <div>
                <FormInput label="Gunluk Fiyat (TL)" value={price} onChange={setPrice} placeholder="0" type="number" />
                {priceNum > 0 && (
                  <div className="mt-3 bg-[#f7f7f7] rounded-xl p-5">
                    <div className="space-y-2 text-[15px]">
                      <div className="flex justify-between"><span className="text-airbnb-foggy">Listelenen Fiyat</span><span className="font-medium">{priceNum.toLocaleString("tr-TR")} TL / gun</span></div>
                      <div className="flex justify-between"><span className="text-airbnb-foggy">Komisyon (%3)</span><span className="text-airbnb-rausch">-{commission.toLocaleString("tr-TR")} TL</span></div>
                      <hr className="border-[#e0e0e0]" />
                      <div className="flex justify-between"><span className="font-semibold">Net Kazanciniz</span><span className="font-bold text-[#008A05]">{netPayout.toLocaleString("tr-TR")} TL / gun</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!title || !city || !price} className="w-full mt-8 bg-airbnb-hof text-white py-[14px] rounded-xl font-semibold text-[16px] disabled:opacity-40 hover:bg-black transition-colors">
              Devam
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slideUp">
            <h1 className="text-[32px] font-semibold text-airbnb-hof mb-2">{categoryLabels[category]} detaylari</h1>
            <p className="text-[18px] text-airbnb-foggy mb-10">Ilaniniz icin ozel detaylari girin.</p>

            {category === "house" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect label="Tip" value={houseForm.propertyType} onChange={(v) => setHouseForm({ ...houseForm, propertyType: v })} options={[["apartment","Daire"],["villa","Villa"],["studio","Studyo"],["detached","Mustakil"]]} />
                  <FormSelect label="Konaklama" value={houseForm.accommodationType} onChange={(v) => setHouseForm({ ...houseForm, accommodationType: v })} options={[["entire","Tum Ev"],["private_room","Ozel Oda"],["shared_room","Ortak Oda"]]} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormInput label="Alan (m2)" value={houseForm.area} onChange={(v) => setHouseForm({ ...houseForm, area: v })} type="number" />
                  <FormInput label="Yatak Odasi" value={houseForm.bedrooms} onChange={(v) => setHouseForm({ ...houseForm, bedrooms: v })} type="number" />
                  <FormInput label="Banyo" value={houseForm.bathrooms} onChange={(v) => setHouseForm({ ...houseForm, bathrooms: v })} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Maks Misafir" value={houseForm.maxGuests} onChange={(v) => setHouseForm({ ...houseForm, maxGuests: v })} type="number" />
                  <FormInput label="Yatak" value={houseForm.beds} onChange={(v) => setHouseForm({ ...houseForm, beds: v })} type="number" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-airbnb-hof mb-3">Ozellikler</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([["pool","Havuz"],["garden","Bahce"],["parking","Otopark"],["balcony","Balkon"],["airConditioning","Klima"],["heating","Isitma"],["wifi","Wi-Fi"],["tv","TV"],["washer","Camasir Mak."],["dishwasher","Bulasik Mak."],["elevator","Asansor"],["seaView","Deniz Manz."],["petsAllowed","Evcil Hayvan"]] as [string,string][]).map(([key, label]) => (
                      <ToggleBtn key={key} label={label} checked={(houseForm as any)[key]} onChange={(v) => setHouseForm({ ...houseForm, [key]: v })} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === "car" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Marka" value={carForm.brand} onChange={(v) => setCarForm({ ...carForm, brand: v })} placeholder="BMW, Mercedes..." />
                  <FormInput label="Model" value={carForm.model} onChange={(v) => setCarForm({ ...carForm, model: v })} placeholder="320i, C200..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormInput label="Yil" value={carForm.year} onChange={(v) => setCarForm({ ...carForm, year: v })} type="number" />
                  <FormSelect label="Yakit" value={carForm.fuelType} onChange={(v) => setCarForm({ ...carForm, fuelType: v })} options={[["gasoline","Benzin"],["diesel","Dizel"],["electric","Elektrik"],["hybrid","Hibrit"]]} />
                  <FormSelect label="Vites" value={carForm.transmission} onChange={(v) => setCarForm({ ...carForm, transmission: v })} options={[["automatic","Otomatik"],["manual","Manuel"]]} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormInput label="Motor" value={carForm.engineSize} onChange={(v) => setCarForm({ ...carForm, engineSize: v })} placeholder="2.0L" />
                  <FormInput label="Koltuk" value={carForm.seats} onChange={(v) => setCarForm({ ...carForm, seats: v })} type="number" />
                  <FormInput label="Renk" value={carForm.color} onChange={(v) => setCarForm({ ...carForm, color: v })} />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-airbnb-hof mb-3">Ozellikler</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([["hasAC","Klima"],["hasGPS","GPS"],["hasBluetooth","Bluetooth"],["hasBackupCamera","Geri Kamera"],["hasCruiseControl","Hiz Sabitleyici"],["hasUSB","USB"],["hasChildSeat","Cocuk Koltuugu"],["insuranceIncluded","Sigorta Dahil"]] as [string,string][]).map(([key, label]) => (
                      <ToggleBtn key={key} label={label} checked={(carForm as any)[key]} onChange={(v) => setCarForm({ ...carForm, [key]: v })} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === "motorcycle" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Marka" value={motoForm.brand} onChange={(v) => setMotoForm({ ...motoForm, brand: v })} placeholder="Honda, Yamaha..." />
                  <FormInput label="Model" value={motoForm.model} onChange={(v) => setMotoForm({ ...motoForm, model: v })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormInput label="Yil" value={motoForm.year} onChange={(v) => setMotoForm({ ...motoForm, year: v })} type="number" />
                  <FormInput label="Motor (cc)" value={motoForm.engineCC} onChange={(v) => setMotoForm({ ...motoForm, engineCC: v })} type="number" />
                  <FormSelect label="Tip" value={motoForm.type} onChange={(v) => setMotoForm({ ...motoForm, type: v })} options={[["sport","Sport"],["touring","Touring"],["cruiser","Cruiser"],["naked","Naked"],["scooter","Scooter"],["enduro","Enduro"],["adventure","Adventure"]]} />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-airbnb-hof mb-3">Ozellikler</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([["hasABS","ABS"],["hasTractionControl","Traction Control"],["hasQuickshifter","Quickshifter"],["helmetIncluded","Kask Dahil"],["glovesIncluded","Eldiven Dahil"],["lockIncluded","Kilit Dahil"]] as [string,string][]).map(([key, label]) => (
                      <ToggleBtn key={key} label={label} checked={(motoForm as any)[key]} onChange={(v) => setMotoForm({ ...motoForm, [key]: v })} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === "boat" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect label="Tekne Tipi" value={boatForm.boatType} onChange={(v) => setBoatForm({ ...boatForm, boatType: v })} options={[["sailboat","Yelkenli"],["motorboat","Motorlu"],["yacht","Yat"],["catamaran","Katamaran"],["gulet","Gulet"],["speedboat","Surat Teknesi"]]} />
                  <FormInput label="Marka" value={boatForm.brand} onChange={(v) => setBoatForm({ ...boatForm, brand: v })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormInput label="Uzunluk (ft)" value={boatForm.length} onChange={(v) => setBoatForm({ ...boatForm, length: v })} type="number" />
                  <FormInput label="Kapasite" value={boatForm.maxPassengers} onChange={(v) => setBoatForm({ ...boatForm, maxPassengers: v })} type="number" />
                  <FormInput label="Motor (HP)" value={boatForm.enginePower} onChange={(v) => setBoatForm({ ...boatForm, enginePower: v })} type="number" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-airbnb-hof mb-3">Ozellikler</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([["captainIncluded","Kaptan Dahil"],["crewIncluded","Murettebat"],["hasGPS","GPS"],["hasAC","Klima"],["hasKitchen","Mutfak"],["hasBBQ","BBQ"],["fishingEquipment","Balikcilik Ekip."]] as [string,string][]).map(([key, label]) => (
                      <ToggleBtn key={key} label={label} checked={(boatForm as any)[key]} onChange={(v) => setBoatForm({ ...boatForm, [key]: v })} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-10">
              <button onClick={() => setStep(1)} className="flex-1 border border-airbnb-hof text-airbnb-hof py-[14px] rounded-xl font-semibold text-[16px] hover:bg-[#f7f7f7] transition-colors">Geri</button>
              <button onClick={handleSubmit} className="flex-1 bg-airbnb-rausch text-white py-[14px] rounded-xl font-semibold text-[16px] hover:bg-airbnb-rausch-dark transition-colors">Ilani Yayinla</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px]" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <div>
      <label className="block text-[14px] font-semibold text-airbnb-hof mb-2">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-[#b0b0b0] rounded-xl px-4 py-3 text-[16px]">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function ToggleBtn({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 p-3 rounded-xl border text-[14px] text-left transition-all ${checked ? "border-airbnb-hof bg-[#f7f7f7] font-medium" : "border-[#ddd] text-airbnb-foggy hover:border-[#222]"}`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "border-airbnb-hof bg-airbnb-hof" : "border-[#b0b0b0]"}`}>
        {checked && <svg width="12" height="12" viewBox="0 0 16 16" fill="white"><path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      {label}
    </button>
  );
}
