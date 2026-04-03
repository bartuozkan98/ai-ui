"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) { setError("Sifreler eslesmiyor"); return; }
    if (password.length < 6) { setError("Sifre en az 6 karakter olmali"); return; }
    setLoading(true);
    const result = await register({ email, password, name, phone });
    setLoading(false);
    if (result.success) router.push("/");
    else setError(result.error || "Kayit basarisiz");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-[#f0f0f0] px-6 py-5">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="#FF385C">
            <path d="M16 1C7.7 1 1 7.7 1 16s6.7 15 15 15 15-6.7 15-15S24.3 1 16 1zm6.9 22.5c-1.4 2.3-3.6 3.7-6.2 4-.3 0-.5 0-.7 0-.3 0-.5 0-.7 0-2.6-.3-4.8-1.7-6.2-4-1.5-2.4-1.9-5.3-1.1-8 .5-1.8 1.5-3.5 2.8-4.9L16 4l5.2 6.5c1.3 1.5 2.3 3.1 2.8 4.9.8 2.8.4 5.7-1.1 8z"/>
          </svg>
          <span className="text-[#FF385C] font-bold text-[20px]">RentHub</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          <div className="border border-[#ddd] rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
            <div className="border-b border-[#ebebeb] px-6 py-5 text-center">
              <h1 className="text-[22px] font-semibold text-airbnb-hof">Kayit olun</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-[18px] font-medium text-airbnb-hof mb-2">RentHub&apos;a hos geldiniz</h2>

              {error && <div className="bg-[#FFF0F0] border border-[#FFD0D0] text-[#C13515] text-[14px] p-4 rounded-xl">{error}</div>}

              <div className="space-y-[-1px]">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" className="w-full border border-[#b0b0b0] rounded-t-xl px-4 py-4 text-[16px]" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className="w-full border border-[#b0b0b0] px-4 py-4 text-[16px] -mt-[1px]" />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" className="w-full border border-[#b0b0b0] px-4 py-4 text-[16px] -mt-[1px]" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sifre (en az 6 karakter)" className="w-full border border-[#b0b0b0] px-4 py-4 text-[16px] -mt-[1px]" />
                <input type="password" required value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Sifre tekrar" className="w-full border border-[#b0b0b0] rounded-b-xl px-4 py-4 text-[16px] -mt-[1px]" />
              </div>

              <p className="text-[12px] text-airbnb-foggy leading-relaxed">
                Kayit olarak <a href="#" className="text-airbnb-rausch underline">Hizmet Sartlari</a> ve <a href="#" className="text-airbnb-rausch underline">Gizlilik Politikasi</a>&apos;ni kabul etmis olursunuz.
              </p>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-[14px] rounded-xl font-semibold text-[16px] disabled:opacity-50 hover:from-[#D70466] hover:via-[#D70466] hover:to-[#BD1E59] transition-all">
                {loading ? "Kayit yapiliyor..." : "Kabul et ve devam et"}
              </button>

              <div className="flex items-center gap-3 my-4">
                <hr className="flex-1 border-[#ddd]" />
                <span className="text-[12px] text-airbnb-foggy">veya</span>
                <hr className="flex-1 border-[#ddd]" />
              </div>

              <Link href="/giris" className="block w-full border border-airbnb-hof text-airbnb-hof py-[14px] rounded-xl font-semibold text-[16px] text-center hover:bg-[#f7f7f7] transition-colors">
                Giris Yap
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
