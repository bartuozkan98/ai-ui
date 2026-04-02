import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h4 className="text-white font-semibold mb-4">EmlakJet</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kariyer</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Basında Biz</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Keşfet</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/satilik" className="hover:text-white transition-colors">Satılık Emlak</Link></li>
              <li><Link href="/kiralik" className="hover:text-white transition-colors">Kiralık Emlak</Link></li>
              <li><Link href="/kiralik?type=daily" className="hover:text-white transition-colors">Günlük Kiralık</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Yeni Projeler</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ev Sahiplerine</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ilan-ver" className="hover:text-white transition-colors">İlan Ver</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Ev Sahipliği Rehberi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Fiyat Önerileri</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Güvenli Kiralama</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Destek</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Güvenlik</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">İptal Politikası</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-white font-bold">EmlakJet</span>
            <span className="text-gray-500 text-sm ml-2">&copy; 2026</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Gizlilik</Link>
            <span className="text-gray-600">·</span>
            <Link href="#" className="hover:text-white transition-colors">Şartlar</Link>
            <span className="text-gray-600">·</span>
            <Link href="#" className="hover:text-white transition-colors">Site Haritası</Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {["instagram", "twitter", "facebook", "youtube"].map((social) => (
              <a key={social} href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <span className="text-xs text-gray-400 uppercase">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
