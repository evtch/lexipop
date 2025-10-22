'use client';

import { MiniAppProvider } from '@neynar/react';
import { ReactNode } from 'react';

export default function MiniAppLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <MiniAppProvider>
      {children}
    </MiniAppProvider>
  );
}