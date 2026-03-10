"use client";

import React, { useState } from 'react';
import {
    Megaphone,
    Users,
    Sparkles,
    Zap,
    Target,
    ArrowRight,
    TrendingDown,
    TrendingUp,
    Mail
} from 'lucide-react';

const mockSegments = [
    { id: 1, title: 'Prefieren Servicios Altamente Rentables', percentage: 29, color: 'text-purple-600 bg-purple-50 border-purple-100', icon: Target },
    { id: 2, title: 'Clientes Recurrentes Frecuentes', percentage: 45, color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Users },
    { id: 3, title: 'En Riesgo de Abandono (Churn)', percentage: 12, color: 'text-red-600 bg-red-50 border-red-100', icon: TrendingDown },
];

const mockCampaigns = [
    { id: 1, type: 'Cross-sell', title: 'Vender Consultoría a compradores de Software', desc: 'Identificamos 150 clientes que han comprado tu Software pero no tu Consultoría. Tienen una probabilidad del 65% de conversión.', metric: '+$12,500' },
    { id: 2, type: 'Retención', title: 'Descuento Especial para Clientes en Riesgo', desc: '45 clientes clave no han comprado en los últimos 3 meses. Una campaña de descuento del 15% podría recuperarlos.', metric: 'Evita perder $8k' },
];

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('Segmentación');

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Megaphone className="h-6 w-6 text-blue-600" />
                        Marketing Inteligente
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Conoce a tus clientes, prevé tendencias y ejecuta campañas automatizadas.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                    <Plus className="h-4 w-4" />
                    Nueva Campaña
                </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide gap-1 p-1 bg-white border border-gray-100 rounded-xl w-fit shadow-sm">
                {['Segmentación', 'Insights', 'Campañas'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Segmentación' && (
                <div className="flex flex-col gap-8">

                    {/* Top Segments */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-gray-700" />
                            <h2 className="text-lg font-bold text-gray-900">Segmentación Actual de tu Audiencia</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {mockSegments.map((seg) => {
                                const Icon = seg.icon;
                                return (
                                    <div key={seg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${seg.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <span className="text-3xl font-black text-gray-900">{seg.percentage}%</span>
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition-colors">{seg.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Aproximadamente {seg.percentage * 15} contactos.</p>

                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="flex -space-x-2 overflow-hidden mb-3">
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold font-sans">JM</div>
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold font-sans">SA</div>
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold font-sans">RW</div>
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold font-sans">+9</div>
                                            </div>
                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn">
                                                Ver Segmento <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* AI Campaigns */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                            <h2 className="text-lg font-bold text-gray-900">Campañas Sugeridas por IA</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mockCampaigns.map((camp) => (
                                <div key={camp.id} className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-lg border border-indigo-700/50 p-6 text-white relative overflow-hidden group">
                                    {/* Decorative */}
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-blue-500/20 blur-3xl rounded-full" />
                                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 bg-indigo-500/20 blur-3xl rounded-full" />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="bg-white/10 text-blue-200 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                                {camp.type}
                                            </span>
                                            <span className="flex items-center gap-1 text-green-300 font-bold text-sm bg-green-900/30 px-2 py-1 rounded-md">
                                                <TrendingUp className="h-4 w-4" />
                                                {camp.metric}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2">{camp.title}</h3>
                                        <p className="text-blue-100 text-sm mb-6 leading-relaxed opacity-90">{camp.desc}</p>

                                        <button className="mt-auto flex items-center justify-center gap-2 py-3 px-4 bg-white text-indigo-900 hover:bg-blue-50 rounded-xl font-bold transition-colors w-full sm:w-auto shadow-md">
                                            <Zap className="h-4 w-4 fill-indigo-900" />
                                            Iniciar Campaña
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

// Plus icon fallback
function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
