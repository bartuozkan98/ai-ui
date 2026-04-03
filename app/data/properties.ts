// ============ TYPES ============

export type Category = "house" | "car" | "motorcycle" | "boat";

export interface Listing {
  id: string;
  userId: string;
  category: Category;
  title: string;
  description: string;
  pricePerDay: number;
  currency: string;
  location: { city: string; district: string };
  images: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  isFavorite: boolean;
  views: number;
  // Availability: dates that are booked [startDate, endDate]
  bookedDates: { start: string; end: string }[];
  // Category-specific details
  houseDetails?: HouseDetails;
  carDetails?: CarDetails;
  motorcycleDetails?: MotorcycleDetails;
  boatDetails?: BoatDetails;
  // Owner info
  ownerName: string;
  ownerAvatar: string;
}

export interface HouseDetails {
  propertyType: string; // apartment, villa, studio, detached
  accommodationType: string; // entire, private_room, shared_room
  area: number; // m²
  bedrooms: number;
  beds: number;
  livingRooms: number;
  bathrooms: number;
  kitchens: number;
  maxGuests: number;
  floor?: number;
  totalFloors?: number;
  buildingAge?: number;
  // Amenities
  pool: boolean;
  garden: boolean;
  parking: boolean;
  balcony: boolean;
  terrace: boolean;
  airConditioning: boolean;
  heating: boolean;
  wifi: boolean;
  tv: boolean;
  washer: boolean;
  dryer: boolean;
  dishwasher: boolean;
  iron: boolean;
  elevator: boolean;
  security: boolean;
  generator: boolean;
  seaView: boolean;
  mountainView: boolean;
  cityView: boolean;
  // Rules
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  checkIn: string;
  checkOut: string;
}

export interface CarDetails {
  brand: string;
  model: string;
  year: number;
  fuelType: string; // gasoline, diesel, electric, hybrid, lpg
  transmission: string; // manual, automatic
  engineSize: string; // e.g. "1.6L", "2.0L"
  seats: number;
  doors: number;
  color: string;
  mileage: number;
  trunkSize: string; // small, medium, large
  hasAC: boolean;
  hasGPS: boolean;
  hasBluetooth: boolean;
  hasBackupCamera: boolean;
  hasCruiseControl: boolean;
  hasUSB: boolean;
  hasChildSeat: boolean;
  insuranceIncluded: boolean;
  dailyKmLimit: number;
  minDriverAge: number;
  minLicenseYears: number;
}

export interface MotorcycleDetails {
  brand: string;
  model: string;
  year: number;
  engineCC: number;
  type: string; // sport, touring, cruiser, naked, scooter, enduro, adventure
  color: string;
  mileage: number;
  fuelCapacity: number; // liters
  seatHeight: number; // cm
  hasABS: boolean;
  hasTractionControl: boolean;
  hasQuickshifter: boolean;
  hasHeatedGrips: boolean;
  helmetIncluded: boolean;
  glovesIncluded: boolean;
  lockIncluded: boolean;
  minLicenseType: string; // A1, A2, A
}

export interface BoatDetails {
  boatType: string; // sailboat, motorboat, yacht, catamaran, gulet, speedboat, jetski
  brand: string;
  model: string;
  year: number;
  length: number; // feet
  maxPassengers: number;
  cabins: number;
  beds: number;
  bathrooms: number;
  enginePower: number; // HP
  fuelType: string;
  captainIncluded: boolean;
  crewIncluded: boolean;
  hasGPS: boolean;
  hasRadar: boolean;
  hasSonar: boolean;
  hasAC: boolean;
  hasKitchen: boolean;
  hasBBQ: boolean;
  waterToys: string[]; // jet ski, paddle board, snorkel, etc.
  fishingEquipment: boolean;
}

export interface Booking {
  id: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  commission: number; // 3%
  netPayout: number; // 97%
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  createdAt: string;
  category: Category;
  listingTitle: string;
}

// ============ HELPERS ============

export const COMMISSION_RATE = 0.03;

export function formatPrice(price: number, currency: string = "TL"): string {
  return new Intl.NumberFormat("tr-TR").format(price) + " " + currency;
}

export function calculateCommission(totalPrice: number) {
  const commission = Math.round(totalPrice * COMMISSION_RATE);
  const netPayout = totalPrice - commission;
  return { commission, netPayout };
}

