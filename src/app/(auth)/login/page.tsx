'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient();

      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError('Error al crear la cuenta. Verifica tus datos e intenta de nuevo.');
          setLoading(false);
          return;
        }
        // After signup, sign in automatically
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError('Cuenta creada. Inicia sesión con tus credenciales.');
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError('Correo o contraseña incorrectos');
          setLoading(false);
          return;
        }
      }

      // Check if user has completed onboarding
      const res = await fetch('/api/config');
      const configData = await res.json();

      if (!configData.data || !configData.data.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch {
      setError(isRegister ? 'Error al crear la cuenta' : 'Correo o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ares-dark flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-[#0F2440] border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {isRegister ? 'Crea tu Cuenta en ' : 'Inicia Sesión en '}
            <span className="text-ares-blue">ARES34</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isRegister
              ? 'Regístrate para acceder a tu consejo directivo de IA'
              : 'Accede a tu sistema de inteligencia ejecutiva'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {error && (
              <p className="text-sm text-ares-red">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-ares-blue hover:bg-ares-blue/90 text-white cursor-pointer"
            >
              {loading
                ? (isRegister ? 'Creando cuenta...' : 'Entrando...')
                : (isRegister ? 'Crear Cuenta' : 'Entrar')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm text-gray-400 hover:text-ares-blue transition-colors cursor-pointer"
            >
              {isRegister
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
