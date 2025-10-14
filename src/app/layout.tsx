import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "./miniapp/components/Web3Provider";
import ClientMiniAppProvider from "./miniapp/components/ClientMiniAppProvider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: 'Lexipop - Vocabulary Learning Game',
  description: 'Learn vocabulary the fun way! Test your word knowledge with floating bubbles and interactive games.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Lexipop - Vocabulary Learning Game',
    description: 'Learn vocabulary the fun way! Test your word knowledge with floating bubbles and interactive games.',
    images: [
      {
        url: 'https://www.lexipop.xyz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lexipop - Vocabulary Learning Game'
      }
    ],
    siteName: 'Lexipop',
    type: 'website',
    url: 'https://www.lexipop.xyz'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexipop - Vocabulary Learning Game',
    description: 'Learn vocabulary the fun way! Test your word knowledge with floating bubbles.',
    images: ['https://www.lexipop.xyz/og-image.png']
  },
  other: {
    // Mini App embed metadata for Farcaster Frames v2
    'fc:miniapp': '{"version":"1","name":"Lexipop","imageUrl":"https://www.lexipop.xyz/farcaster-embed.png","aspectRatio":"3:2","button":{"title":"Learn and earn!","action":{"type":"launch_frame","name":"Learn and earn!","url":"https://www.lexipop.xyz","splashImageUrl":"https://www.lexipop.xyz/lexipop-splash.png","splashBackgroundColor":"#222632"}}}'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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
        <div
          className={`miniapp-container ${inter.variable} font-sans`}
          style={{
            maxWidth: '424px',
            margin: '0 auto',
            minHeight: '100vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }

              .miniapp-container {
                animation: fadeInUp 0.5s ease-out;
              }

              .miniapp-container .game-button {
                transition: all 0.2s ease;
              }

              .miniapp-container .game-button:active {
                transform: scale(0.95);
              }

              .miniapp-container .answer-option:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }

              /* Touch-friendly styles */
              .miniapp-container * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
              }

              /* Allow text selection for vocabulary words */
              .miniapp-container .vocabulary-word {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
              }
            `
          }} />
          <ClientMiniAppProvider>
            <Web3Provider useMiniappConfig={true}>
              {children}
            </Web3Provider>
          </ClientMiniAppProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
