"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Download, Upload, Search, Edit, Trash2,
    MoreVertical, Package, TrendingDown, TrendingUp, AlertCircle, X, Save, Loader2
} from 'lucide-react';
import { getProductos, createProducto, updateProducto, deleteProducto } from '@/lib/api';

interface Producto {
    id: string;
    nombre: string;
    categoria: string;
    precio_venta: number;
    costo: number;
    stock_actual: number;
    stock_minimo: number;
    tipo: string;
    imagen_url?: string;
    negocio_id?: string;
}

export default function InventarioPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas las Categorías');
    const [statusFilter, setStatusFilter] = useState('Estado: Todos');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [precio, setPrecio] = useState('');
    const [costo, setCosto] = useState('');
    const [stock, setStock] = useState('');
    const [stockMinimo, setStockMinimo] = useState('');

    useEffect(() => {
        const storedNegocioId = localStorage.getItem('negocio_id');
        if (storedNegocioId) {
            setBusinessId(storedNegocioId);
            fetchProductos(storedNegocioId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchProductos = async (nid: string) => {
        setIsLoading(true);
        try {
            const res = await getProductos(nid);
            setProductos(res.data || []);
        } catch (error) {
            console.error("Error al obtener productos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (product?: Producto) => {
        if (product) {
            setEditingProduct(product);
            setNombre(product.nombre);
            setCategoria(product.categoria);
            setPrecio(product.precio_venta.toString());
            setCosto(product.costo.toString());
            setStock(product.stock_actual.toString());
            setStockMinimo(product.stock_minimo.toString());
        } else {
            setEditingProduct(null);
            setNombre('');
            setCategoria('');
            setPrecio('');
            setCosto('');
            setStock('');
            setStockMinimo('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessId) return;
        setIsSaving(true);
        try {
            const data = {
                nombre,
                categoria: categoria || 'General',
                precio_venta: parseFloat(precio) || 0,
                costo: parseFloat(costo) || 0,
                stock_actual: parseInt(stock, 10) || 0,
                stock_minimo: parseInt(stockMinimo, 10) || 0,
                tipo: 'PRODUCTO',
                negocio_id: businessId
            };
            if (editingProduct) {
                await updateProducto(editingProduct.id, data);
            } else {
                await createProducto(data);
            }
            await fetchProductos(businessId);
            handleCloseModal();
        } catch (error) {
            console.error("Error al guardar producto:", error);
            alert("Error al guardar producto");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!businessId) return;
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            await deleteProducto(id);
            await fetchProductos(businessId);
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const calculateMargin = (price: number, cost: number) => {
        if (price <= 0) return 0;
        return Math.round(((price - cost) / price) * 100);
    };

    const uniqueCategories = Array.from(new Set(productos.map(p => p.categoria))).filter(Boolean);

    const filteredProducts = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === 'Todas las Categorías' || p.categoria === categoryFilter;
        let matchesStatus = true;
        if (statusFilter === 'Stock Bajo') matchesStatus = p.stock_actual <= p.stock_minimo;
        else if (statusFilter === 'En Stock') matchesStatus = p.stock_actual > p.stock_minimo;
        return matchesSearch && matchesCat && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        Inventario
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestiona tus productos, stock y costos de manera eficiente.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <Upload className="h-4 w-4" />
                        Importar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <Download className="h-4 w-4" />
                        Exportar
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                        <Plus className="h-4 w-4" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-gray-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                        <option>Todas las Categorías</option>
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                        <option>Estado: Todos</option>
                        <option>Stock Bajo</option>
                        <option>En Stock</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Precio</th>
                                <th className="px-6 py-4">Costo</th>
                                <th className="px-6 py-4">Margen</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Cargando productos...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron productos. Añade tu primer producto.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((item) => {
                                    const margin = calculateMargin(item.precio_venta, item.costo);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{item.nombre}</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">ID: {item.id.slice(0, 6)}...</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                                                    {item.categoria}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">${item.precio_venta.toLocaleString('es-CO')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600 dark:text-gray-300 text-sm">${item.costo.toLocaleString('es-CO')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {margin >= 50 ? (
                                                        <span className="text-green-600 dark:text-green-400 flex items-center font-medium text-sm">
                                                            <TrendingUp className="h-4 w-4 mr-1" />
                                                            {margin}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-orange-600 dark:text-orange-400 flex items-center font-medium text-sm">
                                                            <TrendingDown className="h-4 w-4 mr-1" />
                                                            {margin}%
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.stock_actual <= item.stock_minimo ? (
                                                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 dark:bg-red-900/20 w-fit px-2 py-1 rounded-md border border-red-100 dark:border-red-800/30">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {item.stock_actual} uds
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-900 dark:text-white font-medium text-sm">
                                                        {item.stock_actual} uds
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Modal para Nuevo/Editar Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="product-form" onSubmit={handleSave} className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del producto</label>
                                    <input
                                        type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="Ej. Postre de Chocolate"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                                    <input
                                        type="text" required value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                        list="categorias-list"
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="Ej. Postres, Servicios, Ropa..."
                                    />
                                    <datalist id="categorias-list">
                                        {uniqueCategories.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo Unitario</label>
                                        <input
                                            type="number" required min="0" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio de Venta</label>
                                        <input
                                            type="number" required min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg">
                                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Margen estimado: {calculateMargin(parseFloat(precio) || 0, parseFloat(costo) || 0)}%</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Inicial</label>
                                        <input
                                            type="number" required min="0" value={stock} onChange={(e) => setStock(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Mínimo</label>
                                        <input
                                            type="number" required min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="product-form" disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-75 disabled:cursor-not-allowed">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
