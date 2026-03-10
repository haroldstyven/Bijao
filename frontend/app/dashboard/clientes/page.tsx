"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Loader2, Save, X, Users, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/lib/api';

interface Cliente {
    id: string;
    nombre: string;
    email?: string;
    celular?: string;
    cumpleanos?: string;
    negocio_id?: string;
}

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [cumpleanos, setCumpleanos] = useState('');

    useEffect(() => {
        const storedNegocioId = localStorage.getItem('negocio_id');
        if (storedNegocioId) {
            setBusinessId(storedNegocioId);
            fetchClientes(storedNegocioId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchClientes = async (nid: string) => {
        setIsLoading(true);
        try {
            const res = await getClientes(nid);
            setClientes(res.data || []);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (cliente?: Cliente) => {
        if (cliente) {
            setEditingCliente(cliente);
            setNombre(cliente.nombre);
            setEmail(cliente.email || '');
            setCelular(cliente.celular || '');
            setCumpleanos(cliente.cumpleanos || '');
        } else {
            setEditingCliente(null);
            setNombre('');
            setEmail('');
            setCelular('');
            setCumpleanos('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCliente(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessId) return;
        setIsSaving(true);
        try {
            const data = {
                nombre,
                email: email || null,
                celular: celular || null,
                cumpleanos: cumpleanos || null,
                negocio_id: businessId
            };

            if (editingCliente) {
                await updateCliente(editingCliente.id, data);
            } else {
                await createCliente(data);
            }
            await fetchClientes(businessId);
            handleCloseModal();
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            alert("Error al guardar cliente");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!businessId) return;
        if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
        try {
            await deleteCliente(id);
            await fetchClientes(businessId);
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const filteredUsers = clientes.filter(p => {
        return p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.celular && p.celular.includes(searchTerm));
    });

    const activeCustomers = clientes.length;

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Clientes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra la información, contacto y notas de todos tus clientes.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                        <Plus className="h-4 w-4" />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clientes</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCustomers}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Cumpleaños</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Cargando clientes...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron clientes. Registra tu primer cliente.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold shrink-0">
                                                    {item.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{item.nombre}</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">ID: {item.id.slice(0, 6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
                                                {item.email && (
                                                    <div className="flex items-center gap-1.5 break-all">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                        <span>{item.email}</span>
                                                    </div>
                                                )}
                                                {item.celular && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                        <span>{item.celular}</span>
                                                    </div>
                                                )}
                                                {!item.email && !item.celular && <span className="text-gray-400 italic">Sin datos</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                {item.cumpleanos ? (
                                                    <>
                                                        <Calendar className="h-3.5 w-3.5 text-pink-400" />
                                                        <span>{item.cumpleanos}</span>
                                                    </>
                                                ) : <span className="text-gray-400 italic">No especificado</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para Nuevo/Editar Cliente */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="cliente-form" onSubmit={handleSave} className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                                    <input
                                        type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono o WhatsApp</label>
                                    <input
                                        type="tel" value={celular} onChange={(e) => setCelular(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="+57 320 000 0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cumpleaños</label>
                                    <input
                                        type="date" value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Útil para promociones o saludos de cumpleaños personalizados.</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="cliente-form" disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-75 disabled:cursor-not-allowed">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

