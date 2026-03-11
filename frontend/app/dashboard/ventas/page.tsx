"use client";

import React, { useState, useEffect } from 'react';
import { getVentas, getVentaDetalles, getNegocio } from '@/lib/api';
import {
    Search,
    FileText,
    Calendar as CalendarIcon,
    DollarSign,
    CreditCard,
    TrendingUp,
    Store,
    Download,
    Loader2
} from 'lucide-react';

interface Venta {
    id: string;
    numero_factura: string;
    fecha_emision: string;
    total: number;
    estado: string;
    clientes: { nombre: string } | null;
}

export default function VentasPage() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownloadPDF = async (venta: Venta) => {
        try {
            setDownloadingId(venta.id);

            // Cargar jsPDF y autoTable desde CDN
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

            const detallesRes = await getVentaDetalles(venta.id);
            const detalles = detallesRes.data || [];

            const negocioId = localStorage.getItem('negocio_id') || "";
            let negocioName = "Mi Negocio";
            let colorAcento = '#2563eb'; // Default blue-600

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

            // Parse hex color for PDF
            const r = parseInt(colorAcento.slice(1, 3), 16) || 37;
            const g = parseInt(colorAcento.slice(3, 5), 16) || 99;
            const b = parseInt(colorAcento.slice(5, 7), 16) || 235;

            // Diseño Premium - Encabezado
            doc.setFillColor(r, g, b);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text(negocioName, 14, 25);

            doc.setFontSize(10);
            doc.text(`Factura: ${venta.numero_factura}`, 140, 20);
            doc.text(`Fecha: ${new Date(venta.fecha_emision).toLocaleDateString('es-CO')}`, 140, 28);

            // Información del Cliente y Estado
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Detalles de facturación:', 14, 55);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Cliente: ${venta.clientes?.nombre || 'Consumidor Final'}`, 14, 62);
            doc.text(`Estado: ${venta.estado}`, 14, 68);

            // Generar Tabla de Productos
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

            // Totales al final
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total a pagar: $${venta.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`, 130, finalY + 15);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 150);
            doc.text('¡Gracias por su compra!', 105, finalY + 35, { align: 'center' });

            doc.save(`Factura_${venta.numero_factura}.pdf`);

        } catch (error) {
            console.error("Error generando PDF", error);
            alert("Ocurrió un error generando el PDF de la factura.");
        } finally {
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const fallbackNegocioId = localStorage.getItem("negocio_id") || "";
                if (fallbackNegocioId) {
                    const res = await getVentas(fallbackNegocioId);
                    setVentas(res.data || []);
                }
            } catch (error) {
                console.error("Error fetching ventas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, []);

    const filteredVentas = ventas.filter(v =>
        v.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.clientes?.nombre || 'Consumidor Final').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = ventas.filter(v => v.estado !== 'ANULADA').reduce((sum, v) => sum + v.total, 0);
    const activeSalesCount = ventas.filter(v => v.estado !== 'ANULADA').length;

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Historial de Ventas</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestiona las facturas y recibos emitidos en tu negocio</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ingresos</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            ${totalRevenue.toLocaleString('es-CO')}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Facturas Emitidas</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeSalesCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Table Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar por factura o cliente..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                <th className="px-6 py-4">Factura</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Cargando ventas...
                                    </td>
                                </tr>
                            ) : filteredVentas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No hay facturas registradas.
                                    </td>
                                </tr>
                            ) : (
                                filteredVentas.map((venta) => (
                                    <tr key={venta.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {venta.numero_factura}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {venta.clientes?.nombre || 'Consumidor Final'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <CalendarIcon className="h-4 w-4" />
                                                {new Date(venta.fecha_emision).toLocaleDateString('es-CO')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${venta.estado === 'VIGENTE'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/20 dark:ring-emerald-500/20'
                                                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/20 dark:ring-red-500/20'
                                                }`}>
                                                {venta.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                ${venta.total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDownloadPDF(venta)}
                                                disabled={downloadingId === venta.id}
                                                className="inline-flex items-center justify-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors disabled:opacity-50"
                                                title="Descargar Factura PDF"
                                            >
                                                {downloadingId === venta.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Download className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
