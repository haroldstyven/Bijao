"use client";

import React, { useState, useEffect } from 'react';
import { getProductos, getClientes, createVenta } from '@/lib/api';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Box,
    Users
} from 'lucide-react';

interface Producto {
    id: string;
    nombre: string;
    precio_venta: number;
    stock_actual: number;
    categoria: string;
    tipo?: string;
    color?: string;
}

interface Cliente {
    id: string;
    nombre: string;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    stock: number;
    tipo?: string;
}

export default function POSPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [selectedCliente, setSelectedCliente] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    useEffect(() => {
        // Fetch products and clients on mount (assume generic business ID for now; you'd normally get it from auth context)
        const fetchInitialData = async () => {
            try {
                // To fetch properly we need the negocio_id, typically saved in localStorage or Auth context.
                const userSession = localStorage.getItem("sb-pwhcawpnyeycjjjrhcgs-auth-token");
                let userNegocioId = null;
                if (userSession) {
                    const parsed = JSON.parse(userSession);
                    userNegocioId = parsed.user?.user_metadata?.negocio_id;
                }

                // If not in standard metadata, let's grab it directly from local storage if available
                const fallbackNegocioId = localStorage.getItem("negocio_id");
                const targetNegocioId = userNegocioId || fallbackNegocioId;

                if (targetNegocioId) {
                    const [prodRes, cliRes] = await Promise.all([
                        getProductos(targetNegocioId),
                        getClientes(targetNegocioId)
                    ]);
                    setProductos(prodRes.data || []);
                    setClientes(cliRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching POS data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const addToCart = (product: Producto) => {
        setCart(currentCart => {
            const existing = currentCart.find(item => item.id === product.id);
            if (existing) {
                // check stock (only if not a service)
                if (product.tipo !== 'SERVICIO' && existing.qty + 1 > product.stock_actual) return currentCart;
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            if (product.tipo !== 'SERVICIO' && product.stock_actual <= 0) return currentCart;
            return [...currentCart, {
                id: product.id,
                name: product.nombre,
                price: product.precio_venta,
                qty: 1,
                stock: product.stock_actual,
                tipo: product.tipo
            }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(currentCart => {
            return currentCart.map(item => {
                if (item.id === id) {
                    const newQty = item.qty + delta;
                    if (newQty <= 0) return { ...item, qty: 0 }; // Will be filtered out later if we wanted
                    if (item.tipo !== 'SERVICIO' && newQty > item.stock) return item;
                    return { ...item, qty: newQty };
                }
                return item;
            }).filter(item => item.qty > 0);
        });
    };

    const clearCart = () => {
        if (window.confirm('¿Seguro que deseas vaciar el carrito?')) {
            setCart([]);
            setDiscount(0);
            setSelectedCliente('');
        }
    };

    const handleCobrar = async () => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        try {
            const fallbackNegocioId = localStorage.getItem("negocio_id") || "";

            const saleData = {
                negocio_id: fallbackNegocioId,
                cliente_id: selectedCliente || null,
                numero_factura: `FAC-${Date.now()}`,
                subtotal: subtotal,
                descuento_global: discount,
                total: total,
                estado: "VIGENTE",
                detalles: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.qty,
                    precio_unitario: item.price,
                    costo_unitario: 0, // In reality, we'd fetch costo from product model
                    descuento_item: 0
                }))
            };

            await createVenta(saleData);

            alert('Venta procesada con éxito!');

            // Re-fetch products to update stock
            if (fallbackNegocioId) {
                const prodRes = await getProductos(fallbackNegocioId);
                setProductos(prodRes.data || []);
            }

            setCart([]);
            setDiscount(0);
            setSelectedCliente('');
        } catch (error) {
            console.error(error);
            alert('Error al procesar la venta');
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    const filteredProducts = productos.filter(p => {
        const matchesCategory = selectedCategory === 'Todos' || p.categoria === selectedCategory;
        const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria || 'General')))];

    return (
        <div className="h-full flex flex-col xl:flex-row gap-6">
            {/* Left Column - Products (70%) */}
            <div className="w-full xl:w-[70%] flex flex-col">
                {/* Header & Search */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Punto de Venta</h1>
                        <p className="text-gray-500 text-sm mt-1">Selecciona productos para agregar al carrito</p>
                    </div>
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {categories.map((cat, idx) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-10 custom-scrollbar pr-2 h-[calc(100vh-16rem)]">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-gray-500">Cargando productos...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-500">No hay productos disponibles</div>
                    ) : (
                        filteredProducts.map((product) => {
                            const isAgotado = product.tipo !== 'SERVICIO' && product.stock_actual <= 0;
                            const stockStateColor = product.tipo === 'SERVICIO' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : (isAgotado ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400');
                            const stockLabel = product.tipo === 'SERVICIO' ? 'Disponible' : (product.stock_actual > 0 ? `${product.stock_actual} en stock` : 'Agotado');

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col ${isAgotado ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {/* Image Placeholder */}
                                    <div className="h-32 bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center relative">
                                        <Box className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-md ${stockStateColor}`}>
                                            {stockLabel}
                                        </span>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2">{product.nombre}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.categoria || 'General'}</p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-bold text-blue-600 dark:text-blue-400">${(product.precio_venta || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            <button
                                                disabled={isAgotado}
                                                className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Right Column - Cart (30%) */}
            <div className="w-full xl:w-[30%] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-8rem)] sticky top-0">
                <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/80 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Orden Actual</h2>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                        {cart.length} Items
                    </span>
                </div>

                {/* Client Selector */}
                <div className="px-5 pt-4">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 border border-gray-200 dark:border-slate-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        <select
                            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200 outline-none border-none"
                            value={selectedCliente}
                            onChange={(e) => setSelectedCliente(e.target.value)}
                        >
                            <option value="">Consumidor Final</option>
                            {clientes.map(cli => (
                                <option key={cli.id} value={cli.id}>{cli.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {cart.length > 0 ? (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-start justify-between group">
                                    <div className="flex-1 pr-2">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2">{item.name}</h4>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">${item.price.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">${(item.price * item.qty).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 rounded-lg p-1 border border-gray-100 dark:border-slate-600">
                                            <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors shadow-sm">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-xs font-semibold w-4 text-center dark:text-white">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors shadow-sm">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p className="text-sm">El carrito está vacío</p>
                        </div>
                    )}
                </div>

                {/* Cart Footer / Checkout */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 rounded-b-2xl">
                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2">
                                Descuento %
                            </span>
                            <input
                                type="number"
                                value={discount === 0 ? '' : discount}
                                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-right text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="pt-3 border-t border-gray-200 dark:border-slate-700 border-dashed flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={clearCart}
                            className="p-3 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors border border-red-100 dark:border-red-500/20 font-medium whitespace-nowrap disabled:opacity-50"
                            title="Vaciar Carrito"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCobrar}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                        >
                            <CreditCard className="h-5 w-5" />
                            {isProcessing ? 'Procesando...' : 'Cobrar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
