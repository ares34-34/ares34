'use client';

import Navbar from './Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ares-dark">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 pt-20">
        {children}
      </main>
    </div>
  );
}
