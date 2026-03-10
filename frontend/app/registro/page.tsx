"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            try {
                await registerUser({ name, email, password });

                // Nueva Lógica UX Fase 4: guardar credenciales temporalmente para login automático
                sessionStorage.setItem('temp_email', email);
                sessionStorage.setItem('temp_password', password);

                router.push('/login');
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado al registrarte.');
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="min-h-screen flex flex-row-reverse bg-white font-sans">
                {/* Right Panel - Visual Area */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 to-blue-800 text-white p-12 flex-col justify-between">
                    <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
                            <path d="M100,100 C70,70 30,70 0,50 L0,0 L100,0 Z" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-center">
                        <div className="mb-8">
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 border border-blue-700 text-sm font-medium text-blue-200 mb-6">
                                Únete a miles de negocios
                            </span>
                            <h1 className="text-5xl font-extrabold leading-tight mb-6">
                                Empieza a escalar tu negocio hoy mismo.
                            </h1>
                            <p className="text-xl text-blue-200 max-w-lg leading-relaxed mb-10">
                                Crea tu cuenta en minutos y descubre por qué somos la plataforma líder en gestión y ventas con Inteligencia Artificial.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-12 border-t border-blue-800 pt-10">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                                <div className="text-blue-300 text-sm">Uptime garantizado</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">Soporte</div>
                                <div className="text-blue-300 text-sm">24/7 para tu equipo</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Panel - Register Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#F8FAFC] lg:bg-white">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-8 lg:hidden">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">B</div>
                                <span className="text-2xl font-bold tracking-tight text-gray-900">Bijao</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                Crea tu cuenta
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Inicia tu prueba gratuita. No requiere tarjeta de crédito.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm shadow-sm flex items-start gap-3">
                                <span className="mt-0.5">⚠️</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre completo
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 sm:text-sm"
                                        placeholder="Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 sm:text-sm"
                                        placeholder="ejemplo@empresa.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Debe tener al menos 8 caracteres y una mayúscula.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Creando cuenta...
                                    </>
                                ) : (
                                    'Registrarse gratis'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Inicia sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
