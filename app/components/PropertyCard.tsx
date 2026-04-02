"use client";

import { useState } from "react";
import Link from "next/link";
import { Property, formatPrice } from "../data/properties";

interface PropertyCardProps {
  property: Property;
  layout?: "grid" | "list";
}

export default function PropertyCard({ property, layout = "grid" }: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFav, setIsFav] = useState(property.isFavorite);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };
  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsFav(!isFav);
  };

  const typeLabel = property.type === "sale" ? "Satılık" : property.type === "daily" ? "Günlük Kiralık" : "Kiralık";

  // Sahibinden-style list view
  if (layout === "list") {
    return (
      <Link href={`/ilan/${property.id}`}>
        <div className="bg-white border border-[#e0e0e0] rounded overflow-hidden sahi-row flex flex-col sm:flex-row cursor-pointer">
          <div className="relative w-full sm:w-[240px] h-[180px] sm:h-[160px] shrink-0 overflow-hidden">
            <img src={property.images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 bg-sahi-blue text-white text-[11px] font-bold px-2 py-0.5 rounded">{typeLabel}</span>
            <button onClick={toggleFav} className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "#FF385C" : "none"} stroke={isFav ? "#FF385C" : "#666"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <div className="text-[12px] text-airbnb-foggy mb-0.5">
                {property.location.city} / {property.location.district}
                {property.location.neighborhood && ` / ${property.location.neighborhood}`}
              </div>
              <h3 className="text-[14px] font-semibold text-airbnb-hof line-clamp-1">{property.title}</h3>
              <p className="text-[12px] text-airbnb-foggy line-clamp-2 mt-1">{property.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-[#666]">
                <span>{property.features.rooms}</span>
                <span className="text-[#ddd]">|</span>
                <span>{property.features.area} m²</span>
                <span className="text-[#ddd]">|</span>
                <span>{property.features.bathrooms} Banyo</span>
                {property.features.floor && <>
                  <span className="text-[#ddd]">|</span>
                  <span>Kat {property.features.floor}</span>
                </>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0f0f0]">
              <span className="price-red text-[16px]">
                {formatPrice(property.price, property.currency)}
                {property.type === "daily" && <span className="text-[12px] text-airbnb-foggy font-normal"> / gece</span>}
              </span>
              {property.rating && (
                <span className="flex items-center gap-1 text-[13px]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  {property.rating}
                  <span className="text-airbnb-foggy">({property.reviewCount})</span>
                </span>
              )}
              <span className="text-[11px] text-[#999]">{property.createdAt}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Airbnb-style grid card
  return (
    <Link href={`/ilan/${property.id}`}>
      <div className="airbnb-card group cursor-pointer">
        {/* Image - Airbnb aspect ratio */}
        <div className="relative aspect-airbnb overflow-hidden rounded-[12px]">
          <img
            src={property.images[currentImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />

          {/* Favorite - Airbnb style */}
          <button onClick={toggleFav} className="absolute top-3 right-3 z-10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFav ? "#FF385C" : "rgba(0,0,0,0.5)"} stroke="white" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* SuperHost badge */}
          {property.host?.isSuperHost && (
            <div className="absolute top-3 left-3 bg-white text-airbnb-hof text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm">
              Süper Ev Sahibi
            </div>
          )}

          {/* Type badge */}
          {!property.host?.isSuperHost && (
            <div className="absolute top-3 left-3 bg-white text-airbnb-hof text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm">
              {typeLabel}
            </div>
          )}

          {/* Image nav arrows - Airbnb style */}
          {property.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-105">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-105">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[5px]">
                {property.images.map((_, i) => (
                  <span key={i} className={`dot ${i === currentImage ? "dot-active" : ""}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Text content - Airbnb style */}
        <div className="mt-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-[15px] font-semibold text-airbnb-hof line-clamp-1">
              {property.location.city}, {property.location.district}
            </h3>
            {property.rating && (
              <span className="flex items-center gap-1 text-[14px] shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                {property.rating}
              </span>
            )}
          </div>
          <p className="text-[14px] text-airbnb-foggy line-clamp-1 mt-[2px]">{property.features.rooms} · {property.features.area} m²</p>
          <p className="text-[14px] text-airbnb-foggy line-clamp-1">{property.title}</p>
          <p className="mt-[6px]">
            <span className="text-[15px] font-semibold text-airbnb-hof">{formatPrice(property.price, property.currency)}</span>
            {property.type === "daily" && <span className="text-[14px] text-airbnb-hof font-normal"> / gece</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