export const cities = [
  "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Muğla",
  "Trabzon", "Nevşehir", "Sakarya", "Mersin", "Eskişehir", "Konya",
  "Bodrum", "Fethiye", "Çeşme", "Kaş", "Marmaris", "Kuşadası"
];

export const categoryLabels: Record<Category, string> = {
  house: "Ev",
  car: "Araba",
  motorcycle: "Motosiklet",
  boat: "Tekne",
};

export const categoryIcons: Record<Category, string> = {
  house: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  car: "M5 17h14M5 17a2 2 0 0 1-2-2v-4l2-5h10l2 5v4a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0",
  motorcycle: "M5 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM15 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM7 16h8M5.5 11l2-4h4l3 4M11 7l5 4h3",
  boat: "M2 20l2-3c2-2 4-2 6 0s4 2 6 0 4-2 6 0l2 3M4 17V9l8-5 8 5v8",
};

// ============ DEMO DATA ============

export const demoListings: Listing[] = [
  // HOUSES
  {
    id: "h1", userId: "demo_owner1", category: "house",
    title: "Kadıköy Moda'da Deniz Manzaralı 2+1 Daire",
    description: "Moda sahiline yürüme mesafesinde, full deniz manzaralı, yenilenmiş daire. Açık mutfak, geniş salon, her odada klima. Metro ve vapur iskelesine 5 dk.",
    pricePerDay: 3500, currency: "TL",
    location: { city: "İstanbul", district: "Kadıköy" },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"],
    rating: 4.92, reviewCount: 187, createdAt: "2026-03-28", isFavorite: false, views: 1245, bookedDates: [],
    ownerName: "Ayşe Yılmaz", ownerAvatar: "AY",
    houseDetails: { propertyType: "apartment", accommodationType: "entire", area: 95, bedrooms: 2, beds: 3, livingRooms: 1, bathrooms: 1, kitchens: 1, maxGuests: 4, floor: 5, totalFloors: 8, buildingAge: 3, pool: false, garden: false, parking: true, balcony: true, terrace: false, airConditioning: true, heating: true, wifi: true, tv: true, washer: true, dryer: false, dishwasher: true, iron: true, elevator: true, security: true, generator: false, seaView: true, mountainView: false, cityView: true, petsAllowed: false, smokingAllowed: false, partiesAllowed: false, checkIn: "14:00", checkOut: "11:00" },
  },
  {
    id: "h2", userId: "demo_owner2", category: "house",
    title: "Bodrum Yalıkavak'ta Özel Havuzlu Villa",
    description: "Denize sıfır, özel havuzlu, 4 yatak odalı lüks villa. Geniş bahçe, BBQ alanı, özel iskele. Yalıkavak Marina'ya 5 dk.",
    pricePerDay: 25000, currency: "TL",
    location: { city: "Muğla", district: "Bodrum" },
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    rating: 4.97, reviewCount: 312, createdAt: "2026-03-15", isFavorite: true, views: 5620, bookedDates: [{ start: "2026-04-10", end: "2026-04-17" }],
    ownerName: "Mehmet Kaya", ownerAvatar: "MK",
    houseDetails: { propertyType: "villa", accommodationType: "entire", area: 280, bedrooms: 4, beds: 6, livingRooms: 2, bathrooms: 3, kitchens: 1, maxGuests: 8, buildingAge: 5, pool: true, garden: true, parking: true, balcony: true, terrace: true, airConditioning: true, heating: true, wifi: true, tv: true, washer: true, dryer: true, dishwasher: true, iron: true, elevator: false, security: true, generator: true, seaView: true, mountainView: false, cityView: false, petsAllowed: true, smokingAllowed: false, partiesAllowed: false, checkIn: "15:00", checkOut: "10:00" },
  },
  {
    id: "h3", userId: "demo_owner3", category: "house",
    title: "Kapadokya Peri Bacası Manzaralı Taş Ev",
    description: "Göreme'de peri bacalarına bakan eşsiz butik taş ev. Terasta kahvaltı, balon turlarını izleme imkanı. Romantik tatil için ideal.",
    pricePerDay: 8000, currency: "TL",
    location: { city: "Nevşehir", district: "Göreme" },
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800"],
    rating: 4.95, reviewCount: 524, createdAt: "2026-03-18", isFavorite: true, views: 8920, bookedDates: [],
    ownerName: "Ali Özkan", ownerAvatar: "AÖ",
    houseDetails: { propertyType: "detached", accommodationType: "entire", area: 65, bedrooms: 1, beds: 1, livingRooms: 1, bathrooms: 1, kitchens: 1, maxGuests: 2, buildingAge: 100, pool: false, garden: true, parking: true, balcony: true, terrace: true, airConditioning: true, heating: true, wifi: true, tv: true, washer: false, dryer: false, dishwasher: false, iron: false, elevator: false, security: false, generator: false, seaView: false, mountainView: true, cityView: false, petsAllowed: false, smokingAllowed: false, partiesAllowed: false, checkIn: "14:00", checkOut: "12:00" },
  },
  // CARS
  {
    id: "c1", userId: "demo_owner1", category: "car",
    title: "2024 BMW 320i - Otomatik, Full Paket",
    description: "Bakımlı, temiz, full paket BMW 320i. Deri koltuk, sunroof, 360 kamera. Günlük 300km limit, sigorta dahil.",
    pricePerDay: 4500, currency: "TL",
    location: { city: "İstanbul", district: "Beşiktaş" },
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800"],
    rating: 4.88, reviewCount: 95, createdAt: "2026-03-20", isFavorite: false, views: 3200, bookedDates: [],
    ownerName: "Ayşe Yılmaz", ownerAvatar: "AY",
    carDetails: { brand: "BMW", model: "320i", year: 2024, fuelType: "gasoline", transmission: "automatic", engineSize: "2.0L", seats: 5, doors: 4, color: "Beyaz", mileage: 15000, trunkSize: "large", hasAC: true, hasGPS: true, hasBluetooth: true, hasBackupCamera: true, hasCruiseControl: true, hasUSB: true, hasChildSeat: false, insuranceIncluded: true, dailyKmLimit: 300, minDriverAge: 21, minLicenseYears: 2 },
  },
  {
    id: "c2", userId: "demo_owner4", category: "car",
    title: "2023 Volkswagen Golf - Ekonomik, Konforlu",
    description: "Yakıt cimrisi VW Golf. Şehir içi ve şehirler arası kullanıma uygun. Temiz, bakımlı araç.",
    pricePerDay: 2200, currency: "TL",
    location: { city: "Ankara", district: "Çankaya" },
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800"],
    rating: 4.75, reviewCount: 63, createdAt: "2026-03-22", isFavorite: false, views: 1850, bookedDates: [],
    ownerName: "Fatma Arslan", ownerAvatar: "FA",
    carDetails: { brand: "Volkswagen", model: "Golf", year: 2023, fuelType: "diesel", transmission: "automatic", engineSize: "1.6L", seats: 5, doors: 4, color: "Gri", mileage: 28000, trunkSize: "medium", hasAC: true, hasGPS: false, hasBluetooth: true, hasBackupCamera: true, hasCruiseControl: true, hasUSB: true, hasChildSeat: false, insuranceIncluded: true, dailyKmLimit: 250, minDriverAge: 21, minLicenseYears: 1 },
  },
  // MOTORCYCLES
  {
    id: "m1", userId: "demo_owner2", category: "motorcycle",
    title: "2023 Honda CB650R - Naked Sport",
    description: "Honda CB650R, 649cc inline-4 motor. Mükemmel şehir içi ve viraj performansı. Kask dahil.",
    pricePerDay: 1800, currency: "TL",
    location: { city: "İzmir", district: "Alsancak" },
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800"],
    rating: 4.90, reviewCount: 42, createdAt: "2026-03-25", isFavorite: false, views: 2100, bookedDates: [],
    ownerName: "Mehmet Kaya", ownerAvatar: "MK",
    motorcycleDetails: { brand: "Honda", model: "CB650R", year: 2023, engineCC: 649, type: "naked", color: "Siyah", mileage: 8000, fuelCapacity: 15, seatHeight: 810, hasABS: true, hasTractionControl: true, hasQuickshifter: false, hasHeatedGrips: false, helmetIncluded: true, glovesIncluded: false, lockIncluded: true, minLicenseType: "A2" },
  },
  {
    id: "m2", userId: "demo_owner5", category: "motorcycle",
    title: "2024 Vespa GTS 300 - Klasik İtalyan Scooter",
    description: "İkonik Vespa GTS 300. Şehir içi ulaşım için ideal. 2 kask dahil. Kolay kullanım.",
    pricePerDay: 900, currency: "TL",
    location: { city: "Antalya", district: "Muratpaşa" },
    images: ["https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800", "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800"],
    rating: 4.82, reviewCount: 78, createdAt: "2026-03-28", isFavorite: false, views: 1540, bookedDates: [],
    ownerName: "Zeynep Demir", ownerAvatar: "ZD",
    motorcycleDetails: { brand: "Vespa", model: "GTS 300", year: 2024, engineCC: 278, type: "scooter", color: "Yeşil", mileage: 3000, fuelCapacity: 8, seatHeight: 790, hasABS: true, hasTractionControl: true, hasQuickshifter: false, hasHeatedGrips: false, helmetIncluded: true, glovesIncluded: false, lockIncluded: true, minLicenseType: "A2" },
  },
  // BOATS
  {
    id: "b1", userId: "demo_owner3", category: "boat",
    title: "12m Gulet - Kaptan Dahil, 8 Kişilik",
    description: "Geleneksel Türk guleti ile mavi tur deneyimi. 4 kabin, kaptan dahil. Bodrum koylarını keşfedin.",
    pricePerDay: 35000, currency: "TL",
    location: { city: "Muğla", district: "Bodrum" },
    images: ["https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"],
    rating: 4.93, reviewCount: 156, createdAt: "2026-03-10", isFavorite: true, views: 6700, bookedDates: [{ start: "2026-04-05", end: "2026-04-12" }],
    ownerName: "Ali Özkan", ownerAvatar: "AÖ",
    boatDetails: { boatType: "gulet", brand: "Özel Yapım", model: "Klasik Gulet", year: 2018, length: 40, maxPassengers: 8, cabins: 4, beds: 4, bathrooms: 2, enginePower: 250, fuelType: "diesel", captainIncluded: true, crewIncluded: true, hasGPS: true, hasRadar: true, hasSonar: false, hasAC: true, hasKitchen: true, hasBBQ: true, waterToys: ["Kano", "Şnorkel", "Sup Board"], fishingEquipment: true },
  },
  {
    id: "b2", userId: "demo_owner5", category: "boat",
    title: "Jet Ski Yamaha FX - Saatlik/Günlük",
    description: "Yamaha FX Cruiser HO jet ski. Heyecan dolu bir deniz deneyimi. Yelek dahil.",
    pricePerDay: 8000, currency: "TL",
    location: { city: "Antalya", district: "Kemer" },
    images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", "https://images.unsplash.com/photo-1559070169-a3077159ee16?w=800"],
    rating: 4.70, reviewCount: 89, createdAt: "2026-03-30", isFavorite: false, views: 4300, bookedDates: [],
    ownerName: "Zeynep Demir", ownerAvatar: "ZD",
    boatDetails: { boatType: "jetski", brand: "Yamaha", model: "FX Cruiser HO", year: 2024, length: 12, maxPassengers: 3, cabins: 0, beds: 0, bathrooms: 0, enginePower: 180, fuelType: "gasoline", captainIncluded: false, crewIncluded: false, hasGPS: false, hasRadar: false, hasSonar: false, hasAC: false, hasKitchen: false, hasBBQ: false, waterToys: [], fishingEquipment: false },
  },
];

