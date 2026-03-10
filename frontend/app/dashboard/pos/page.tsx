"use client";

import React, { useState } from 'react';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Box
} from 'lucide-react';

const mockProducts = [
    { id: 1, name: 'Postre de Chocolate', price: 4.50, stock: 45, category: 'Postres', color: 'bg-orange-100 text-orange-600' },
    { id: 2, name: 'Tarta de Fresa', price: 5.00, stock: 12, category: 'Postres', color: 'bg-red-100 text-red-600' },
    { id: 3, name: 'Café Americano', price: 2.50, stock: 100, category: 'Bebidas', color: 'bg-amber-100 text-amber-600' },
    { id: 4, name: 'Capuchino Vainilla', price: 3.50, stock: 80, category: 'Bebidas', color: 'bg-amber-100 text-amber-600' },
    { id: 5, name: 'Croissant Mantequilla', price: 2.00, stock: 30, category: 'Panadería', color: 'bg-yellow-100 text-yellow-600' },
    { id: 6, name: 'Empanada de Carne', price: 3.00, stock: 25, category: 'Salados', color: 'bg-orange-100 text-orange-600' },
    { id: 7, name: 'Jugo Natural Naranja', price: 3.00, stock: 40, category: 'Bebidas', color: 'bg-green-100 text-green-600' },
    { id: 8, name: 'Cheesecake Frutos Rojos', price: 5.50, stock: 15, category: 'Postres', color: 'bg-pink-100 text-pink-600' },
];

const mockCart = [
    { id: 1, name: 'Postre de Chocolate', price: 4.50, qty: 2 },
    { id: 3, name: 'Café Americano', price: 2.50, qty: 1 },
];

export default function POSPage() {
    const [discount, setDiscount] = useState<number>(0);

    const subtotal = mockCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal * (1 - discount / 100);

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
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Categories (Mock) */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {['Todos', 'Postres', 'Bebidas', 'Panadería', 'Salados'].map((cat, idx) => (
                        <button
                            key={idx}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${idx === 0 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-10 custom-scrollbar pr-2">
                    {mockProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col"
                        >
                            {/* Image Placeholder */}
                            <div className="h-32 bg-gray-50 flex items-center justify-center relative">
                                <Box className={`h-10 w-10 ${product.color.split(' ')[1]} opacity-50`} />
                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                                <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-md ${product.color}`}>
                                    {product.category}
                                </span>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 flex flex-col flex-1 justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="font-bold text-blue-600">${product.price.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <button className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column - Cart (30%) */}
            <div className="w-full xl:w-[30%] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-8rem)] sticky top-0">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-blue-600 h-5 w-5" />
                        <h2 className="text-lg font-bold text-gray-800">Orden Actual</h2>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                        {mockCart.length} Items
                    </span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {mockCart.length > 0 ? (
                        <div className="space-y-4">
                            {mockCart.map((item) => (
                                <div key={item.id} className="flex items-start justify-between group">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                                        <span className="text-xs text-blue-600 font-medium">${item.price.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-gray-900 text-sm">${(item.price * item.qty).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button className="p-1 hover:bg-white rounded text-gray-500 hover:text-gray-800 transition-colors shadow-sm">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-xs font-semibold w-4 text-center">{item.qty}</span>
                                            <button className="p-1 hover:bg-white rounded text-gray-500 hover:text-gray-800 transition-colors shadow-sm">
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
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                                Descuento %
                            </span>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="w-16 px-2 py-1 text-right text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="pt-3 border-t border-gray-200 border-dashed flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-black text-blue-600">${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100 font-medium whitespace-nowrap" title="Vaciar Carrito">
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30">
                            <CreditCard className="h-5 w-5" />
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
