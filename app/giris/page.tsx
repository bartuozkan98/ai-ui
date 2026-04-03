"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) router.push("/");
    else setError(result.error || "Giriş başarısız");
  };

  return (
    <div className="min-h-screen bg-sahi-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block bg-airbnb-rausch text-white px-4 py-2 rounded-lg font-bold text-xl">RentHub</Link>
          <h1 className="text-[22px] font-bold text-airbnb-hof mt-4">Giriş Yap</h1>
          <p className="text-[14px] text-airbnb-foggy mt-1">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#ddd] p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">E-posta</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-airbnb-hof mb-1">Şifre</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifreniz" className="w-full border border-[#ddd] rounded-lg px-4 py-3 text-[14px]" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-airbnb-rausch hover:bg-airbnb-rausch-dark text-white py-3 rounded-lg font-semibold text-[15px] transition-colors disabled:opacity-50">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-[14px] text-airbnb-foggy mt-4">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-airbnb-rausch font-semibold hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}
