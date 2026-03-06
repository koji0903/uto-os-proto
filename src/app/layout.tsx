import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "まちかどAIマップ宇土",
  description: "宇土市の地域資源・地域課題をみんなで共有しよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSansJP.variable} font-sans antialiased text-uto-gray bg-uto-ivory`}
      >
        {children}
      </body>
    </html>
  );
}
