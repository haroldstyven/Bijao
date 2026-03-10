"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getNegocio } from '@/lib/api';

type ThemeContextType = {
    theme: string;
    colorAcento: string;
    setTheme: (t: string) => void;
    setColorAcento: (c: string) => void;
    refreshThemeInfo: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState('light');
    const [colorAcento, setColorAcentoState] = useState('#3B82F6');

    const refreshThemeInfo = async () => {
        const negocioId = typeof window !== 'undefined' ? localStorage.getItem('negocio_id') : null;
        if (negocioId) {
            try {
                const data = await getNegocio(negocioId);
                if (data.tema) setThemeState(data.tema);
                if (data.color_acento) setColorAcentoState(data.color_acento);
            } catch (err) {
                console.error("Error obteniendo configuraciones del negocio para el tema.", err);
            }
        }
    };

    useEffect(() => {
        refreshThemeInfo();
    }, []);

    // Update DOM explicitly
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // You can apply standard variables so that any UI element using them reacts contextually
        root.style.setProperty('--color-primary', colorAcento);
    }, [theme, colorAcento]);

    return (
        <ThemeContext.Provider value={{
            theme,
            colorAcento,
            setTheme: setThemeState,
            setColorAcento: setColorAcentoState,
            refreshThemeInfo
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
}
