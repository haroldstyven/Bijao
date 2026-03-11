"use client";

import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const c = parseFloat(cost1);
        const m = parseFloat(margin1);
        const d = parseFloat(discount1) || 0;

        if (!isNaN(c) && !isNaN(m) && c >= 0 && m >= 0 && m < 100 && d >= 0 && d < 100) {
            // Base Price = Cost / (1 - Margin / 100)
            let basePrice = c / (1 - m / 100);

            // Final Price = Base Price + (Base Price * Discount / 100)
            if (d > 0) {
                // If applying discount, we want the price such that price - (price * d/100) = basePrice
                // So price = basePrice / (1 - d/100)
                basePrice = basePrice / (1 - d / 100);
            }
            setResultPrice(basePrice);
        } else {
            setResultPrice(null);
        }
    }, [cost1, margin1, discount1]);

    useEffect(() => {
        const c = parseFloat(cost2);
        const p = parseFloat(price2);

        if (!isNaN(c) && !isNaN(p) && p > 0 && c >= 0) {
            // Margin = ((Price - Cost) / Price) * 100
            const calcMargin = ((p - c) / p) * 100;
            setResultMargin(calcMargin);
        } else {
            setResultMargin(null);
        }
    }, [cost2, price2]);

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto mb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-blue-600" />
                        Calculadora de Precios Completos
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Estimaciones rápidas y automáticas para asegurar la rentabilidad de tu negocio.</p>
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
                            <p className="text-blue-100 text-sm">Calcula el precio final para tu cliente automáticamente.</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mi Costo Total ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cost1}
                                    onChange={(e) => setCost1(e.target.value)}
                                    placeholder="Ej. 10.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Margen de Ganancia Esperado (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    step="0.1"
                                    value={margin1}
                                    onChange={(e) => setMargin1(e.target.value)}
                                    placeholder="Ej. 30"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descuento Estimado (%) <span className="text-gray-400 font-normal">(Opcional)</span></label>
                            <div className="relative">
                                <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    step="0.1"
                                    value={discount1}
                                    onChange={(e) => setDiscount1(e.target.value)}
                                    placeholder="Ej. 10"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className={`mt-2 p-4 border rounded-xl flex items-center justify-between transition-all duration-300 ${resultPrice !== null ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${resultPrice !== null ? 'text-green-700' : 'text-gray-500'}`}>Precio de Venta Sugerido</p>
                                <p className={`text-2xl font-black ${resultPrice !== null ? 'text-green-700' : 'text-gray-400'}`}>
                                    ${resultPrice !== null ? resultPrice.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </p>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${resultPrice !== null ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>
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
                            <p className="text-gray-300 text-sm">Validar el margen real de un producto.</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Costo del Producto ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cost2}
                                    onChange={(e) => setCost2(e.target.value)}
                                    placeholder="Ej. 10.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Precio de Venta Final ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price2}
                                    onChange={(e) => setPrice2(e.target.value)}
                                    placeholder="Ej. 15.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 text-sm text-gray-600 my-1">
                            <AlertCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                            <p>El margen te indica qué porcentaje del precio de venta es ganancia real para la empresa luego de descontar los costos.</p>
                        </div>

                        <div className={`mt-2 p-4 border rounded-xl flex items-center justify-between transition-all duration-300 ${resultMargin !== null ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${resultMargin !== null ? 'text-blue-700' : 'text-gray-500'}`}>Margen Obtenido</p>
                                <p className={`text-2xl font-black ${resultMargin !== null ? 'text-blue-700' : 'text-gray-400'}`}>
                                    {resultMargin !== null ? resultMargin.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}%
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs font-medium ${resultMargin !== null ? 'text-blue-600' : 'text-gray-400'}`}>Ganancia Unitaria</span>
                                <span className={`font-bold ${resultMargin !== null ? 'text-gray-900' : 'text-gray-400'}`}>
                                    ${resultMargin !== null ? (parseFloat(price2) - parseFloat(cost2)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
