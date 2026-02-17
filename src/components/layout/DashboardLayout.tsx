'use client';

import Navbar from './Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] app-ambient-bg">
      {/* Subtle ambient background effects */}
      <div className="app-glow-1" />
      <div className="app-glow-2" />
      <div className="app-glow-3" />
      <div className="app-grid-subtle" />
      <div className="app-orb app-orb-1" />
      <div className="app-orb app-orb-2" />
      <div className="app-orb app-orb-3" />

      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 pt-20">
        {children}
      </main>
    </div>
  );
}
