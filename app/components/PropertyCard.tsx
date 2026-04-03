"use client";
import { useState } from "react";
import Link from "next/link";
import { Listing, formatPrice, categoryLabels } from "../data/properties";

export default function PropertyCard({ listing }: { listing: Listing }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFav, setIsFav] = useState(listing.isFavorite);

  const nextImage = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentImage((p) => (p + 1) % listing.images.length); };
  const prevImage = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentImage((p) => (p - 1 + listing.images.length) % listing.images.length); };
  const toggleFav = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsFav(!isFav); };

  const subtitle = (() => {
    switch (listing.category) {
      case "house": return `${listing.houseDetails?.bedrooms} yatak odası · ${listing.houseDetails?.bathrooms} banyo · ${listing.houseDetails?.area} m²`;
      case "car": return `${listing.carDetails?.brand} ${listing.carDetails?.model} · ${listing.carDetails?.year} · ${listing.carDetails?.transmission === "automatic" ? "Otomatik" : "Manuel"}`;
      case "motorcycle": return `${listing.motorcycleDetails?.brand} ${listing.motorcycleDetails?.model} · ${listing.motorcycleDetails?.engineCC}cc`;
      case "boat": return `${listing.boatDetails?.boatType} · ${listing.boatDetails?.length} ft · ${listing.boatDetails?.maxPassengers} kişi`;
      default: return "";
    }
  })();

  return (
    <Link href={`/ilan/${listing.id}`}>
      <div className="airbnb-card group cursor-pointer">
        <div className="relative aspect-airbnb overflow-hidden rounded-[12px]">
          <img src={listing.images[currentImage]} alt={listing.title} className="w-full h-full object-cover" />

          <button onClick={toggleFav} className="absolute top-3 right-3 z-10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFav ? "#FF385C" : "rgba(0,0,0,0.5)"} stroke="white" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <div className="absolute top-3 left-3 bg-white text-airbnb-hof text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm">
            {categoryLabels[listing.category]}
          </div>

          {listing.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[5px]">
                {listing.images.map((_, i) => <span key={i} className={`dot ${i === currentImage ? "dot-active" : ""}`} />)}
              </div>
            </>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-[15px] font-semibold text-airbnb-hof line-clamp-1">
              {listing.location.city}, {listing.location.district}
            </h3>
            {listing.rating && (
              <span className="flex items-center gap-1 text-[14px] shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                {listing.rating}
              </span>
            )}
          </div>
          <p className="text-[14px] text-airbnb-foggy line-clamp-1 mt-[2px]">{subtitle}</p>
          <p className="text-[14px] text-airbnb-foggy line-clamp-1">{listing.title}</p>
          <p className="mt-[6px]">
            <span className="text-[15px] font-semibold text-airbnb-hof">{formatPrice(listing.pricePerDay, listing.currency)}</span>
            <span className="text-[14px] text-airbnb-hof font-normal"> / gün</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
