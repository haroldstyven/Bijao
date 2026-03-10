"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Scissors, Cake, Shirt, Briefcase, Plus,
    UploadCloud, Moon, Sun, ArrowRight, ArrowLeft
} from 'lucide-react';
import { updateNegocio } from '@/lib/api';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [businessType, setBusinessType] = useState('');
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('light');
    const [color, setColor] = useState('#3B82F6'); // Default Blue
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Colors array for Step 4
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F97316', '#475569'];

    const handleComplete = async () => {
        setLoading(true);
        try {
            const negocioId = localStorage.getItem('negocio_id');
            if (negocioId) {
                await updateNegocio(negocioId, {
                    tipo_negocio: businessType || undefined,
                    nombre: name || undefined,
                    tema: theme,
                    color_acento: color,
                    logo_url: logoBase64 || undefined
                });
            }
            router.push('/dashboard');
        } catch (err) {
            console.error('Error al actualizar negocio', err);
            // Failsafe to not block the user
            router.push('/dashboard');
        }
    };

    const handleSkipAll = () => {
        router.push('/dashboard');
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans transition-colors duration-300">
            {/* Navbar */}
            <nav className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-sm">
                        B
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">Bijao</span>
                </div>
                <button
                    onClick={handleSkipAll}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Omitir todo e ir al Dashboard
                </button>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 w-full relative">
                {/* Progress Bar Container */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                {/* Step 1: Rubro */}
                <div className={`transition-all duration-500 w-full max-w-4xl mx-auto ${step === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden'}`}>
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-3 tracking-tight">¿Cuál es el rubro de tu negocio?</h2>
                    <p className="text-center text-lg text-gray-500 mb-10">Esto nos formará el punto de partida en Bijao para ti.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { id: 'barberia', title: 'Barbería / Salón', icon: Scissors },
                            { id: 'comida', title: 'Repostería / Comida', icon: Cake },
                            { id: 'retail', title: 'Tienda de Ropa', icon: Shirt },
                            { id: 'servicios', title: 'Servicios', icon: Briefcase },
                            { id: 'otro', title: 'Otro', icon: Plus },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setBusinessType(cat.title)}
                                className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-200 ${businessType === cat.title
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-105'
                                    : 'border-white hover:border-blue-200 bg-white text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1'
                                    }`}
                            >
                                <cat.icon className="w-12 h-12 mb-4 stroke-[1.5]" />
                                <span className="font-semibold text-lg">{cat.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Nombre */}
                <div className={`transition-all duration-500 w-full max-w-2xl mx-auto ${step === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden'}`}>
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-3 tracking-tight">¿Cómo se llama tu negocio?</h2>
                    <p className="text-center text-lg text-gray-500 mb-10">El nombre que verán tus clientes en recibos y pantalla.</p>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Salón Bijao"
                        className="w-full text-center text-3xl font-bold px-8 py-6 rounded-3xl border-2 border-gray-300 text-gray-900 shadow-sm bg-white focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                        autoFocus={step === 2}
                    />
                </div>

                {/* Step 3: Logo */}
                <div className={`transition-all duration-500 w-full max-w-2xl mx-auto ${step === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden'}`}>
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-3 tracking-tight">Sube tu logo</h2>
                    <p className="text-center text-lg text-gray-500 mb-10">Identidad visual. Puedes saltarlo y configurarlo luego.</p>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-3xl p-16 flex flex-col items-center justify-center bg-white hover:bg-gray-50 hover:border-blue-400 cursor-pointer transition-colors group relative overflow-hidden"
                    >
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {logoBase64 ? (
                            <img src={logoBase64} alt="Logo Preview" className="w-32 h-32 object-cover rounded-full shadow-md mb-6" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                                <UploadCloud className="w-10 h-10" />
                            </div>
                        )}
                        <p className="font-semibold text-xl text-gray-900 mb-2">Haz clic o arrastra una imagen</p>
                        <p className="text-gray-500">SVG, PNG, JPG (max. 2MB)</p>
                    </div>
                </div>

                {/* Step 4: Tema y Color */}
                <div className={`transition-all duration-500 w-full max-w-2xl mx-auto ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 hidden'}`}>
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-3 tracking-tight">Personaliza tu espacio</h2>
                    <p className="text-center text-lg text-gray-500 mb-10">Configura la apariencia para que se adapte a tu marca.</p>

                    <div className="space-y-10 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-5">Tema Base</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'light'
                                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600 fill-blue-100/50' : 'text-gray-400'}`} />
                                    <span className="font-semibold text-lg text-gray-900">Modo Claro</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'dark'
                                        ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-white fill-white/20' : 'text-gray-400'}`} />
                                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Modo Oscuro</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-5">Color de acento</h3>
                            <div className="flex justify-between gap-4">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${color === c
                                            ? 'ring-4 ring-offset-4 ring-gray-200 scale-110 shadow-lg'
                                            : 'hover:scale-110 hover:shadow-md opacity-80'
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-6 z-10 transition-all">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="w-32">
                            {step > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Atrás
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-6 w-32 justify-end">
                            <button
                                onClick={nextStep}
                                className={`text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors ${step === 4 ? 'hidden' : 'block'}`}
                            >
                                Omitir
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-[160px] justify-center"
                                >
                                    Siguiente
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-[240px] justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {loading ? 'Preparando...' : 'Finalizar Setup'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Spacer para el footer fijo */}
            <div className="h-32"></div>
        </div>
    );
}
