import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navigation = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'POS / Venta', href: '/dashboard/pos' },
        { name: 'Cotizaciones', href: '/dashboard/cotizaciones' },
        { name: 'Inventario', href: '/dashboard/inventario' },
        { name: 'Clientes', href: '/dashboard/clientes' },
        { name: 'Facturas', href: '/dashboard/facturas' },
        { name: 'Marketing', href: '/dashboard/marketing' },
        { name: 'Calculadora', href: '/dashboard/calculadora' },
        { name: 'Ajustes', href: '/dashboard/ajustes' },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar Fijo */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Mi Negocio</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* User / Logout Section (Optional bottom area) */}
                <div className="p-4 border-t border-gray-200">
                    <Link
                        href="/login"
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('access_token');
                            }
                        }}
                    >
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