// ============ LISTING STORAGE ============

export function getListings(): Listing[] {
  if (typeof window === "undefined") return demoListings;
  const custom = JSON.parse(localStorage.getItem("renthub_listings") || "[]");
  return [...demoListings, ...custom];
}

export function addListing(listing: Listing) {
  const custom = JSON.parse(localStorage.getItem("renthub_listings") || "[]");
  custom.push(listing);
  localStorage.setItem("renthub_listings", JSON.stringify(custom));
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("renthub_bookings") || "[]");
}

export function addBooking(booking: Booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem("renthub_bookings", JSON.stringify(bookings));
  // Also mark dates as booked on the listing
  const listings = JSON.parse(localStorage.getItem("renthub_listings") || "[]");
  const idx = listings.findIndex((l: Listing) => l.id === booking.listingId);
  if (idx >= 0) {
    listings[idx].bookedDates = listings[idx].bookedDates || [];
    listings[idx].bookedDates.push({ start: booking.startDate, end: booking.endDate });
    localStorage.setItem("renthub_listings", JSON.stringify(listings));
  }
}

export function isDateAvailable(listing: Listing, start: string, end: string): boolean {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  for (const booked of listing.bookedDates) {
    const bs = new Date(booked.start).getTime();
    const be = new Date(booked.end).getTime();
    if (s < be && e > bs) return false; // overlap
  }
  return true;
}
