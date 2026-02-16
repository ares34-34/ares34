'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { LogOut, Settings, MessageSquare } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Consultar', icon: MessageSquare },
  { href: '/settings', label: 'Configuración', icon: Settings },
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#0A0A0F]/95 backdrop-blur-md px-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
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
                  ? 'text-white bg-white/10 font-medium'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{link.label}</span>
            </a>
          );
        })}
      </div>

      {/* User + Sign out */}
      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-sm text-white/60 hidden sm:inline">
            {userName}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/60 transition-all hover:text-white/80 hover:bg-white/[0.06] cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
}
