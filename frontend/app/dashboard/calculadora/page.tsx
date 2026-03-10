"use client";

import React, { useState } from 'react';
import {
    Calculator,
    DollarSign,
    Percent,
    Tag,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    AlertCircle
} from 'lucide-react';

export default function CalculadoraPage() {
    // States for Calculator 1: ¿A cuánto debo vender?
    const [cost1, setCost1] = useState('');
    const [margin1, setMargin1] = useState('');
    const [discount1, setDiscount1] = useState('');
    const [resultPrice, setResultPrice] = useState<number | null>(null);

    // States for Calculator 2: ¿Cuánto estoy ganando?
    const [cost2, setCost2] = useState('');
    const [price2, setPrice2] = useState('');
    const [resultMargin, setResultMargin] = useState<number | null>(null);

    const calculatePrice = () => {
        const c = parseFloat(cost1);
        const m = parseFloat(margin1);
        const d = parseFloat(discount1) || 0;

        if (!isNaN(c) && !isNaN(m) && m < 100) {
            // Base Price = Cost / (1 - Margin / 100)
            let basePrice = c / (1 - m / 100);
            // Final Price = Base Price + (Base Price * Discount / 100)
            if (d > 0) {
                basePrice = basePrice / (1 - d / 100);
            }
            setResultPrice(basePrice);
        }
    };

    const calculateMargin = () => {
        const c = parseFloat(cost2);
        const p = parseFloat(price2);

        if (!isNaN(c) && !isNaN(p) && p > 0) {
            // Margin = ((Price - Cost) / Price) * 100
            const calcMargin = ((p - c) / p) * 100;
            setResultMargin(calcMargin);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-blue-600" />
                        Calculadora de Precios Completos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Estimaciones rápidas para asegurar la rentabilidad de tu negocio.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Card 1: Vender */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="bg-blue-600 p-5 text-white flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Tag className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">¿A cuánto debo vender?</h2>
                            <p className="text-blue-100 text-sm">Calcula el precio final para tu cliente.</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mi Costo Total ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    value={cost1}
                                    onChange={(e) => setCost1(e.target.value)}
                                    placeholder="Ej. 10.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Margen de Ganancia Esperado (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    value={margin1}
                                    onChange={(e) => setMargin1(e.target.value)}
                                    placeholder="Ej. 30"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descuento Ofrecido (%) <span className="text-gray-400 font-normal">(Opcional)</span></label>
                            <div className="relative">
                                <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    value={discount1}
                                    onChange={(e) => setDiscount1(e.target.value)}
                                    placeholder="Ej. 10"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            onClick={calculatePrice}
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
                        >
                            Calcular Precio Ideal
                        </button>

                        {resultPrice !== null && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-0.5">Precio de Venta Sugerido</p>
                                    <p className="text-2xl font-black text-green-700">${resultPrice.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 2: Margen */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="bg-gray-900 p-5 text-white flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg text-green-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">¿Cuánto estoy ganando?</h2>
                            <p className="text-gray-300 text-sm">Validar el margen de tus productos actuales.</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Costo del Producto ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    value={cost2}
                                    onChange={(e) => setCost2(e.target.value)}
                                    placeholder="Ej. 10.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Precio de Venta Final ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    value={price2}
                                    onChange={(e) => setPrice2(e.target.value)}
                                    placeholder="Ej. 15.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 text-sm text-gray-600">
                            <AlertCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                            <p>El margen (Profit Margin) te indica qué porcentaje del precio de venta es ganancia real para la empresa luego de descontar los costos.</p>
                        </div>

                        <button
                            onClick={calculateMargin}
                            className="mt-2 w-full bg-gray-900 hover:bg-black text-white rounded-xl py-3 font-bold transition-all shadow-md shadow-gray-900/20 active:scale-[0.98]"
                        >
                            Calcular Margen
                        </button>

                        {resultMargin !== null && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-0.5">Margen Obtenido</p>
                                    <p className="text-2xl font-black text-blue-700">{resultMargin.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-blue-600 font-medium">Ganancia Unitaria</span>
                                    <span className="font-bold text-gray-900">${(parseFloat(price2) - parseFloat(cost2)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
