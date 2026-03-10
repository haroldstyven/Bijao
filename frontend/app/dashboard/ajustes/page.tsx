"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Settings,
    Building2,
    Image as ImageIcon,
    Palette,
    Sun,
    Moon,
    Save,
    DownloadCloud,
    UploadCloud,
    X,
    LogOut,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getNegocio, updateNegocio } from '@/lib/api';

export default function AjustesPage() {
    const router = useRouter();
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessName, setBusinessName] = useState('');
    const [theme, setTheme] = useState('light');
    const [accentColor, setAccentColor] = useState('#3B82F6');
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchNegocio = async () => {
            const storedNegocioId = localStorage.getItem('negocio_id');
            if (!storedNegocioId) {
                setIsLoading(false);
                return;
            }
            setBusinessId(storedNegocioId);
            try {
                const b = await getNegocio(storedNegocioId);
                if (b.nombre) setBusinessName(b.nombre);
                if (b.tema) setTheme(b.tema);
                if (b.color_acento) setAccentColor(b.color_acento);
                if (b.logo_url) setLogoBase64(b.logo_url);
            } catch (err) {
                console.error("No se pudo obtener la configuración", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNegocio();
    }, []);

    const handleSave = async () => {
        if (!businessId) return;
        setIsSaving(true);
        try {
            await updateNegocio(businessId, {
                nombre: businessName,
                tema: theme,
                color_acento: accentColor,
                logo_url: logoBase64 || undefined
            });
            alert('Ajustes guardados correctamente');
            window.location.reload();
        } catch (err) {
            alert('Ajustes no se guardaron. Revisa tu conexión.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const presetColors = [
        { name: 'Red', hex: '#EF4444', bg: 'bg-red-500' },
        { name: 'Purple', hex: '#8B5CF6', bg: 'bg-purple-500' },
        { name: 'Orange', hex: '#F97316', bg: 'bg-orange-500' },
        { name: 'Pink', hex: '#EC4899', bg: 'bg-pink-500' },
        { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-500' },
        { name: 'Green', hex: '#10B981', bg: 'bg-green-500' },
    ];

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-600" />
                    Ajustes
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personaliza Bijao a tu gusto: tu marca, tus colores y configuraciones.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col gap-8 p-6 md:p-8">

                {/* Section: Business Name */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nombre del Negocio</h2>
                    </div>
                    <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                </section>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Section: Logo */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Logo (PNG)</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        {logoBase64 ? (
                            <div className="h-20 w-20 rounded-full bg-black flex items-center justify-center overflow-hidden shadow-md">
                                <img src={logoBase64} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-black flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                {businessName.charAt(0) || 'M'}
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Seleccionar PNG/JPG
                            </button>
                            <button
                                onClick={() => setLogoBase64(null)}
                                className="flex items-center text-red-500 text-sm font-medium hover:text-red-700 transition-colors px-1"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Quitar logo
                            </button>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100 dark:border-slate-700" />

                {/* Section: Appearance */}
                <section className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Apariencia</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Theme Selectors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Tema de la interfaz</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 outline outline-4 outline-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <Sun className={`h-8 w-8 ${theme === 'light' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="text-sm font-semibold text-gray-700">Modo Claro</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500 bg-gray-900 outline outline-4 outline-blue-50 dark:outline-blue-900' : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 hover:border-gray-300'}`}
                                >
                                    <Moon className={`h-8 w-8 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>Modo Oscuro</span>
                                </button>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Color de acento</label>
                            <div className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                />
                                <div className="flex gap-3">
                                    {presetColors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setAccentColor(color.hex)}
                                            className={`h-8 w-8 rounded-full shadow-sm transition-transform hover:scale-110 ${color.bg} ${accentColor === color.hex ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Save Button */}
                <div className="mt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 text-lg disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar y aplicar cambios
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Danger Zone / Data Management */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-gray-900">Exportar / Importar Datos</h3>
                    <p className="text-sm text-gray-500 mt-1">Respalda tus configuraciones o migra desde Excel.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm">
                        <DownloadCloud className="h-4 w-4" />
                        Exportar
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm">
                        <UploadCloud className="h-4 w-4" />
                        Importar
                    </button>
                </div>
            </div>

            {/* Logout Action */}
            <div className="flex justify-start">
                <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 text-sm font-semibold hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
                >
                    <LogOut className="h-5 w-5 mr-2" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
