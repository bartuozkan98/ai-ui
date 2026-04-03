"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { getListings, Listing, formatPrice, calculateCommission, isDateAvailable, addBooking, categoryLabels } from "../../data/properties";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const all = getListings();
    const found = all.find((l) => l.id === params.id);
    setListing(found || null);
  }, [params.id]);

  if (!listing) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center text-airbnb-foggy">İlan bulunamadı.</div><Footer /></div>;

  const days = startDate && endDate ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 0;
  const totalPrice = days * listing.pricePerDay;
  const { commission, netPayout } = calculateCommission(totalPrice);
  const available = startDate && endDate ? isDateAvailable(listing, startDate, endDate) : true;

  const handleBooking = () => {
    if (!user) { setShowLogin(true); return; }
    if (!startDate || !endDate || !available) return;
    const booking = {
      id: "book_" + Date.now(),
      listingId: listing.id,
      renterId: user.id,
      ownerId: listing.userId,
      startDate, endDate,
      totalDays: days,
      totalPrice,
      commission,
      netPayout,
      status: "confirmed" as const,
      createdAt: new Date().toISOString(),
      category: listing.category,
      listingTitle: listing.title,
    };
    addBooking(booking);
    setBookingSuccess(true);
  };

  // Category-specific details rendering
  const renderDetails = () => {
    if (listing.category === "house" && listing.houseDetails) {
      const h = listing.houseDetails;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Detail label="Tip" value={h.propertyType} />
          <Detail label="Alan" value={`${h.area} m²`} />
          <Detail label="Yatak Odası" value={h.bedrooms} />
          <Detail label="Yatak" value={h.beds} />
          <Detail label="Salon" value={h.livingRooms} />
          <Detail label="Banyo" value={h.bathrooms} />
          <Detail label="Mutfak" value={h.kitchens} />
          <Detail label="Maks. Misafir" value={h.maxGuests} />
          {h.floor && <Detail label="Kat" value={`${h.floor}/${h.totalFloors}`} />}
          <Detail label="Giriş" value={h.checkIn} />
          <Detail label="Çıkış" value={h.checkOut} />
        </div>
      );
    }
    if (listing.category === "car" && listing.carDetails) {
      const c = listing.carDetails;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Detail label="Marka" value={c.brand} />
          <Detail label="Model" value={c.model} />
          <Detail label="Yıl" value={c.year} />
          <Detail label="Yakıt" value={c.fuelType} />
          <Detail label="Vites" value={c.transmission === "automatic" ? "Otomatik" : "Manuel"} />
          <Detail label="Motor" value={c.engineSize} />
          <Detail label="Koltuk" value={c.seats} />
          <Detail label="Renk" value={c.color} />
          <Detail label="KM" value={new Intl.NumberFormat("tr-TR").format(c.mileage)} />
          <Detail label="Günlük KM Limit" value={`${c.dailyKmLimit} km`} />
          <Detail label="Min. Ehliyet" value={`${c.minLicenseYears} yıl`} />
          <Detail label="Min. Yaş" value={c.minDriverAge} />
        </div>
      );
    }
    if (listing.category === "motorcycle" && listing.motorcycleDetails) {
      const m = listing.motorcycleDetails;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Detail label="Marka" value={m.brand} />
          <Detail label="Model" value={m.model} />
          <Detail label="Yıl" value={m.year} />
          <Detail label="Motor" value={`${m.engineCC}cc`} />
          <Detail label="Tip" value={m.type} />
          <Detail label="Renk" value={m.color} />
          <Detail label="KM" value={new Intl.NumberFormat("tr-TR").format(m.mileage)} />
          <Detail label="Yakıt Deposu" value={`${m.fuelCapacity}L`} />
          <Detail label="Oturak Yük." value={`${m.seatHeight}mm`} />
          <Detail label="Ehliyet" value={m.minLicenseType} />
        </div>
      );
    }
    if (listing.category === "boat" && listing.boatDetails) {
      const b = listing.boatDetails;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Detail label="Tip" value={b.boatType} />
          <Detail label="Marka" value={b.brand} />
          <Detail label="Model" value={b.model} />
          <Detail label="Yıl" value={b.year} />
          <Detail label="Uzunluk" value={`${b.length} ft`} />
          <Detail label="Kapasite" value={`${b.maxPassengers} kişi`} />
          <Detail label="Kabin" value={b.cabins} />
          <Detail label="Yatak" value={b.beds} />
          <Detail label="Banyo" value={b.bathrooms} />
          <Detail label="Motor" value={`${b.enginePower} HP`} />
          <Detail label="Kaptan" value={b.captainIncluded ? "Dahil" : "Hariç"} />
          <Detail label="Mürettebat" value={b.crewIncluded ? "Dahil" : "Hariç"} />
        </div>
      );
    }
    return null;
  };

  // Amenities
  const renderAmenities = () => {
    const items: { label: string; value: boolean }[] = [];
    if (listing.category === "house" && listing.houseDetails) {
      const h = listing.houseDetails;
      items.push({ label: "Havuz", value: h.pool }, { label: "Bahçe", value: h.garden }, { label: "Otopark", value: h.parking }, { label: "Balkon", value: h.balcony }, { label: "Teras", value: h.terrace }, { label: "Klima", value: h.airConditioning }, { label: "Isıtma", value: h.heating }, { label: "Wi-Fi", value: h.wifi }, { label: "TV", value: h.tv }, { label: "Çamaşır Mak.", value: h.washer }, { label: "Kurutma Mak.", value: h.dryer }, { label: "Bulaşık Mak.", value: h.dishwasher }, { label: "Ütü", value: h.iron }, { label: "Asansör", value: h.elevator }, { label: "Güvenlik", value: h.security }, { label: "Jeneratör", value: h.generator }, { label: "Deniz Manzarası", value: h.seaView }, { label: "Dağ Manzarası", value: h.mountainView }, { label: "Evcil Hayvan", value: h.petsAllowed }, { label: "Sigara", value: h.smokingAllowed });
    }
    if (listing.category === "car" && listing.carDetails) {
      const c = listing.carDetails;
      items.push({ label: "Klima", value: c.hasAC }, { label: "GPS", value: c.hasGPS }, { label: "Bluetooth", value: c.hasBluetooth }, { label: "Geri Görüş Kamera", value: c.hasBackupCamera }, { label: "Hız Sabitleyici", value: c.hasCruiseControl }, { label: "USB", value: c.hasUSB }, { label: "Çocuk Koltuğu", value: c.hasChildSeat }, { label: "Sigorta Dahil", value: c.insuranceIncluded });
    }
    if (listing.category === "motorcycle" && listing.motorcycleDetails) {
      const m = listing.motorcycleDetails;
      items.push({ label: "ABS", value: m.hasABS }, { label: "Traction Control", value: m.hasTractionControl }, { label: "Quickshifter", value: m.hasQuickshifter }, { label: "Isıtmalı Elcik", value: m.hasHeatedGrips }, { label: "Kask Dahil", value: m.helmetIncluded }, { label: "Eldiven Dahil", value: m.glovesIncluded }, { label: "Kilit Dahil", value: m.lockIncluded });
    }
    if (listing.category === "boat" && listing.boatDetails) {
      const b = listing.boatDetails;
      items.push({ label: "GPS", value: b.hasGPS }, { label: "Radar", value: b.hasRadar }, { label: "Sonar", value: b.hasSonar }, { label: "Klima", value: b.hasAC }, { label: "Mutfak", value: b.hasKitchen }, { label: "BBQ", value: b.hasBBQ }, { label: "Balıkçılık Ekip.", value: b.fishingEquipment });
    }
    return items;
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#008A05" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 className="text-[22px] font-bold text-airbnb-hof mb-2">Kiralama Onaylandı!</h1>
            <p className="text-[14px] text-airbnb-foggy mb-2">Ödemeniz RentHub güvencesinde tutulacaktır.</p>
            <p className="text-[13px] text-airbnb-foggy mb-6">Çıkış tarihinde %3 komisyon düşülerek {formatPrice(netPayout)} tutarında ödeme ev sahibine aktarılacaktır.</p>
            <div className="bg-[#f7f7f7] rounded-xl p-4 text-left text-[13px] mb-6">
              <div className="flex justify-between mb-1"><span className="text-airbnb-foggy">Tarih</span><span className="text-airbnb-hof">{startDate} → {endDate}</span></div>
              <div className="flex justify-between mb-1"><span className="text-airbnb-foggy">Toplam</span><span className="font-semibold text-airbnb-hof">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between mb-1"><span className="text-airbnb-foggy">Komisyon (%3)</span><span>{formatPrice(commission)}</span></div>
              <div className="flex justify-between"><span className="text-airbnb-foggy">Satıcı Net Kazanç</span><span className="text-green-600 font-semibold">{formatPrice(netPayout)}</span></div>
            </div>
            <Link href="/hesabim" className="inline-block bg-airbnb-rausch text-white px-6 py-3 rounded-lg font-semibold hover:bg-airbnb-rausch-dark transition-colors">Hesabıma Git</Link>
          </div>
        </div>
      <Footer /></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 py-6 w-full flex-1">
        {/* Title */}
        <h1 className="text-[22px] font-bold text-airbnb-hof">{listing.title}</h1>
        <div className="flex items-center gap-3 mt-1 text-[14px] text-airbnb-foggy">
          {listing.rating && <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> {listing.rating} ({listing.reviewCount})</span>}
          <span>{listing.location.city}, {listing.location.district}</span>
          <span className="text-airbnb-rausch font-medium">{categoryLabels[listing.category]}</span>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mt-4 mb-8">
          <div className="aspect-[4/3] md:row-span-2"><img src={listing.images[0]} alt="" className="w-full h-full object-cover" /></div>
          {listing.images.slice(1, 3).map((img, i) => (
            <div key={i} className="aspect-[4/3] hidden md:block"><img src={img} alt="" className="w-full h-full object-cover" /></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Owner */}
            <div className="flex items-center justify-between pb-6 border-b border-[#ebebeb] mb-6">
              <div>
                <h2 className="text-[18px] font-semibold text-airbnb-hof">Kiraya Veren: {listing.ownerName}</h2>
                <p className="text-[14px] text-airbnb-foggy mt-0.5">{categoryLabels[listing.category]} · {listing.location.city}</p>
              </div>
              <div className="w-12 h-12 bg-airbnb-hof text-white rounded-full flex items-center justify-center text-[16px] font-semibold">{listing.ownerAvatar}</div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-[#ebebeb] mb-6">
              <h3 className="text-[16px] font-semibold text-airbnb-hof mb-2">Açıklama</h3>
              <p className="text-[14px] text-airbnb-foggy leading-relaxed">{listing.description}</p>
            </div>

            {/* Details */}
            <div className="pb-6 border-b border-[#ebebeb] mb-6">
              <h3 className="text-[16px] font-semibold text-airbnb-hof mb-3">Detaylar</h3>
              {renderDetails()}
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-[#ebebeb] mb-6">
              <h3 className="text-[16px] font-semibold text-airbnb-hof mb-3">Özellikler</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {renderAmenities().map((a) => (
                  <div key={a.label} className="flex items-center gap-2 text-[14px]">
                    {a.value ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008A05" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                    <span className={a.value ? "text-airbnb-hof" : "text-[#ccc] line-through"}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[120px] bg-white border border-[#ddd] rounded-xl p-5" style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }}>
              <div className="text-[22px] font-bold text-airbnb-hof">
                {formatPrice(listing.pricePerDay)} <span className="text-[16px] font-normal text-airbnb-foggy">/ gün</span>
              </div>

              {/* Date inputs */}
              <div className="border border-[#bbb] rounded-xl overflow-hidden mt-4 mb-3">
                <div className="grid grid-cols-2 divide-x divide-[#bbb]">
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold uppercase text-airbnb-hof">Giriş</div>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-[13px] border-none p-0 mt-0.5" />
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold uppercase text-airbnb-hof">Çıkış</div>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-[13px] border-none p-0 mt-0.5" />
                  </div>
                </div>
              </div>

              {startDate && endDate && !available && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-2 rounded-lg mb-3">Seçilen tarihler müsait değil.</div>
              )}

              <button onClick={handleBooking} disabled={!startDate || !endDate || !available} className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch-dark text-white py-3 rounded-lg font-semibold text-[16px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {!user ? "Giriş Yap & Kirala" : "Şimdi Kirala"}
              </button>

              {showLogin && !user && (
                <div className="mt-2 text-center">
                  <Link href="/giris" className="text-[13px] text-airbnb-rausch font-semibold underline">Kiralamak için giriş yapın</Link>
                </div>
              )}

              {days > 0 && available && (
                <div className="mt-4 space-y-2 text-[14px]">
                  <div className="flex justify-between text-airbnb-foggy">
                    <span>{formatPrice(listing.pricePerDay)} x {days} gün</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-airbnb-foggy">
                    <span>RentHub komisyonu (%3)</span>
                    <span>{formatPrice(commission)}</span>
                  </div>
                  <hr className="border-[#ebebeb]" />
                  <div className="flex justify-between font-semibold text-airbnb-hof">
                    <span>Toplam ödeme</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="bg-[#f0fff4] border border-green-200 rounded-lg p-2 text-[12px] text-green-700">
                    Ödemeniz çıkış tarihine kadar RentHub güvencesinde tutulacaktır. Çıkış sonrası %3 komisyon düşülerek {formatPrice(netPayout)} satıcıya aktarılır.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#f7f7f7] rounded-lg p-3">
      <div className="text-[11px] text-airbnb-foggy">{label}</div>
      <div className="text-[14px] font-semibold text-airbnb-hof">{value}</div>
    </div>
  );
}
