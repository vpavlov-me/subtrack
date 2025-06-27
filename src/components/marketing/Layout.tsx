import { ReactNode } from 'react';
import MarketingHeader from './Header';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} SubTrack. All rights reserved.
      </footer>
    </div>
  );
}
