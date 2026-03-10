"use client";

import React from 'react';
import {
    Plus,
    Download,
    Upload,
    Search,
    Edit,
    Trash2,
    MoreVertical,
    Package,
    TrendingDown,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

const mockInventory = [
    { id: 'INV-001', name: 'Postre de Chocolate', category: 'Postres', price: 4.50, cost: 1.50, margin: 66, stock: 45, minStock: 15 },
    { id: 'INV-002', name: 'Tarta de Fresa', category: 'Postres', price: 5.00, cost: 2.00, margin: 60, stock: 8, minStock: 10 },
    { id: 'INV-003', name: 'Café Americano', category: 'Bebidas', price: 2.50, cost: 0.50, margin: 80, stock: 100, minStock: 20 },
    { id: 'INV-004', name: 'Croissant Mantequilla', category: 'Panadería', price: 2.00, cost: 0.80, margin: 60, stock: 30, minStock: 15 },
    { id: 'INV-005', name: 'Empanada de Carne', category: 'Salados', price: 3.00, cost: 1.20, margin: 60, stock: 5, minStock: 20 },
    { id: 'INV-006', name: 'Jugo Natural Naranja', category: 'Bebidas', price: 3.00, cost: 1.00, margin: 66, stock: 40, minStock: 10 },
    { id: 'INV-007', name: 'Cheesecake Frutos Rojos', category: 'Postres', price: 5.50, cost: 3.50, margin: 36, stock: 15, minStock: 10 },
];

export default function InventarioPage() {
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        Inventario
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona tus productos, stock y costos de manera eficiente.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Upload className="h-4 w-4" />
                        Importar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="h-4 w-4" />
                        Exportar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                        <Plus className="h-4 w-4" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre, SKU o categoría..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                        <option>Todas las Categorías</option>
                        <option>Postres</option>
                        <option>Bebidas</option>
                        <option>Panadería</option>
                    </select>
                    <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                        <option>Estado: Todos</option>
                        <option>Stock Bajo</option>
                        <option>En Stock</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Precio</th>
                                <th className="px-6 py-4">Costo</th>
                                <th className="px-6 py-4">Margen</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                                            <span className="text-xs text-gray-400">{item.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-blue-600 text-sm">${item.price.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600 text-sm">${item.cost.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {item.margin >= 50 ? (
                                                <span className="text-green-600 flex items-center font-medium text-sm">
                                                    <TrendingUp className="h-4 w-4 mr-1" />
                                                    {item.margin}%
                                                </span>
                                            ) : (
                                                <span className="text-orange-600 flex items-center font-medium text-sm">
                                                    <TrendingDown className="h-4 w-4 mr-1" />
                                                    {item.margin}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.stock <= item.minStock ? (
                                            <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm bg-red-50 w-fit px-2 py-1 rounded-md border border-red-100">
                                                <AlertCircle className="h-4 w-4" />
                                                {item.stock} uds
                                            </div>
                                        ) : (
                                            <div className="text-gray-900 font-medium text-sm">
                                                {item.stock} uds
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
                    <span>Mostrando 1 a 7 de 45 productos</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors" disabled>Anterior</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded shadow-sm">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">3</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white transition-colors">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
