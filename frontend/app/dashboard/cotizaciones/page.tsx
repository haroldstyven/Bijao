"use client";

import React, { useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    Eye,
    Download,
    Send,
    Plus,
    MoreVertical
} from 'lucide-react';

const mockCotizaciones = [
    { id: 'COT-2023-001', date: '12 Oct 2023', client: 'Empresa SA', items: 3, total: 1250.00, status: 'Confirmada', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'COT-2023-002', date: '14 Oct 2023', client: 'Juan Pérez', items: 1, total: 450.00, status: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 'COT-2023-003', date: '15 Oct 2023', client: 'Constructora Beta', items: 12, total: 8400.00, status: 'Confirmada', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'COT-2023-004', date: '18 Oct 2023', client: 'María Gómez', items: 5, total: 320.00, status: 'Perdida', color: 'bg-red-100 text-red-700 border-red-200' },
    { id: 'COT-2023-005', date: '20 Oct 2023', client: 'Tech Solutions', items: 2, total: 1100.00, status: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
];

const tabs = ['Todas', 'Pendientes', 'Confirmadas', 'Perdidas'];

export default function CotizacionesPage() {
    const [activeTab, setActiveTab] = useState('Todas');

    const filteredData = activeTab === 'Todas'
        ? mockCotizaciones
        : mockCotizaciones.filter(c => c.status === activeTab);

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Cotizaciones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Crea, envía y realiza seguimiento de tus propuestas comerciales.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                    <Plus className="h-4 w-4" />
                    Nueva Cotización
                </button>
            </div>

            {/* Tabs and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col sm:flex-row justify-between gap-4">
                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide gap-1 p-1 bg-gray-50/50 rounded-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o N°..."
                            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <button className="p-1.5 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm bg-white">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">N° Cotización</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 text-center">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((cot, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900 text-sm">{cot.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600 text-sm">{cot.date}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-800 text-sm">{cot.client}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded-md">{cot.items}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 text-sm">${cot.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cot.color}`}>
                                            {cot.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Enviar por Email">
                                                <Send className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" title="Descargar PDF">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">No se encontraron cotizaciones para esta vista.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
