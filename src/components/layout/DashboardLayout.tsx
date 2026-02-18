'use client';

import Navbar from './Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070a0f] app-ambient-bg">
      {/* Enhanced ambient background — more luminous */}
      <div className="app-glow-1-strong" />
      <div className="app-glow-2-strong" />
      <div className="app-glow-3-strong" />
      <div className="app-glow-ribbon" />
      <div className="app-grid-enhanced" />
      <div className="app-orb app-orb-1" />
      <div className="app-orb app-orb-2" />
      <div className="app-orb app-orb-3" />
      <div className="app-orb app-orb-4" />
      <div className="app-orb app-orb-5" />
      <div className="app-orb app-orb-6" />

      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 pt-20">
        {children}
      </main>
    </div>
  );
}
