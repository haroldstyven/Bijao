"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    Package,
    Users,
    Receipt,
    Megaphone,
    Calculator,
    Settings,
    Sparkles,
    Zap,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNegocio } from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { colorAcento } = useTheme();
    const [negocioNombre, setNegocioNombre] = useState<string | null>(null);
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNegocio = async () => {
            const negocioId = localStorage.getItem('negocio_id');
            if (negocioId) {
                try {
                    const data = await getNegocio(negocioId);
                    if (data.nombre) setNegocioNombre(data.nombre);
                    if (data.logo_url) setLogoBase64(data.logo_url);
                } catch (error) {
                    console.error("No se pudo cargar el negocio en el sidebar", error);
                }
            }
            setIsLoading(false);
        };
        fetchNegocio();
    }, []);

    const navigation = [
        { name: 'Asistente', href: '/dashboard/asistente', icon: Sparkles },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'POS / Venta', href: '/dashboard/pos', icon: ShoppingCart },
        { name: 'Historial de Ventas', href: '/dashboard/ventas', icon: FileText },
        { name: 'Cotizaciones', href: '/dashboard/cotizaciones', icon: Receipt },
        { name: 'Inventario', href: '/dashboard/inventario', icon: Package },
        { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
        { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
        { name: 'Calculadora', href: '/dashboard/calculadora', icon: Calculator },
    ];

    const bottomNavigation = [
        { name: 'Ajustes', href: '/dashboard/ajustes', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans overflow-hidden transition-colors">
            {/* Sidebar Fijo */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col shadow-sm z-10 relative transition-colors">
                {/* Logo */}
                <div className="h-20 flex items-center justify-center border-b border-gray-50">
                    <div className="flex flex-col items-center gap-1 mt-2 mb-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                <span className="text-xs text-gray-400">Cargando...</span>
                            </div>
                        ) : (
                            <>
                                {logoBase64 ? (
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden shadow-md">
                                        <img src={logoBase64} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-xl shadow-md">
                                        {negocioNombre ? negocioNombre.charAt(0) : 'M'}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-800 dark:text-white tracking-tight">
                                    {negocioNombre || 'Mi Negocio'}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                    ? 'text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                style={isActive ? { backgroundColor: colorAcento } : {}}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-50 dark:border-slate-700 flex flex-col gap-2 bg-white dark:bg-slate-800 transition-colors">
                    {bottomNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5 text-gray-400" />
                                {item.name}
                            </Link>
                        );
                    })}

                    <button className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors border border-blue-100 shadow-sm">
                        <Zap className="h-4 w-4 fill-current" />
                        Asistente Rápido
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400 font-medium">Desarrollado por Bijao</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 relative transition-colors">
                <div className="p-8 pb-20">
                    {children}
                </div>
            </main>

            {/* Global CSS for scrollbar if needed */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E2E8F0;
          border-radius: 10px;
        }
      `}} />
        </div>
    );
}
