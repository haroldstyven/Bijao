"use client";

import React from 'react';
import {
    Users,
    Search,
    Plus,
    Phone,
    Mail,
    Star,
    TrendingUp,
    MoreVertical,
    Activity
} from 'lucide-react';

const mockClientes = [
    { id: 1, name: 'Google Cloud Platform', contact: 'Sundar Pichai', email: 'sundar@google.com', phone: '+1 555-0192', favorite: 'Plan Enterprise', freq: 'Alta', freqColor: 'bg-green-100 text-green-700', total: 45000 },
    { id: 2, name: 'Acme Corporation', contact: 'Road Runner', email: 'road@acme.com', phone: '+1 555-0001', favorite: 'Mantenimiento', freq: 'Media', freqColor: 'bg-yellow-100 text-yellow-700', total: 12500 },
    { id: 3, name: 'Stark Industries', contact: 'Tony Stark', email: 'tony@stark.com', phone: '+1 555-9999', favorite: 'Consultoría AI', freq: 'Alta', freqColor: 'bg-green-100 text-green-700', total: 120000 },
    { id: 4, name: 'Wayne Enterprises', contact: 'Bruce Wayne', email: 'bruce@wayne.com', phone: '+1 555-1234', favorite: 'Seguridad', freq: 'Baja', freqColor: 'bg-red-100 text-red-700', total: 3400 },
    { id: 5, name: 'Globex Corp', contact: 'Hank Scorpio', email: 'hank@globex.com', phone: '+1 555-6666', favorite: 'Generadores', freq: 'Media', freqColor: 'bg-yellow-100 text-yellow-700', total: 8900 },
    { id: 6, name: 'Massive Dynamic', contact: 'William Bell', email: 'william@massive.com', phone: '+1 555-8888', favorite: 'Investigación', freq: 'Alta', freqColor: 'bg-green-100 text-green-700', total: 67000 },
];

export default function ClientesPage() {
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Directorio de Clientes
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Administra tus contactos, clientes y su historial de compras.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 whitespace-nowrap">
                        <Plus className="h-4 w-4" />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockClientes.map((cliente) => (
                    <div key={cliente.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                        {/* Card Header Profile */}
                        <div className="p-5 border-b border-gray-50 flex items-start justify-between bg-gradient-to-br from-white to-gray-50">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner border border-blue-200">
                                    {cliente.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                        {cliente.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">{cliente.contact}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-900 transition-colors p-1" title="Opciones">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="px-5 py-4 flex flex-col gap-2 border-b border-gray-50">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="truncate">{cliente.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{cliente.phone}</span>
                            </div>
                        </div>

                        {/* CRM Metrics */}
                        <div className="p-5 bg-gray-50/50 flex-1 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                        Favorito
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1" title={cliente.favorite}>
                                        {cliente.favorite}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <Activity className="h-3.5 w-3.5 text-blue-500" />
                                        Frecuencia
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${cliente.freqColor}`}>
                                        {cliente.freq}
                                    </span>
                                </div>
                            </div>

                            {/* Total Card */}
                            <div className="mt-auto pt-3 border-t border-gray-200 border-dashed flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">Total Comprado</span>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="text-lg font-black text-gray-900">${cliente.total.toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
