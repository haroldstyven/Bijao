"use client";

import React, { useState, useEffect } from 'react';
import { getProductos, getClientes, createCotizacion, getCotizaciones, getCotizacionDetalles, updateCotizacionEstado, getNegocio } from '@/lib/api';
import {
    Search, FileText, ShoppingCart, Trash2, Plus, Minus, CreditCard, Box, Users, Calendar as CalendarIcon, Download, Loader2, CheckCircle, XCircle
} from 'lucide-react';

interface Producto {
    id: string;
    nombre: string;
    precio_venta: number;
    stock_actual: number;
    categoria: string;
    tipo?: string;
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

interface Cotizacion {
    id: string;
    numero_cotizacion: string;
    fecha_emision: string;
    subtotal: number;
    descuento_global: number;
    total: number;
    estado: string;
    clientes: { nombre: string } | null;
}

export default function CotizacionesPage() {
    const [activeTab, setActiveTab] = useState<'nueva' | 'historial'>('nueva');

    // ==========================================
    // ESTADO: NUEVA COTIZACIÓN
    // ==========================================
    const [productos, setProductos] = useState<Producto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [selectedCliente, setSelectedCliente] = useState<string>('');
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // ==========================================
    // ESTADO: HISTORIAL DE COTIZACIONES
    // ==========================================
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [searchHistory, setSearchHistory] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // FETCH DATA
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingProducts(true);
            try {
                const fallbackNegocioId = localStorage.getItem("negocio_id") || "";
                if (fallbackNegocioId) {
                    const [prodRes, cliRes] = await Promise.all([
                        getProductos(fallbackNegocioId),
                        getClientes(fallbackNegocioId)
                    ]);
                    setProductos(prodRes.data || []);
                    setClientes(cliRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching initial data", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (activeTab === 'nueva') {
            fetchInitialData();
        } else {
            fetchCotizaciones();
        }
    }, [activeTab]);

    const fetchCotizaciones = async () => {
        setLoadingHistory(true);
        try {
            const fallbackNegocioId = localStorage.getItem("negocio_id") || "";
            if (fallbackNegocioId) {
                const res = await getCotizaciones(fallbackNegocioId);
                setCotizaciones(res.data || []);
            }
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // ==========================================
    // LÓGICA: NUEVA COTIZACIÓN
    // ==========================================
    const addToCart = (product: Producto) => {
        setCart(currentCart => {
            const existing = currentCart.find(item => item.id === product.id);
            if (existing) {
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
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
                    if (newQty <= 0) return { ...item, qty: 0 };
                    return { ...item, qty: newQty };
                }
                return item;
            }).filter(item => item.qty > 0);
        });
    };

    const clearCart = () => {
        if (window.confirm('¿Seguro que deseas limpiar la cotización actual?')) {
            setCart([]);
            setDiscount(0);
            setSelectedCliente('');
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    const handleGenerarCotizacion = async () => {
        if (cart.length === 0) return;

        if (!selectedCliente) {
            alert('Por favor selecciona un cliente para generar la cotización.');
            return;
        }

        setIsCreating(true);
        try {
            const fallbackNegocioId = localStorage.getItem("negocio_id") || "";

            const randomID = Math.floor(Math.random() * 9000) + 1000;
            const numeroCotizacion = `COT-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${randomID}`;

            const cotData = {
                negocio_id: fallbackNegocioId,
                cliente_id: selectedCliente,
                numero_cotizacion: numeroCotizacion,
                subtotal: subtotal,
                descuento_global: discountAmount,
                total: total,
                estado: "PENDIENTE",
                detalles: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.qty,
                    precio_unitario: item.price,
                    costo_unitario: 0,
                    descuento_item: 0
                }))
            };

            await createCotizacion(cotData);
            alert('Cotización generada exitosamente.');
            setCart([]);
            setDiscount(0);
            setSelectedCliente('');
            setActiveTab('historial'); // Redirect to history
        } catch (error) {
            console.error(error);
            alert('Error al generar la cotización.');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredProducts = productos.filter(p => {
        const matchesCategory = selectedCategory === 'Todos' || p.categoria === selectedCategory;
        const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria || 'General')))];

