'use client';

import { MiniAppProvider } from '@neynar/react';

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MiniAppProvider>
      {children}
    </MiniAppProvider>
  );
}