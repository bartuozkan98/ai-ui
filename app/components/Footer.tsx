import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f7f7f7] border-t border-[#ddd]">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-4 px-4">
        {/* Links grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-b border-[#ddd]">
          <div>
            <h4 className="text-[14px] font-semibold text-airbnb-hof mb-4">Destek</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Yardim Merkezi</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Guvenlik bilgileri</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Iptal politikasi</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Engelli destegi</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-airbnb-hof mb-4">Kiraya verme</h4>
            <ul className="space-y-3">
              <li><Link href="/ilan-ver" className="text-[14px] text-airbnb-hof hover:underline">Kiraya verin</Link></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Nasil calisir?</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Komisyon bilgisi</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Guvenli odeme</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-airbnb-hof mb-4">RentHub</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Hakkimizda</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Yenilikler</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Kariyer</a></li>
              <li><a href="#" className="text-[14px] text-airbnb-hof hover:underline">Yatirimcilar</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-[14px] text-airbnb-hof">
            <span>&copy; 2026 RentHub, Inc.</span>
            <span className="text-airbnb-deco">·</span>
            <a href="#" className="hover:underline">Gizlilik</a>
            <span className="text-airbnb-deco">·</span>
            <a href="#" className="hover:underline">Sartlar</a>
            <span className="text-airbnb-deco">·</span>
            <a href="#" className="hover:underline">Site Haritasi</a>
          </div>
          <div className="flex items-center gap-4 text-[14px] text-airbnb-hof">
            <span>Turkce (TR)</span>
            <span>&#8378; TRY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
