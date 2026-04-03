"use client";
import { useState } from "react";
import Link from "next/link";
import { Listing, formatPrice, categoryLabels } from "../data/properties";

export default function PropertyCard({ listing }: { listing: Listing }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFav, setIsFav] = useState(listing.isFavorite);
  const [imgLoaded, setImgLoaded] = useState(false);

  const nextImage = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentImage((p) => (p + 1) % listing.images.length); };
  const prevImage = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentImage((p) => (p - 1 + listing.images.length) % listing.images.length); };
  const toggleFav = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsFav(!isFav); };

  const subtitle = (() => {
    switch (listing.category) {
      case "house": return `${listing.houseDetails?.bedrooms || 0} yatak odasi - ${listing.houseDetails?.bathrooms || 0} banyo - ${listing.houseDetails?.maxGuests || 0} misafir`;
      case "car": return `${listing.carDetails?.brand} ${listing.carDetails?.model} - ${listing.carDetails?.year}`;
      case "motorcycle": return `${listing.motorcycleDetails?.brand} ${listing.motorcycleDetails?.model} - ${listing.motorcycleDetails?.engineCC}cc`;
      case "boat": return `${listing.boatDetails?.boatType} - ${listing.boatDetails?.length} ft - ${listing.boatDetails?.maxPassengers} kisi`;
      default: return "";
    }
  })();

  return (
    <Link href={`/ilan/${listing.id}`} className="group">
      <div className="airbnb-card">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-xl">
          {!imgLoaded && <div className="absolute inset-0 skeleton rounded-xl" />}
          <img
            src={listing.images[currentImage]}
            alt={listing.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
          />

          {/* Favorite button */}
          <button onClick={toggleFav} className="absolute top-3 right-3 z-10 drop-shadow-sm">
            <svg width="24" height="24" viewBox="0 0 32 32" fill={isFav ? "#FF385C" : "rgba(0,0,0,0.5)"} stroke="white" strokeWidth="2">
              <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" />
            </svg>
          </button>

          {/* Image carousel arrows */}
          {listing.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.18)" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="#222"><path d="M10.8 2.2L5 8l5.8 5.8" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.18)" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="#222"><path d="M5.2 2.2L11 8l-5.8 5.8" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[5px]">
                {listing.images.map((_, i) => (
                  <span key={i} className={`w-[6px] h-[6px] rounded-full transition-all ${i === currentImage ? "bg-white" : "bg-white/60"}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-[15px] font-semibold text-airbnb-hof leading-tight line-clamp-1">
              {listing.location.city}, {listing.location.district}
            </h3>
            {listing.rating && (
              <span className="flex items-center gap-1 text-[15px] shrink-0">
                <svg width="12" height="12" viewBox="0 0 32 32" fill="#222"><path d="M15.1 1.58l-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06L16 25.76l8.61 5.19a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.54-1.74l-9.86-1.27-4.13-8.88a1 1 0 0 0-1.79 0z"/></svg>
                {listing.rating}
              </span>
            )}
          </div>
          <p className="text-[15px] text-airbnb-foggy line-clamp-1 mt-[1px]">{subtitle}</p>
          <p className="text-[15px] text-airbnb-foggy line-clamp-1">{listing.title}</p>
          <p className="mt-[6px]">
            <span className="text-[15px] font-semibold text-airbnb-hof">{formatPrice(listing.pricePerDay, listing.currency)}</span>
            <span className="text-[15px] text-airbnb-hof font-normal"> / gece</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
