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

  if (!listing) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[18px] font-semibold text-airbnb-hof">Ilan bulunamadi</p>
          <Link href="/" className="text-[14px] text-airbnb-rausch font-semibold mt-2 inline-block hover:underline">Ana sayfaya don</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const days = startDate && endDate ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 0;
  const totalPrice = days * listing.pricePerDay;
  const { commission, netPayout } = calculateCommission(totalPrice);
  const available = startDate && endDate ? isDateAvailable(listing, startDate, endDate) : true;

  const handleBooking = () => {
    if (!user) { setShowLogin(true); return; }
    if (!startDate || !endDate || !available) return;
    addBooking({
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
    });
    setBookingSuccess(true);
  };

  const renderDetails = () => {
    const items: { label: string; value: string | number }[] = [];
    if (listing.category === "house" && listing.houseDetails) {
      const h = listing.houseDetails;
      items.push({ label: "Tip", value: h.propertyType }, { label: "Alan", value: `${h.area} m2` }, { label: "Yatak Odasi", value: h.bedrooms }, { label: "Yatak", value: h.beds }, { label: "Banyo", value: h.bathrooms }, { label: "Maks. Misafir", value: h.maxGuests });
    }
    if (listing.category === "car" && listing.carDetails) {
      const c = listing.carDetails;
      items.push({ label: "Marka", value: c.brand }, { label: "Model", value: c.model }, { label: "Yil", value: c.year }, { label: "Yakit", value: c.fuelType }, { label: "Vites", value: c.transmission === "automatic" ? "Otomatik" : "Manuel" }, { label: "Koltuk", value: c.seats });
    }
    if (listing.category === "motorcycle" && listing.motorcycleDetails) {
      const m = listing.motorcycleDetails;
      items.push({ label: "Marka", value: m.brand }, { label: "Model", value: m.model }, { label: "Motor", value: `${m.engineCC}cc` }, { label: "Tip", value: m.type }, { label: "Renk", value: m.color });
    }
    if (listing.category === "boat" && listing.boatDetails) {
      const b = listing.boatDetails;
      items.push({ label: "Tip", value: b.boatType }, { label: "Uzunluk", value: `${b.length} ft` }, { label: "Kapasite", value: `${b.maxPassengers} kisi` }, { label: "Kabin", value: b.cabins }, { label: "Motor", value: `${b.enginePower} HP` });
    }
    return items;
  };

  const renderAmenities = () => {
    const items: { label: string; value: boolean }[] = [];
    if (listing.category === "house" && listing.houseDetails) {
      const h = listing.houseDetails;
      items.push({ label: "Wi-Fi", value: h.wifi }, { label: "Klima", value: h.airConditioning }, { label: "Isitma", value: h.heating }, { label: "Havuz", value: h.pool }, { label: "Otopark", value: h.parking }, { label: "TV", value: h.tv }, { label: "Camasir Mak.", value: h.washer }, { label: "Mutfak", value: true }, { label: "Balkon", value: h.balcony }, { label: "Bahce", value: h.garden });
    }
    if (listing.category === "car" && listing.carDetails) {
      const c = listing.carDetails;
      items.push({ label: "Klima", value: c.hasAC }, { label: "GPS", value: c.hasGPS }, { label: "Bluetooth", value: c.hasBluetooth }, { label: "Geri Kamera", value: c.hasBackupCamera }, { label: "Hiz Sabitleyici", value: c.hasCruiseControl }, { label: "Sigorta Dahil", value: c.insuranceIncluded });
    }
    if (listing.category === "motorcycle" && listing.motorcycleDetails) {
      const m = listing.motorcycleDetails;
      items.push({ label: "ABS", value: m.hasABS }, { label: "Traction Control", value: m.hasTractionControl }, { label: "Kask Dahil", value: m.helmetIncluded }, { label: "Eldiven Dahil", value: m.glovesIncluded }, { label: "Kilit Dahil", value: m.lockIncluded });
    }
    if (listing.category === "boat" && listing.boatDetails) {
      const b = listing.boatDetails;
      items.push({ label: "GPS", value: b.hasGPS }, { label: "Klima", value: b.hasAC }, { label: "Mutfak", value: b.hasKitchen }, { label: "BBQ", value: b.hasBBQ }, { label: "Kaptan Dahil", value: b.captainIncluded });
    }
    return items;
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md animate-slideUp">
            <div className="w-20 h-20 bg-[#f0fff4] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#008A05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 className="text-[26px] font-semibold text-airbnb-hof mb-2">Kiralama onaylandi!</h1>
            <p className="text-[16px] text-airbnb-foggy mb-8">Odemeniz RentHub guvencesinde tutulacaktir.</p>
            <div className="bg-[#f7f7f7] rounded-2xl p-6 text-left mb-8">
              <div className="space-y-3 text-[15px]">
                <div className="flex justify-between"><span className="text-airbnb-foggy">Tarih</span><span className="font-medium">{startDate} &rarr; {endDate}</span></div>
                <div className="flex justify-between"><span className="text-airbnb-foggy">Toplam</span><span className="font-semibold">{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-airbnb-foggy">Komisyon (%3)</span><span>{formatPrice(commission)}</span></div>
                <hr className="border-[#e0e0e0]" />
                <div className="flex justify-between"><span className="text-airbnb-foggy">Satici Net Kazanc</span><span className="text-[#008A05] font-semibold">{formatPrice(netPayout)}</span></div>
              </div>
            </div>
            <Link href="/hesabim" className="inline-block bg-airbnb-rausch text-white px-8 py-4 rounded-xl font-semibold text-[16px] hover:bg-airbnb-rausch-dark transition-colors">
              Hesabima Git
            </Link>
          </div>
        </div>
      <Footer /></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-6 w-full flex-1">
        {/* Title */}
        <h1 className="text-[26px] font-semibold text-airbnb-hof">{listing.title}</h1>
        <div className="flex items-center flex-wrap gap-2 mt-1 text-[14px]">
          {listing.rating && (
            <span className="flex items-center gap-1 font-semibold">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="#222"><path d="M15.1 1.58l-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06L16 25.76l8.61 5.19a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.54-1.74l-9.86-1.27-4.13-8.88a1 1 0 0 0-1.79 0z"/></svg>
              {listing.rating}
            </span>
          )}
          {listing.reviewCount && <span className="text-airbnb-hof underline font-medium">{listing.reviewCount} degerlendirme</span>}
          <span className="text-airbnb-foggy">·</span>
          <span className="text-airbnb-hof underline font-medium">{listing.location.city}, {listing.location.district}</span>
        </div>

        {/* Image gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mt-6 mb-8">
          <div className="md:col-span-2 md:row-span-2 aspect-square md:aspect-auto">
            <img src={listing.images[0]} alt="" className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all" />
          </div>
          {listing.images.slice(1, 5).map((img, i) => (
            <div key={i} className="hidden md:block aspect-square">
              <img src={img} alt="" className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left content */}
          <div className="lg:col-span-2">
            {/* Owner */}
            <div className="flex items-center justify-between pb-8 border-b border-[#ebebeb]">
              <div>
                <h2 className="text-[22px] font-semibold text-airbnb-hof">Kiraya Veren: {listing.ownerName}</h2>
                <p className="text-[16px] text-airbnb-foggy mt-1">{categoryLabels[listing.category]} · {listing.location.city}</p>
              </div>
              <div className="w-14 h-14 bg-airbnb-hof text-white rounded-full flex items-center justify-center text-[18px] font-semibold shrink-0">{listing.ownerAvatar}</div>
            </div>

            {/* Key highlights */}
            <div className="py-8 border-b border-[#ebebeb] space-y-6">
              {renderDetails().slice(0, 3).map((d) => (
                <div key={d.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f7f7f7] rounded-full flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5"><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-airbnb-hof">{d.label}</div>
                    <div className="text-[14px] text-airbnb-foggy">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="py-8 border-b border-[#ebebeb]">
              <p className="text-[16px] text-airbnb-hof leading-relaxed">{listing.description}</p>
            </div>

            {/* Details grid */}
            <div className="py-8 border-b border-[#ebebeb]">
              <h3 className="text-[22px] font-semibold text-airbnb-hof mb-6">Detaylar</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {renderDetails().map((d) => (
                  <div key={d.label} className="py-3">
                    <div className="text-[14px] text-airbnb-foggy">{d.label}</div>
                    <div className="text-[16px] font-medium text-airbnb-hof mt-1">{d.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="py-8 border-b border-[#ebebeb]">
              <h3 className="text-[22px] font-semibold text-airbnb-hof mb-6">Sunulan imkanlar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderAmenities().filter(a => a.value).map((a) => (
                  <div key={a.label} className="flex items-center gap-4 py-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[16px] text-airbnb-hof">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[120px] border border-[#ddd] rounded-xl p-6 animate-fadeIn" style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }}>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[22px] font-semibold text-airbnb-hof">{formatPrice(listing.pricePerDay)}</span>
                <span className="text-[16px] text-airbnb-foggy">/ gun</span>
              </div>

              {/* Date inputs - Airbnb style */}
              <div className="border border-[#b0b0b0] rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-[#b0b0b0]">
                    <div className="text-[10px] font-bold uppercase tracking-wide">Giris</div>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-[14px] border-none p-0 mt-1 bg-transparent" />
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide">Cikis</div>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-[14px] border-none p-0 mt-1 bg-transparent" />
                  </div>
                </div>
              </div>

              {startDate && endDate && !available && (
                <div className="bg-[#FFF0F0] border border-[#FFD0D0] text-[#C13515] text-[13px] p-3 rounded-xl mb-4">
                  Secilen tarihler musait degil.
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!startDate || !endDate || !available}
                className="w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:from-[#D70466] hover:via-[#D70466] hover:to-[#BD1E59] text-white py-[14px] rounded-xl font-semibold text-[16px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {!user ? "Giris Yap & Kirala" : "Kirala"}
              </button>

              {showLogin && !user && (
                <div className="mt-3 text-center">
                  <Link href="/giris" className="text-[14px] text-airbnb-rausch font-semibold underline">Kiralamak icin giris yapin</Link>
                </div>
              )}

              {days > 0 && available && (
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-[16px]">
                    <span className="text-airbnb-hof underline">{formatPrice(listing.pricePerDay)} x {days} gun</span>
                    <span className="text-airbnb-hof">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[16px]">
                    <span className="text-airbnb-hof underline">RentHub komisyonu</span>
                    <span className="text-airbnb-hof">{formatPrice(commission)}</span>
                  </div>
                  <hr className="border-[#ddd]" />
                  <div className="flex justify-between font-semibold text-[16px]">
                    <span>Toplam</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="bg-[#f7f7f7] rounded-xl p-4 text-[13px] text-airbnb-foggy mt-4">
                    <div className="flex items-start gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008A05" strokeWidth="1.5" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span>Odemeniz cikis tarihine kadar RentHub guvencesinde tutulur. %3 komisyon dusulerek {formatPrice(netPayout)} saticiya aktarilir.</span>
                    </div>
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
