import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-sahi-dark text-gray-300">
      {/* Main footer */}
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-3">Destek</h4>
            <ul className="space-y-2 text-[13px]">
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Yardım Merkezi</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Güvenlik Bilgileri</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">İptal Seçenekleri</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">İletişim</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-3">Ev Sahipliği</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/ilan-ver" className="hover:text-sahi-yellow transition-colors">İlan Ver</Link></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Ev Sahipliği Rehberi</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Güvenli Kiralama</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Kaynaklar</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-3">Emlakjet</h4>
            <ul className="space-y-2 text-[13px]">
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Kariyer</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Basında Biz</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-3">Keşfet</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/satilik" className="hover:text-sahi-yellow transition-colors">Satılık Emlak</Link></li>
              <li><Link href="/kiralik" className="hover:text-sahi-yellow transition-colors">Kiralık Emlak</Link></li>
              <li><Link href="/kiralik?type=daily" className="hover:text-sahi-yellow transition-colors">Günlük Kiralık</Link></li>
              <li><a href="#" className="hover:text-sahi-yellow transition-colors">Yeni Projeler</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-sahi-yellow text-sahi-dark px-2 py-0.5 rounded font-bold text-[14px]">emlakjet</div>
            <span className="text-[12px] text-gray-500">&copy; 2026 Emlakjet. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
            <span className="text-gray-600">·</span>
            <a href="#" className="hover:text-white transition-colors">Şartlar</a>
            <span className="text-gray-600">·</span>
            <a href="#" className="hover:text-white transition-colors">Site Haritası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
