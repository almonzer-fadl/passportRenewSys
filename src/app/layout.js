import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Sudan Passport Renewal System",
  description: "Official passport renewal application system for Sudanese citizens - streamlined, secure, and efficient processing.",
  keywords: "Sudan, passport, renewal, government, official, application",
  authors: [{ name: "Republic of Sudan Ministry of Interior" }],
  creator: "Sudan Government Digital Services",
  publisher: "Republic of Sudan",
  robots: "index, follow",
  openGraph: {
    title: "Sudan Passport Renewal System",
    description: "Official passport renewal application system for Sudanese citizens",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="sudan">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
