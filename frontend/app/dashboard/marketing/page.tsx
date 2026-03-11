"use client";

import React, { useState, useEffect } from 'react';
import {
    Megaphone, Users, Sparkles, Zap, Target, ArrowRight, TrendingDown,
    TrendingUp, Mail, Plus, X, Loader2, Trash2, CheckCircle, BarChart3, Presentation, ChevronDown, ChevronUp, UserCheck
} from 'lucide-react';
import { getCampanas, createCampana, deleteCampana, getMarketingInsights, getMarketingSugerencias, getProductos, getMarketingSegmentos } from '@/lib/api';

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('Campañas');
    const [loading, setLoading] = useState(true);

    // Data states
    const [campanas, setCampanas] = useState<any[]>([]);
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [segmentos, setSegmentos] = useState<any[]>([]);
    const [segmentoAbierto, setSegmentoAbierto] = useState<number | null>(0); // by default open the first

    // UI states
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        tipo_alcance: 'MASIVA',
        origen: 'MANUAL',
        producto_id: '',
        segmento_id: 'Todos los clientes',
        meta_ventas: 10,
        duracion_dias: 30
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const negocio_id = localStorage.getItem('negocio_id');
            if (!negocio_id) return;

            const [campanasRes, sugerenciasRes, insightsRes, productosRes, segmentosRes] = await Promise.all([
                getCampanas(negocio_id),
                getMarketingSugerencias(negocio_id),
                getMarketingInsights(negocio_id),
                getProductos(negocio_id),
                getMarketingSegmentos(negocio_id)
            ]);

            setCampanas(campanasRes.data || []);
            setSugerencias(sugerenciasRes.data || []);
            setInsights(insightsRes.data || []);
            setProductos(productosRes.data || []);
            setSegmentos(segmentosRes.data || []);

        } catch (error) {
            console.error("Error fetching marketing data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateCampaña = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const negocio_id = localStorage.getItem('negocio_id');
            await createCampana({
                ...formData,
                negocio_id,
                producto_id: formData.producto_id || null // Ensure empty string becomes null
            });
            setIsCreating(false);
            setFormData({ ...formData, nombre: '', producto_id: '' }); // reset basic text fields
            fetchData();
        } catch (error) {
            console.error("Error creating campaign", error);
            alert("Error al crear la campaña");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCrearSugerida = async (sug: any) => {
        try {
            const negocio_id = localStorage.getItem('negocio_id');
            await createCampana({
                negocio_id,
                nombre: sug.title,
                tipo_alcance: sug.type === 'Promoción' ? 'MASIVA' : 'INDIVIDUAL',
                origen: 'SUGERIDA',
                producto_id: sug.producto_id || null,
                segmento_id: 'Algorítmico',
                meta_ventas: sug.meta_ventas,
                duracion_dias: sug.duracion_dias
            });
            fetchData();
        } catch (error) {
            console.error("Error starting suggested campaign", error);
        }
    };

    const handleDeleteCampaña = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta campaña?")) return;
        try {
            await deleteCampana(id);
            fetchData();
        } catch (error) {
            console.error("Error deleting campaign", error);
        }
    }

    const renderProgressBar = (actual: number, meta: number) => {
        const percent = meta > 0 ? Math.min(100, Math.round((actual / meta) * 100)) : 0;
        return (
            <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>Progreso ({actual} / {meta})</span>
                    <span className="text-blue-600">{percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                </div>
            </div>
        )
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <Megaphone className="h-8 w-8 text-blue-600" />
                        Marketing Inteligente
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Conoce a tus clientes, prevé tendencias y ejecuta campañas y estrategias comerciales.</p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95">
                    <Plus className="h-4 w-4" />
                    Nueva Campaña
                </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide gap-1 p-1 bg-white border border-gray-100 rounded-xl w-fit shadow-sm">
                {['Campañas', 'Insights', 'Segmentación'].map((tab) => (
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

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center p-20 text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                    <p className="font-medium">Cargando inteligencia de negocio...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'Campañas' && (
                        <div className="flex flex-col gap-10">
                            {/* Campañas Activas */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="h-6 w-6 text-gray-700" />
                                    <h2 className="text-xl font-bold text-gray-900">Mis Campañas Activas</h2>
                                </div>
                                {campanas.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                                        <p>No tienes campañas activas en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {campanas.map(c => (
                                            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col relative group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${c.origen === 'SUGERIDA' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {c.origen}
                                                    </span>
                                                    <button onClick={() => handleDeleteCampaña(c.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">{c.nombre}</h3>

                                                <div className="space-y-1.5 text-sm text-gray-600 mt-2">
                                                    <p><span className="font-medium text-gray-900">Tipo:</span> {c.tipo_alcance}</p>
                                                    {c.productos?.nombre && <p><span className="font-medium text-gray-900">Producto:</span> {c.productos.nombre}</p>}
                                                    <p><span className="font-medium text-gray-900">Segmento:</span> {c.segmento_id || 'Global'}</p>
                                                    <p><span className="font-medium text-gray-900">Duración:</span> {c.duracion_dias} días</p>
                                                </div>

                                                <div className="mt-auto pt-4 relative z-20">
                                                    {renderProgressBar(c.avance_actual || 0, c.meta_ventas)}
                                                </div>

                                                {c.estado === 'COMPLETADA' && (
                                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                                                        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                                                            <CheckCircle className="h-5 w-5" />
                                                            Completada
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Campañas IA Sugeridas */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500" />
                                    <h2 className="text-xl font-bold text-gray-900">El algoritmo sugiere estas campañas</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sugerencias.map((camp) => (
                                        <div key={camp.id} className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-lg border border-indigo-700/50 p-6 text-white relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-blue-500/20 blur-3xl rounded-full" />
                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="bg-indigo-500/30 text-indigo-100 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                                        Sugerencia IA
                                                    </span>
                                                    <span className="flex items-center gap-1 text-emerald-300 font-bold text-sm bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                                                        <TrendingUp className="h-4 w-4" />
                                                        {camp.metric}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold mb-2">{camp.title}</h3>
                                                <p className="text-indigo-100/80 text-sm mb-6 leading-relaxed flex-1">{camp.desc}</p>

                                                <div className="flex items-center justify-between text-xs text-indigo-200 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div>
                                                        <span className="block opacity-70 mb-0.5">Meta esperada</span>
                                                        <strong className="text-white text-sm">{camp.meta_ventas} ventas</strong>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block opacity-70 mb-0.5">Duración óptima</span>
                                                        <strong className="text-white text-sm">{camp.duracion_dias} días</strong>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleCrearSugerida(camp)}
                                                    className="mt-auto flex items-center justify-center gap-2 py-3 px-4 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold transition-all w-full shadow-md active:scale-[0.98]">
                                                    <Zap className="h-5 w-5 fill-indigo-900" />
                                                    Iniciar Campaña
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Insights' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-6 w-6 text-gray-700" />
                                <h2 className="text-xl font-bold text-gray-900">Insights del Modelo Numérico</h2>
                                <p className="text-sm text-gray-500 ml-2 border-l border-gray-200 pl-4 hidden md:block">Traducción de tus métricas a lenguaje de negocio.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {insights.map((ins: any) => (
                                    <div key={ins.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                                        <div>
                                            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-3">{ins.title}</h3>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className={`text-3xl font-black tracking-tight ${ins.color.split(' ')[0]}`}>{ins.value}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-sm font-medium text-gray-700 leading-snug">{ins.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Segmentación' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-6 w-6 text-gray-700" />
                                <h2 className="text-xl font-bold text-gray-900">Segmentación por Preferencia de Compra</h2>
                            </div>

                            {segmentos.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
                                    <Presentation className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                                    <p className="font-medium text-gray-700">No hay suficientes datos</p>
                                    <p className="text-sm mt-1">Registra más ventas para que el algoritmo pueda segmentar a tus clientes.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {segmentos.map((seg, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            {/* Header del Acordeón */}
                                            <button
                                                onClick={() => setSegmentoAbierto(segmentoAbierto === idx ? null : idx)}
                                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${seg.color}`}>
                                                        <Target className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{seg.segmento}</h3>
                                                        <p className="text-sm text-gray-500 font-medium">
                                                            Total: {seg.total_clientes} {seg.total_clientes === 1 ? 'cliente' : 'clientes'} ({seg.porcentaje}%)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-gray-400">
                                                    {segmentoAbierto === idx ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                                                </div>
                                            </button>

                                            {/* Contenido (Clientes) */}
                                            {segmentoAbierto === idx && (
                                                <div className="border-t border-gray-100 bg-gray-50 p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {seg.clientes.map((cliente: any, cIdx: number) => (
                                                            <div key={cIdx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3 hover:border-blue-200 transition-colors">
                                                                <div className="bg-blue-100 text-blue-600 rounded-full p-2 mt-1 shrink-0">
                                                                    <UserCheck className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 leading-tight">{cliente.nombre}</p>
                                                                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                                        <p><span className="font-semibold text-gray-700">Compras:</span> {cliente.compras}</p>
                                                                        <p><span className="font-semibold text-gray-700">Gastado:</span> ${cliente.total_gastado.toLocaleString('es-CO')}</p>
                                                                        <p><span className="font-semibold text-gray-700">Última Compra:</span> {cliente.ultima_compra}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal Nueva Campaña */}
            {isCreating && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Nueva Campaña Manual</h2>
                                <p className="text-sm text-gray-500">Configura los parámetros para tu estrategia.</p>
                            </div>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="campaign-form" onSubmit={handleCreateCampaña} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Campaña *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="Ej. Liquidación Verano 2024"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tipo Alcance</label>
                                        <select
                                            value={formData.tipo_alcance}
                                            onChange={(e) => setFormData({ ...formData, tipo_alcance: e.target.value })}
                                            className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option value="MASIVA">Masiva</option>
                                            <option value="INDIVIDUAL">Individual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Duración (Días)</label>
                                        <input
                                            type="number" min="1" required
                                            value={formData.duracion_dias}
                                            onChange={(e) => setFormData({ ...formData, duracion_dias: parseInt(e.target.value) })}
                                            className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Producto a Impulsar (Opcional)</label>
                                    <select
                                        value={formData.producto_id}
                                        onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                                        className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="">-- Sin producto en el sistema --</option>
                                        {productos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Segmento</label>
                                        <input
                                            type="text"
                                            value={formData.segmento_id}
                                            onChange={(e) => setFormData({ ...formData, segmento_id: e.target.value })}
                                            className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Meta Ventas</label>
                                        <input
                                            type="number" min="1" required
                                            value={formData.meta_ventas}
                                            onChange={(e) => setFormData({ ...formData, meta_ventas: parseInt(e.target.value) })}
                                            className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="campaign-form"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-md transition-all flex items-center gap-2">
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Creando...' : 'Crear Campaña'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
