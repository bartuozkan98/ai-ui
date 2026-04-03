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
    if (password !== password2) { setError("Şifreler eşleşmiyor"); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı"); return; }
    setLoading(true);
    const result = await register({ email, password, name, phone });
    setLoading(false);
    if (result.success) router.push("/");
    else setError(result.error || "Kayıt başarısız");
  };

  return (
    <div className="min-h-screen bg-sahi-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block bg-airbnb-rausch text-white px-4 py-2 rounded-lg font-bold text-xl">RentHub</Link>
          <h1 className="text-[22px] font-bold text-airbnb-hof mt-4">Kayıt Ol</h1>
          <p className="text-[14px] text-airbnb-foggy mt-1">Ücretsiz hesap oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#ddd] p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Ad Soyad</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">E-posta</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Telefon</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Şifre</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Şifre Tekrar</label>
            <input type="password" required value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Şifrenizi tekrar girin" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>

          <div className="text-[12px] text-airbnb-foggy">
            Kayıt olarak <a href="#" className="underline">Kullanım Şartları</a> ve <a href="#" className="underline">Gizlilik Politikası</a>&apos;nı kabul etmiş olursunuz.
          </div>

          <button type="submit" disabled={loading} className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch-dark text-white py-3 rounded-lg font-semibold text-[15px] transition-colors disabled:opacity-50">
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-center text-[14px] text-airbnb-foggy mt-4">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-airbnb-rausch font-semibold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
