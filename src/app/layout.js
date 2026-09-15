import { Cormorant_Garamond, Great_Vibes, Manrope, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const signature = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap",
  weight: "400",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sinhala = Noto_Serif_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-sinhala",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata = {
  metadataBase: new URL("https://janith-pradeepa.vercel.app"),
  title: "Janith & Pradeepa",
  description: "Wedding and Homecoming invitations for Janith & Pradeepa.",
};

export const viewport = {
  themeColor: "#f5eddc",
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${signature.variable} ${body.variable} ${sinhala.variable}`}>
        {children}
      </body>
    </html>
  );
}
