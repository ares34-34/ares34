'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Consultar' },
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-ares-dark px-4">
      {/* Logo */}
      <span className="text-xl font-bold text-ares-blue">ARES34</span>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors hover:text-white ${
              pathname === link.href ? 'font-medium text-white' : 'text-gray-400'
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </nav>
  );
}
