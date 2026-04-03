import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "RentHub - Ev, Araba, Motor, Tekne Kiralama Platformu",
  description: "Türkiye'nin en kapsamlı kiralama platformu. Ev, araba, motosiklet ve tekne kiralayın veya kiraya verin. Güvenli ödeme, %3 komisyon.",
  keywords: "kiralık ev, araba kiralama, motosiklet kiralama, tekne kiralama, günlük kiralık",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
