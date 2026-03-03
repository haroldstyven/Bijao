"use client";

import { Download, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
    const currentDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());

    // Helper for simple bar rendering
    const renderProgressBar = (label: string, percentage: number, colorClass: string) => (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1 capitalize">{currentDate}</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <Download className="h-4 w-4" />
                    Exportar métricas
                </button>
            </div>

            {/* Saludo del Negocio (Business Health Card) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3"></div>

                <div className="flex-shrink-0 text-center md:text-left">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Salud del Negocio</h2>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-6xl font-black text-orange-500 tracking-tighter">46</span>
                        <span className="text-xl font-bold text-gray-400">/ 100</span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        <AlertCircle className="h-4 w-4" />
                        Requiere Atención
                    </div>
                </div>

                <div className="hidden md:block w-px h-24 bg-gray-100 mx-4"></div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {renderProgressBar('Actividad de ventas', 17, 'bg-orange-400')}
                    {renderProgressBar('Stock saludable', 72, 'bg-emerald-500')}
                    {renderProgressBar('Márgenes', 75, 'bg-blue-500')}
                </div>
            </div>

            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Ventas Hoy */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Ventas hoy</h3>
                    <div className="flex items-end justify-between mb-4">
                        <span className="text-3xl font-bold text-gray-900">$0</span>
                        <span className="flex items-center text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                            <ArrowDownRight className="h-4 w-4 mr-0.5" /> 12%
                        </span>
                    </div>
                    <div className="w-full h-12 mt-auto">
                        {/* Mini SVG Line Chart Mock */}
                        <svg className="w-full h-full stroke-red-400" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,15 L20,20 L40,10 L60,25 L80,5 L100,28" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M0,15 L20,20 L40,10 L60,25 L80,5 L100,28 L100,30 L0,30 Z" fill="url(#red-gradient)" stroke="none" opacity="0.2" />
                            <defs>
                                <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f87171" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Ventas del Mes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Ventas del mes</h3>
                    <div className="flex items-end justify-between mb-4">
                        <span className="text-3xl font-bold text-gray-900">$39.000</span>
                        <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <ArrowUpRight className="h-4 w-4 mr-0.5" /> 8%
                        </span>
                    </div>
                    <div className="w-full h-12 mt-auto">
                        <svg className="w-full h-full stroke-emerald-400" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 L20,20 L40,22 L60,10 L80,15 L100,5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M0,25 L20,20 L40,22 L60,10 L80,15 L100,5 L100,30 L0,30 Z" fill="url(#green-gradient)" stroke="none" opacity="0.2" />
                            <defs>
                                <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Ticket Promedio */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Ticket promedio</h3>
                        <span className="text-3xl font-bold text-gray-900 block mt-2">$39.000</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-500 mt-4">
                        <TrendingUp className="h-4 w-4 mr-1.5 text-blue-500" />
                        Manteniéndose estable
                    </div>
                </div>

                {/* Clientes Activos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Clientes activos</h3>
                        <span className="text-3xl font-bold text-gray-900 block mt-2">1</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-500 mt-4">
                        <Users className="h-4 w-4 mr-1.5 text-blue-500" />
                        Total registrado
                    </div>
                </div>
            </div>

            {/* Bottom Section: Charts & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Ventas User Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Ventas - últimos 7 días</h3>
                        <select className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg focus:ring-0 cursor-pointer py-1.5 px-3">
                            <option>Esta semana</option>
                            <option>Semana pasada</option>
                        </select>
                    </div>

                    <div className="h-64 w-full flex items-end gap-2 sm:gap-4 pt-4">
                        {/* Simple CSS Bar Chart Mockup */}
                        {[
                            { day: 'Lun', val: 30 },
                            { day: 'Mar', val: 50 },
                            { day: 'Mié', val: 20 },
                            { day: 'Jue', val: 80 },
                            { day: 'Vie', val: 65 },
                            { day: 'Sáb', val: 95 },
                            { day: 'Dom', val: 10 }
                        ].map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group">
                                <div
                                    className="w-full max-w-[48px] bg-blue-100 group-hover:bg-blue-200 rounded-t-sm transition-colors relative"
                                    style={{ height: `${d.val}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        ${d.val}0
                                    </div>
                                    <div
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm"
                                        style={{ height: `${d.val > 20 ? d.val - 15 : d.val}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 mt-3">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recomendaciones (1/3 width) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recomendaciones</h3>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                            3
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Alert 1 */}
                        <div className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="mt-0.5 bg-red-50 p-2 rounded-lg text-red-500">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Stock crítico</h4>
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">Monitor "Dell 24 pulgadas" se está agotando. Quedan 2 unidades.</p>
                                <button className="text-blue-600 text-sm font-semibold mt-2 hover:underline">Reponer</button>
                            </div>
                        </div>

                        {/* Alert 2 */}
                        <div className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="mt-0.5 bg-orange-50 p-2 rounded-lg text-orange-500">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Facturas vencidas</h4>
                                <p className="text-sm text-gray-500 mt-0.5">Tienes 1 factura pendiente de cobro desde hace 3 días.</p>
                                <button className="text-blue-600 text-sm font-semibold mt-2 hover:underline">Ver factura</button>
                            </div>
                        </div>

                        {/* Alert 3 */}
                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 bg-blue-50 p-2 rounded-lg text-blue-500">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">IA de Ventas</h4>
                                <p className="text-sm text-gray-500 mt-0.5">Los viernes vendes un 30% más. Promociona accesorios este viernes.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