    // ==========================================
    // LÓGICA: HISTORIAL (PDF & Estados)
    // ==========================================
    const filteredCotizaciones = cotizaciones.filter(c =>
        c.numero_cotizacion.toLowerCase().includes(searchHistory.toLowerCase()) ||
        (c.clientes?.nombre || '').toLowerCase().includes(searchHistory.toLowerCase())
    );

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`¿Marcar esta cotización como ${newStatus}?`)) return;
        try {
            await updateCotizacionEstado(id, newStatus);
            fetchCotizaciones();
        } catch (error) {
            console.error("Error actualizando estado", error);
            alert('Error al actualizar el estado.');
        }
    };

    const handleDownloadPDF = async (cotizacion: Cotizacion) => {
        try {
            setDownloadingId(cotizacion.id);

            if (!(window as any).jspdf) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
            }

            const { jsPDF } = (window as any).jspdf;
            const doc = new jsPDF();

            const detallesRes = await getCotizacionDetalles(cotizacion.id);
            const detalles = detallesRes.data || [];

            const negocioId = localStorage.getItem('negocio_id') || "";
            let negocioName = "Mi Negocio";
            let colorAcento = '#2563eb';

            if (negocioId) {
                try {
                    const negRes = await getNegocio(negocioId);
                    if (negRes) {
                        negocioName = negRes.nombre || negocioName;
                        if (negRes.color_acento) colorAcento = negRes.color_acento;
                    }
                } catch (e) {
                    console.error("No se pudo cargar config del negocio", e);
                }
            }

            const r = parseInt(colorAcento.slice(1, 3), 16) || 37;
            const g = parseInt(colorAcento.slice(3, 5), 16) || 99;
            const b = parseInt(colorAcento.slice(5, 7), 16) || 235;

            // Encabezado
            doc.setFillColor(r, g, b);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text(negocioName, 14, 25);

            doc.setFontSize(10);
            doc.text(`Doc: PRESUPUESTO`, 140, 20);
            doc.text(`Cotización N°: ${cotizacion.numero_cotizacion}`, 140, 26);
            doc.text(`Fecha: ${new Date(cotizacion.fecha_emision).toLocaleDateString('es-CO')}`, 140, 32);

            // Info Cliente
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Cotizado a:', 14, 55);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Cliente: ${cotizacion.clientes?.nombre || 'General'}`, 14, 62);
            doc.text(`Estado: ${cotizacion.estado}`, 14, 68);

            if (cotizacion.estado === 'CONFIRMADA') {
                doc.setTextColor(16, 185, 129); // Verde
                doc.setFont('helvetica', 'bold');
                doc.text('ESTA COTIZACIÓN HA SIDO APROBADA', 120, 65);
                doc.setTextColor(50, 50, 50);
            }

            // Tabla
            const tableColumn = ["Producto/Servicio", "Cant.", "Precio Unit.", "Total"];
            const tableRows: any[] = [];

            detalles.forEach((d: any) => {
                const nombreItem = d.productos?.nombre || 'Item';
                const totalItem = (d.cantidad * d.precio_unitario).toLocaleString('es-CO', { minimumFractionDigits: 2 });
                const precioUn = d.precio_unitario.toLocaleString('es-CO', { minimumFractionDigits: 2 });
                tableRows.push([nombreItem, d.cantidad.toString(), `$${precioUn}`, `$${totalItem}`]);
            });

            (doc as any).autoTable({
                startY: 80,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [r, g, b] },
                styles: { fontSize: 9.5, cellPadding: 4 },
                columnStyles: {
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY || 80;

            // Totales
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            if (cotizacion.descuento_global > 0) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text(`Subtotal: $${cotizacion.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`, 130, finalY + 10);
                doc.text(`Descuento: -$${cotizacion.descuento_global.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`, 130, finalY + 16);
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Cotizado: $${cotizacion.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`, 120, finalY + (cotizacion.descuento_global > 0 ? 25 : 15));

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text('Validez de esta cotización: 15 días.', 105, finalY + 45, { align: 'center' });

            doc.save(`Cotizacion_${cotizacion.numero_cotizacion}.pdf`);

        } catch (error) {
            console.error("Error generando PDF", error);
            alert("Ocurrió un error generando el PDF de la cotización.");
        } finally {
            setDownloadingId(null);
        }
    };


    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto h-full">
            {/* Header y Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Cotizaciones y Presupuestos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Genera propuestas comerciales para tus clientes de forma rápida</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('nueva')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'nueva' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Nueva Cotización
                    </button>
                    <button
                        onClick={() => setActiveTab('historial')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'historial' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>

            {/* VISTA: NUEVA COTIZACIÓN */}
            {activeTab === 'nueva' && (
                <div className="h-full flex flex-col xl:flex-row gap-6 mt-2">
                    {/* Left Column - Products */}
                    <div className="w-full xl:w-[70%] flex flex-col">
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto o servicio..."
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-10 custom-scrollbar pr-2 lg:max-h-[800px]">
                            {loadingProducts ? (
                                <div className="col-span-full py-20 text-center text-gray-500">Cargando catálogo...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-gray-500">No hay items disponibles</div>
                            ) : (
                                filteredProducts.map((product) => {
                                    const stockStateColor = product.tipo === 'SERVICIO' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : (product.stock_actual > 0 ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400');
                                    const stockLabel = product.tipo === 'SERVICIO' ? 'Disponible' : (product.stock_actual > 0 ? `${product.stock_actual} stock` : 'Agotado');

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col`}
                                        >
                                            <div className="h-32 bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center relative">
                                                <Box className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                                <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-md ${stockStateColor}`}>
                                                    {stockLabel}
                                                </span>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1 justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2">{product.nombre}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.categoria || 'General'}</p>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">${(product.precio_venta || 0).toLocaleString('es-CO')}</span>
                                                    <button className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
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

                    {/* Right Column - Context / Cart */}
                    <div className="w-full xl:w-[30%] bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-12rem)] sticky top-0">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 rounded-t-2xl flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Borrador
                            </h2>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{cart.length} Items</span>
                        </div>

                        {/* Client Selector */}
                        <div className="px-5 pt-4">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Cliente a Cotizar *</label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 border border-gray-200 dark:border-slate-600">
                                <Users className="h-4 w-4 text-gray-400" />
                                <select
                                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-200 outline-none border-none"
                                    value={selectedCliente}
                                    onChange={(e) => setSelectedCliente(e.target.value)}
                                >
                                    <option value="" disabled>Seleccione un cliente...</option>
                                    {clientes.map(cli => (
                                        <option key={cli.id} value={cli.id}>{cli.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            {cart.length > 0 ? (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-start justify-between">
                                            <div className="flex-1 pr-2">
                                                <h4 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2">{item.name}</h4>
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">${item.price.toLocaleString('es-CO')} c/u</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">${(item.price * item.qty).toLocaleString('es-CO')}</span>
                                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 rounded-lg p-1 border border-gray-100 dark:border-slate-600">
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded text-gray-500">
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-xs font-semibold w-4 text-center dark:text-white">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded text-gray-500">
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
                                    <p className="text-sm">Borrador vacío</p>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 rounded-b-2xl">
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${subtotal.toLocaleString('es-CO')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-2">Descuento %</span>
                                    <input
                                        type="number"
                                        value={discount === 0 ? '' : discount}
                                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 text-right text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        min="0" max="100"
                                    />
                                </div>
                                <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">Total a Cotizar</span>
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">${total.toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={clearCart}
                                    className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                                <button
                                    disabled={cart.length === 0 || isCreating || !selectedCliente}
                                    onClick={handleGenerarCotizacion}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                                    Generar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA: HISTORIAL */}
            {activeTab === 'historial' && (
                <div className="mt-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Buscar cotización por número o cliente..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchHistory}
                                onChange={(e) => setSearchHistory(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="text-sm bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" /> Total Emitidas: {cotizaciones.length}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                                    <th className="px-6 py-4">Cotización</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {loadingHistory ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando cotizaciones...</td></tr>
                                ) : filteredCotizaciones.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay cotizaciones para mostrar.</td></tr>
                                ) : (
                                    filteredCotizaciones.map((cot) => {
                                        let statusColor = 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'; // PENDIENTE
                                        if (cot.estado === 'CONFIRMADA') statusColor = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
                                        if (cot.estado === 'PERDIDA') statusColor = 'bg-red-50 text-red-700 ring-red-600/20';

                                        return (
                                            <tr key={cot.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 group">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">
                                                    {cot.numero_cotizacion}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {cot.clientes?.nombre || 'General'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(cot.fecha_emision).toLocaleDateString('es-CO')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${statusColor}`}>
                                                        {cot.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                                    ${cot.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleDownloadPDF(cot)}
                                                            disabled={downloadingId === cot.id}
                                                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Descargar PDF"
                                                        >
                                                            {downloadingId === cot.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                        </button>

                                                        {cot.estado === 'PENDIENTE' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(cot.id, 'CONFIRMADA')}
                                                                    className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 rounded-lg transition-colors"
                                                                    title="Marcar Confirmada"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(cot.id, 'PERDIDA')}
                                                                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 rounded-lg transition-colors"
                                                                    title="Marcar Perdida"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
