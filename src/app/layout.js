import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
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

export const metadata = {
  metadataBase: new URL("https://janith-pradeepa.vercel.app"),
  title: "Janith & Pradeepa",
  description: "Wedding and Homecoming invitations for Janith & Pradeepa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${signature.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
