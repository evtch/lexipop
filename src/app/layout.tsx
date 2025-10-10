import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "./miniapp/components/Web3Provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Lexipop - Learn Vocabulary the Fun Way",
  description: "Test your vocabulary knowledge with floating bubbles and fun animations",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Lexipop - Learn Vocabulary the Fun Way',
    description: 'Test your vocabulary knowledge with floating bubbles and fun animations',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lexipop - Vocabulary Learning Game'
      }
    ],
    siteName: 'Lexipop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexipop - Learn Vocabulary the Fun Way',
    description: 'Test your vocabulary knowledge with floating bubbles and fun animations',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
