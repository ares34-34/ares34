'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { LogOut, Settings, MessageSquare, Sun, GitBranch, Shield, Activity, FileText, Calendar, Plug2 } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Core', icon: MessageSquare },
  { href: '/brief', label: 'Brief', icon: Sun },
  { href: '/scenarios', label: 'Escenarios', icon: GitBranch },
  { href: '/compliance', label: 'Legal', icon: Shield },
  { href: '/pulse', label: 'Pulso', icon: Activity },
  { href: '/prep', label: 'Juntas', icon: FileText },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/connections', label: 'Conexiones', icon: Plug2 },
  { href: '/settings', label: 'Config', icon: Settings },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserClient();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        setUserName(name);
      }
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0a0e14]/80 backdrop-blur-xl px-6">
      {/* Glow line at bottom of navbar */}
      <div className="navbar-glow-line navbar-glow-line-animated" />

      {/* Logo with glow */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center nav-logo-glow">
          <span className="text-black text-xs font-bold">A</span>
        </div>
        <span className="text-sm font-semibold text-white tracking-wide">ARES34</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm transition-all ${
                isActive
                  ? 'text-white bg-white/[0.12] font-medium shadow-sm shadow-white/[0.05]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{link.label}</span>
            </a>
          );
        })}
      </div>

      {/* User + Sign out */}
      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-sm text-white/50 hidden sm:inline">
            {userName}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/50 transition-all hover:text-white hover:bg-white/[0.06] cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
}
