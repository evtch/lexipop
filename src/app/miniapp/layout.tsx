import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import NeynarProvider from './components/NeynarProvider';
import Web3Provider from './components/Web3Provider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: 'Lexipop - Vocabulary Learning Game',
  description: 'Learn vocabulary the fun way! Test your word knowledge with floating bubbles and interactive games.',
  openGraph: {
    title: 'Lexipop - Vocabulary Learning Game',
    description: 'Learn vocabulary the fun way! Test your word knowledge with floating bubbles and interactive games.',
    images: [
      {
        url: 'https://lexipop.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lexipop - Vocabulary Learning Game'
      }
    ],
    siteName: 'Lexipop',
    type: 'website',
    url: 'https://lexipop.app/miniapp'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexipop - Vocabulary Learning Game',
    description: 'Learn vocabulary the fun way! Test your word knowledge with floating bubbles.',
    images: ['https://lexipop.app/og-image.png']
  },
  other: {
    // Mini App embed metadata for Farcaster Frames v2
    'fc:miniapp': '{"version":"1","name":"Lexipop","imageUrl":"https://lexipop.app/farcaster-embed.png","aspectRatio":"3:2","button":{"title":"Play","action":{"type":"launch_frame","name":"Play","url":"https://lexipop.app/miniapp","splashImageUrl":"https://lexipop.app/lexipop-splash.png","splashBackgroundColor":"#2563eb"}}}'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
      <Web3Provider>
        <NeynarProvider>
          {children}
        </NeynarProvider>
      </Web3Provider>
    </div>
  );
}