export interface Property {
  id: string;
  title: string;
  description: string;
  type: "sale" | "rent" | "daily";
  propertyType: "apartment" | "villa" | "studio" | "penthouse" | "residence" | "detached";
  price: number;
  currency: string;
  pricePerNight?: number;
  location: {
    city: string;
    district: string;
    neighborhood?: string;
    lat: number;
    lng: number;
  };
  features: {
    rooms: string;
    bathrooms: number;
    area: number;
    floor?: number;
    totalFloors?: number;
    buildingAge?: number;
    furnished: boolean;
    balcony: boolean;
    parking: boolean;
    elevator: boolean;
    pool: boolean;
    garden: boolean;
    security: boolean;
    airConditioning: boolean;
    heating: string;
    wifi?: boolean;
    kitchen?: boolean;
    washer?: boolean;
    tv?: boolean;
  };
  images: string[];
  host?: {
    name: string;
    avatar: string;
    isSuperHost: boolean;
    responseRate: number;
    memberSince: string;
  };
  rating?: number;
  reviewCount?: number;
  dates?: {
    available: boolean;
    minStay: number;
    maxStay: number;
    checkIn: string;
    checkOut: string;
  };
  createdAt: string;
  isFavorite: boolean;
  views: number;
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Kadıköy Moda'da Deniz Manzaralı 3+1 Daire",
    description: "Moda sahiline yürüme mesafesinde, full deniz manzaralı, yenilenmiş 3+1 daire. Açık mutfak, geniş salon, her odada klima mevcuttur. Metro ve İDO'ya 5 dakika yürüme mesafesindedir.",
    type: "sale",
    propertyType: "apartment",
    price: 8500000,
    currency: "TL",
    location: { city: "İstanbul", district: "Kadıköy", neighborhood: "Moda", lat: 40.9862, lng: 29.0261 },
    features: { rooms: "3+1", bathrooms: 2, area: 145, floor: 5, totalFloors: 8, buildingAge: 3, furnished: false, balcony: true, parking: true, elevator: true, pool: false, garden: false, security: true, airConditioning: true, heating: "Doğalgaz" },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"],
    createdAt: "2026-03-28",
    isFavorite: false,
    views: 1245
  },
  {
    id: "2",
    title: "Beşiktaş'ta Boğaz Manzaralı Lüks Penthouse",
    description: "Beşiktaş'ın en prestijli lokasyonunda, 360 derece Boğaz manzaralı penthouse. Özel teras, jakuzi, akıllı ev sistemi. 24 saat güvenlik ve concierge hizmeti.",
    type: "sale",
    propertyType: "penthouse",
    price: 45000000,
    currency: "TL",
    location: { city: "İstanbul", district: "Beşiktaş", neighborhood: "Etiler", lat: 41.0802, lng: 29.0341 },
    features: { rooms: "5+2", bathrooms: 4, area: 350, floor: 15, totalFloors: 15, buildingAge: 1, furnished: true, balcony: true, parking: true, elevator: true, pool: true, garden: false, security: true, airConditioning: true, heating: "Merkezi" },
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"],
    createdAt: "2026-03-25",
    isFavorite: true,
    views: 3421
  },
  {
    id: "3",
    title: "Çeşme Alaçatı'da Taş Ev - Gecelik Kiralık",
    description: "Alaçatı'nın dar sokaklarında otantik taş ev. Avlulu, bahçeli, rüzgar sörfüne yakın konum. Tamamen restore edilmiş, modern konforla buluşan geleneksel mimari.",
    type: "daily",
    propertyType: "villa",
    price: 15000,
    currency: "TL",
    pricePerNight: 15000,
    location: { city: "İzmir", district: "Çeşme", neighborhood: "Alaçatı", lat: 38.2832, lng: 26.3775 },
    features: { rooms: "2+1", bathrooms: 2, area: 120, buildingAge: 80, furnished: true, balcony: false, parking: true, elevator: false, pool: false, garden: true, security: false, airConditioning: true, heating: "Klima", wifi: true, kitchen: true, washer: true, tv: true },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"],
    host: { name: "Ayşe Yılmaz", avatar: "AY", isSuperHost: true, responseRate: 98, memberSince: "2020" },
    rating: 4.92,
    reviewCount: 187,
    dates: { available: true, minStay: 2, maxStay: 30, checkIn: "14:00", checkOut: "11:00" },
    createdAt: "2026-03-20",
    isFavorite: false,
    views: 2890
  },
  {
    id: "4",
    title: "Bodrum Yalıkavak'ta Müstakil Villa",
    description: "Denize sıfır, özel havuzlu, 4 yatak odalı lüks villa. Geniş bahçe, BBQ alanı, denize özel iskelesi mevcuttur. Yalıkavak Marina'ya 5 dk mesafede.",
    type: "daily",
    propertyType: "villa",
    price: 35000,
    currency: "TL",
    pricePerNight: 35000,
    location: { city: "Muğla", district: "Bodrum", neighborhood: "Yalıkavak", lat: 37.1052, lng: 27.2902 },
    features: { rooms: "4+1", bathrooms: 3, area: 280, buildingAge: 5, furnished: true, balcony: true, parking: true, elevator: false, pool: true, garden: true, security: true, airConditioning: true, heating: "Klima", wifi: true, kitchen: true, washer: true, tv: true },
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    host: { name: "Mehmet Kaya", avatar: "MK", isSuperHost: true, responseRate: 100, memberSince: "2019" },
    rating: 4.97,
    reviewCount: 312,
    dates: { available: true, minStay: 3, maxStay: 14, checkIn: "15:00", checkOut: "10:00" },
    createdAt: "2026-03-15",
    isFavorite: true,
    views: 5620
  },
  {
    id: "5",
    title: "Ankara Çankaya'da Satılık 2+1 Residence",
    description: "Çankaya'nın merkezinde, AVM'ye ve metroya yakın, güvenlikli sitede 2+1 residence daire. Fitness, sauna ve yüzme havuzu gibi sosyal tesislere sahiptir.",
    type: "sale",
    propertyType: "residence",
    price: 4200000,
    currency: "TL",
    location: { city: "Ankara", district: "Çankaya", neighborhood: "Kızılay", lat: 39.9208, lng: 32.8541 },
    features: { rooms: "2+1", bathrooms: 1, area: 95, floor: 12, totalFloors: 25, buildingAge: 2, furnished: false, balcony: true, parking: true, elevator: true, pool: true, garden: false, security: true, airConditioning: true, heating: "Merkezi" },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
    createdAt: "2026-03-30",
    isFavorite: false,
    views: 876
  },
  {
    id: "6",
    title: "Antalya Kaleiçi'nde Tarihi Butik Ev - Gecelik",
    description: "Kaleiçi'nin kalbinde, tamamen restore edilmiş Osmanlı dönemi evi. Avlulu, otantik mobilyalı. Yat limanına ve Hadrian Kapısı'na yürüme mesafesinde.",
    type: "daily",
    propertyType: "detached",
    price: 8000,
    currency: "TL",
    pricePerNight: 8000,
    location: { city: "Antalya", district: "Muratpaşa", neighborhood: "Kaleiçi", lat: 36.8841, lng: 30.7056 },
    features: { rooms: "1+1", bathrooms: 1, area: 65, buildingAge: 150, furnished: true, balcony: false, parking: false, elevator: false, pool: false, garden: true, security: false, airConditioning: true, heating: "Klima", wifi: true, kitchen: true, washer: true, tv: true },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"],
    host: { name: "Zeynep Demir", avatar: "ZD", isSuperHost: false, responseRate: 92, memberSince: "2022" },
    rating: 4.78,
    reviewCount: 64,
    dates: { available: true, minStay: 1, maxStay: 60, checkIn: "13:00", checkOut: "11:00" },
    createdAt: "2026-03-22",
    isFavorite: false,
    views: 1530
  },
  {
    id: "7",
    title: "İzmir Karşıyaka'da Deniz Manzaralı 4+1",
    description: "Karşıyaka sahilinde, tramvaya yakın, geniş 4+1 daire. Amerikan mutfak, master yatak odası banyolu. Çocuk parkı ve otopark mevcut sitede.",
    type: "sale",
    propertyType: "apartment",
    price: 6800000,
    currency: "TL",
    location: { city: "İzmir", district: "Karşıyaka", lat: 38.4559, lng: 27.1094 },
    features: { rooms: "4+1", bathrooms: 2, area: 175, floor: 7, totalFloors: 12, buildingAge: 5, furnished: false, balcony: true, parking: true, elevator: true, pool: false, garden: false, security: true, airConditioning: true, heating: "Doğalgaz" },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
    createdAt: "2026-03-27",
    isFavorite: false,
    views: 934
  },
  {
    id: "8",
    title: "Kapadokya Peri Bacası Manzaralı Taş Ev",
    description: "Göreme'de peri bacalarına bakan eşsiz konumda butik taş ev. Terasta kahvaltı keyfi, balon turlarını izleme imkanı. Romantik tatil için ideal.",
    type: "daily",
    propertyType: "detached",
    price: 12000,
    currency: "TL",
    pricePerNight: 12000,
    location: { city: "Nevşehir", district: "Göreme", lat: 38.6431, lng: 34.8283 },
    features: { rooms: "1+1", bathrooms: 1, area: 55, buildingAge: 100, furnished: true, balcony: true, parking: true, elevator: false, pool: false, garden: false, security: false, airConditioning: true, heating: "Klima", wifi: true, kitchen: true, washer: false, tv: true },
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800"],
    host: { name: "Ali Özkan", avatar: "AÖ", isSuperHost: true, responseRate: 99, memberSince: "2018" },
    rating: 4.95,
    reviewCount: 524,
    dates: { available: true, minStay: 1, maxStay: 7, checkIn: "14:00", checkOut: "12:00" },
    createdAt: "2026-03-18",
    isFavorite: true,
    views: 8920
  },
  {
    id: "9",
    title: "Bursa Nilüfer'de Satılık Stüdyo Daire",
    description: "Üniversiteye yakın, yatırımlık stüdyo daire. Yeni bina, asansörlü, otoparklı. Öğrenci kiracılı, yatırım getirisi yüksek.",
    type: "sale",
    propertyType: "studio",
    price: 1850000,
    currency: "TL",
    location: { city: "Bursa", district: "Nilüfer", lat: 40.2128, lng: 28.8699 },
    features: { rooms: "1+0", bathrooms: 1, area: 42, floor: 3, totalFloors: 10, buildingAge: 0, furnished: true, balcony: true, parking: true, elevator: true, pool: false, garden: false, security: true, airConditioning: true, heating: "Doğalgaz" },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
    createdAt: "2026-04-01",
    isFavorite: false,
    views: 432
  },
  {
    id: "10",
    title: "Fethiye Ölüdeniz'de Havuzlu Villa - Haftalık",
    description: "Ölüdeniz plajına 10 dakika, özel havuzlu, bahçeli müstakil villa. Yamaç paraşütü alanına yakın. Doğa ile iç içe huzurlu tatil.",
    type: "daily",
    propertyType: "villa",
    price: 20000,
    currency: "TL",
    pricePerNight: 20000,
    location: { city: "Muğla", district: "Fethiye", neighborhood: "Ölüdeniz", lat: 36.5499, lng: 29.1157 },
    features: { rooms: "3+1", bathrooms: 2, area: 200, buildingAge: 8, furnished: true, balcony: true, parking: true, elevator: false, pool: true, garden: true, security: false, airConditioning: true, heating: "Klima", wifi: true, kitchen: true, washer: true, tv: true },
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    host: { name: "Fatma Arslan", avatar: "FA", isSuperHost: false, responseRate: 88, memberSince: "2021" },
    rating: 4.65,
    reviewCount: 98,
    dates: { available: true, minStay: 3, maxStay: 21, checkIn: "16:00", checkOut: "10:00" },
    createdAt: "2026-03-10",
    isFavorite: false,
    views: 3210
  },
  {
    id: "11",
    title: "Trabzon Ortahisar'da Satılık 3+1 Daire",
    description: "Boztepe manzaralı, şehir merkezine yakın, yeni yapılmış 3+1 daire. Karadeniz havasını evinizde yaşayın. Otopark ve sosyal tesis mevcut.",
    type: "sale",
    propertyType: "apartment",
    price: 3200000,
    currency: "TL",
    location: { city: "Trabzon", district: "Ortahisar", lat: 41.0015, lng: 39.7178 },
    features: { rooms: "3+1", bathrooms: 2, area: 130, floor: 4, totalFloors: 8, buildingAge: 1, furnished: false, balcony: true, parking: true, elevator: true, pool: false, garden: false, security: true, airConditioning: false, heating: "Doğalgaz" },
    images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
    createdAt: "2026-03-29",
    isFavorite: false,
    views: 567
  },
  {
    id: "12",
    title: "Sapanca Gölü Kenarında Bungalov - Gecelik",
    description: "Sapanca Gölü manzaralı, doğa ile iç içe ahşap bungalov. Şömine, jakuzi ve özel bahçe. Hafta sonu kaçamağı için mükemmel seçim.",
    type: "daily",
    propertyType: "detached",
    price: 6500,
    currency: "TL",
    pricePerNight: 6500,
    location: { city: "Sakarya", district: "Sapanca", lat: 40.6919, lng: 30.2697 },
    features: { rooms: "1+1", bathrooms: 1, area: 45, buildingAge: 3, furnished: true, balcony: true, parking: true, elevator: false, pool: false, garden: true, security: false, airConditioning: false, heating: "Şömine", wifi: true, kitchen: true, washer: false, tv: false },
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"],
    host: { name: "Hasan Çelik", avatar: "HÇ", isSuperHost: true, responseRate: 95, memberSince: "2020" },
    rating: 4.88,
    reviewCount: 203,
    dates: { available: true, minStay: 1, maxStay: 5, checkIn: "14:00", checkOut: "11:00" },
    createdAt: "2026-03-12",
    isFavorite: false,
    views: 4150
  }
];

export const cities = [
  "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Muğla",
  "Trabzon", "Nevşehir", "Sakarya", "Mersin", "Eskişehir", "Konya"
];

export const propertyTypes = [
  { value: "apartment", label: "Daire" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Stüdyo" },
  { value: "penthouse", label: "Penthouse" },
  { value: "residence", label: "Residence" },
  { value: "detached", label: "Müstakil" },
];

export const roomOptions = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "5+2"];

export function formatPrice(price: number, currency: string = "TL"): string {
  return new Intl.NumberFormat("tr-TR").format(price) + " " + currency;
}
