'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Consultar' },
  { href: '/settings', label: 'Configuración' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.05] bg-black/90 backdrop-blur-sm px-6">
      {/* Logo */}
      <span className="text-sm font-semibold text-white tracking-wide">ARES34</span>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              pathname === link.href
                ? 'text-white font-medium'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-white/20 transition-colors hover:text-white/50 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </nav>
  );
}
