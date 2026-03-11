export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function loginUser(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
    }
    throw error;
  }
}

export async function registerUser(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Error al registrar usuario.');
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
    }
    throw error;
  }
}

export const getNegocio = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/negocios/${negocio_id}`);
  if (!res.ok) throw new Error('Error al obtener el negocio');
  return res.json();
};

export const updateNegocio = async (negocio_id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/negocios/${negocio_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar el negocio');
  return res.json();
};

export const getProductos = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/inventario/${negocio_id}`);
  if (!res.ok) throw new Error('Error al obtener los productos');
  return res.json();
};

export const createProducto = async (data: any) => {
  const res = await fetch(`${API_URL}/api/inventario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al crear el producto');
  }
  return res.json();
};

export const updateProducto = async (producto_id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/inventario/${producto_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar el producto');
  return res.json();
};

export const deleteProducto = async (producto_id: string) => {
  const res = await fetch(`${API_URL}/api/inventario/${producto_id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al eliminar el producto');
  }
  return res.json();
};

export const importarProductos = async (negocio_id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/inventario/${negocio_id}/importar`, {
    method: 'POST',
    body: formData,
    // No headers for Content-Type when using FormData, fetch sets the boundary automatically
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al importar productos');
  }
  return res.json();
};

export const getClientes = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/clientes/${negocio_id}`);
  if (!res.ok) throw new Error('Error al obtener los clientes');
  return res.json();
};

export const createCliente = async (data: any) => {
  const res = await fetch(`${API_URL}/api/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al crear el cliente');
  }
  return res.json();
};

export const updateCliente = async (cliente_id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/clientes/${cliente_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar el cliente');
  return res.json();
};

export const deleteCliente = async (cliente_id: string) => {
  const res = await fetch(`${API_URL}/api/clientes/${cliente_id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al eliminar el cliente');
  }
  return res.json();
};

export const createVenta = async (data: any) => {
  const res = await fetch(`${API_URL}/api/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al procesar la venta');
  }
  return res.json();
};

export const getVentas = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/ventas/${negocio_id}`);
  if (!res.ok) throw new Error('Error al obtener el historial de ventas');
  return res.json();
};

export const getVentaDetalles = async (venta_id: string) => {
  const res = await fetch(`${API_URL}/api/ventas/detalle/${venta_id}`);
  if (!res.ok) throw new Error('Error al obtener los detalles de la venta');
  return res.json();
};

export const createCotizacion = async (data: any) => {
  const res = await fetch(`${API_URL}/api/cotizaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al crear la cotización');
  }
  return res.json();
};

export const getCotizaciones = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/cotizaciones/${negocio_id}`);
  if (!res.ok) throw new Error('Error al obtener el historial de cotizaciones');
  return res.json();
};

export const getCotizacionDetalles = async (cotizacion_id: string) => {
  const res = await fetch(`${API_URL}/api/cotizaciones/detalle/${cotizacion_id}`);
  if (!res.ok) throw new Error('Error al obtener los detalles de la cotización');
  return res.json();
};

export const updateCotizacionEstado = async (cotizacion_id: string, estado: string) => {
  const res = await fetch(`${API_URL}/api/cotizaciones/${cotizacion_id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error('Error al actualizar el estado de la cotización');
  return res.json();
};
