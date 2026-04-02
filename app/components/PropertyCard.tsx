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
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
  };

  const typeLabel = property.type === "sale" ? "Satılık" : property.type === "daily" ? "Günlük" : "Kiralık";
  const typeBg = property.type === "sale" ? "bg-secondary" : property.type === "daily" ? "bg-primary" : "bg-success";

  if (layout === "list") {
    return (
      <Link href={`/ilan/${property.id}`}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-72 h-48 sm:h-auto shrink-0">
            <img
              src={property.images[currentImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <span className={`absolute top-3 left-3 ${typeBg} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
              {typeLabel}
            </span>
            <button onClick={toggleFav} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "#ff385c" : "none"} stroke={isFav ? "#ff385c" : "#333"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {property.location.city}, {property.location.district}
                {property.location.neighborhood && `, ${property.location.neighborhood}`}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{property.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                  {property.features.rooms}
                </span>
                <span>{property.features.area} m²</span>
                <span>{property.features.bathrooms} Banyo</span>
                {property.features.floor && <span>Kat {property.features.floor}/{property.features.totalFloors}</span>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div>
                <span className="text-lg font-bold text-primary">{formatPrice(property.price, property.currency)}</span>
                {property.type === "daily" && <span className="text-xs text-gray-500 ml-1">/ gece</span>}
              </div>
              {property.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-500">({property.reviewCount})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid layout
  return (
    <Link href={`/ilan/${property.id}`}>
      <div className="bg-white rounded-xl overflow-hidden card-hover group">
        {/* Image carousel */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <img
            src={property.images[currentImage]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay badges */}
          <span className={`absolute top-3 left-3 ${typeBg} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
            {typeLabel}
          </span>

          {/* Favorite */}
          <button onClick={toggleFav} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "#ff385c" : "none"} stroke={isFav ? "#ff385c" : "white"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* SuperHost badge */}
          {property.host?.isSuperHost && (
            <span className="absolute top-3 left-[5.5rem] badge-superhost shadow-sm">Süper Ev Sahibi</span>
          )}

          {/* Image navigation */}
          {property.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {property.images.map((_, i) => (
                  <span key={i} className={`rounded-full transition-all ${i === currentImage ? "dot-active" : "dot-inactive"}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="pt-3 pb-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] text-gray-900 line-clamp-1">
              {property.location.city}, {property.location.district}
            </h3>
            {property.rating && (
              <div className="flex items-center gap-1 text-sm shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" stroke="#222" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                <span className="font-medium">{property.rating}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{property.title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{property.features.rooms}</span>
            <span>·</span>
            <span>{property.features.area} m²</span>
            <span>·</span>
            <span>{property.features.bathrooms} Banyo</span>
          </div>
          <div className="mt-2">
            <span className="font-bold text-gray-900">{formatPrice(property.price, property.currency)}</span>
            {property.type === "daily" && <span className="text-sm text-gray-500 font-normal"> / gece</span>}
            {property.type === "sale" && <span className="text-xs text-gray-400 font-normal ml-1"></span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
