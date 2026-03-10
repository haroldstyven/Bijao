"use client";

import React from 'react';
import {
    Sparkles,
    Trash2,
    Send,
    LineChart,
    Package,
    Receipt,
    Megaphone,
    Lightbulb
} from 'lucide-react';

export default function AsistentePage() {
    const suggestActions = [
        { label: 'Analizar Ventas', icon: LineChart },
        { label: 'Ver Inventario', icon: Package },
        { label: 'Crear Factura', icon: Receipt },
        { label: 'Hacer Marketing', icon: Megaphone },
        { label: 'Analizar Negocio', icon: Lightbulb },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto pb-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Centro de Mando IA</h1>
                        <p className="text-gray-500 text-xs font-medium">Asistente Virtual Bijao</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors">
                    <Trash2 className="h-4 w-4" />
                    Limpiar Chat
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] rounded-2xl border border-gray-100 p-6 flex flex-col gap-6 shadow-inner custom-scrollbar mb-6">

                {/* System Message Mock */}
                <div className="flex items-start gap-4">
                    <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                        <p className="text-gray-800 text-[15px] leading-relaxed">
                            ¡Hola! Soy el <strong className="font-bold text-indigo-600">Centro de Mando</strong>. Puedes gestionar todo el negocio desde aquí. Pregúntame sobre tus ventas, píde que cree una cotización, o analicemos el estado de tu inventario. ¿En qué te puedo ayudar hoy?
                        </p>
                    </div>
                </div>

            </div>

            {/* Bottom Area (Sticky to bottom) */}
            <div className="shrink-0 flex flex-col gap-4">
                {/* Suggested Actions */}
                <div className="flex flex-wrap gap-2 justify-start sm:justify-center">
                    {suggestActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={idx}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                            >
                                <Icon className="h-4 w-4" />
                                {action.label}
                            </button>
                        )
                    })}
                </div>

                {/* Chat Input */}
                <div className="relative flex items-end w-full group">
                    <textarea
                        rows={1}
                        placeholder="Escribe algo..."
                        className="w-full bg-white border border-gray-300 rounded-2xl pl-5 pr-16 py-4 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm resize-none custom-scrollbar max-h-32"
                        style={{ minHeight: '56px' }}
                    />
                    <button className="absolute right-2 bottom-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 flex items-center justify-center rounded-xl text-white transition-all shadow-md shadow-blue-500/30">
                        <Send className="h-4 w-4 ml-0.5" />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1">
                    La IA puede cometer errores. Considera verificar la información importante.
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E2E8F0;
          border-radius: 10px;
        }
      `}} />
        </div>
    );
}
