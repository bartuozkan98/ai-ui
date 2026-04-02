import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmlakJet - Sat, Kirala, Keşfet | Türkiye'nin Emlak Platformu",
  description: "Türkiye'nin en kapsamlı emlak platformu. Ev satın alın, satın, günlük veya aylık kiralayın. Sahibinden ve kiralık tatil evleri tek platformda.",
  keywords: "emlak, satılık daire, kiralık ev, günlük kiralık, tatil evi, villa kiralama, sahibinden",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
