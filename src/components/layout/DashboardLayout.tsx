'use client';

import Navbar from './Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8 pt-20">
        {children}
      </main>
    </div>
  );
}
