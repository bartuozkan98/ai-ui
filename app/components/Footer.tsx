import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a27] text-gray-400">
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
          <div>
            <h4 className="text-white font-semibold mb-3">Destek</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Yardım Merkezi</a></li>
              <li><a href="#" className="hover:text-white">Güvenlik</a></li>
              <li><a href="#" className="hover:text-white">İptal Politikası</a></li>
              <li><a href="#" className="hover:text-white">İletişim</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Kiraya Ver</h4>
            <ul className="space-y-2">
              <li><Link href="/ilan-ver" className="hover:text-white">İlan Ver</Link></li>
              <li><a href="#" className="hover:text-white">Nasıl Çalışır?</a></li>
              <li><a href="#" className="hover:text-white">Komisyon Bilgisi</a></li>
              <li><a href="#" className="hover:text-white">Güvenli Ödeme</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Keşfet</h4>
            <ul className="space-y-2">
              <li><Link href="/evler" className="hover:text-white">Kiralık Evler</Link></li>
              <li><Link href="/arabalar" className="hover:text-white">Kiralık Arabalar</Link></li>
              <li><Link href="/motorlar" className="hover:text-white">Kiralık Motorlar</Link></li>
              <li><Link href="/tekneler" className="hover:text-white">Kiralık Tekneler</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">RentHub</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Kariyer</a></li>
              <li><a href="#" className="hover:text-white">Basında Biz</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-airbnb-rausch text-white px-2 py-0.5 rounded font-bold text-[13px]">RentHub</span>
              <span className="text-[12px] text-gray-500">&copy; 2026 RentHub. Tüm hakları saklıdır.</span>
            </div>
            <div className="text-[12px] text-gray-500">Tüm kiralamalarda %3 komisyon uygulanır. Ödemeler güvende tutulur.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
