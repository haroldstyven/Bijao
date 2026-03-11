export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeaders = (isFormData = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('negocio_id');
      window.location.href = '/login';
    }
    throw new Error('Sesión expirada o inválida. Por favor, inicia sesión nuevamente.');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Ocurrió un error en la solicitud');
  }
  return res.json();
};

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
  const res = await fetch(`${API_URL}/api/negocios/${negocio_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const updateNegocio = async (negocio_id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/negocios/${negocio_id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getProductos = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/inventario/${negocio_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createProducto = async (data: any) => {
  const res = await fetch(`${API_URL}/api/inventario`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateProducto = async (producto_id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/inventario/${producto_id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteProducto = async (producto_id: string) => {
  const res = await fetch(`${API_URL}/api/inventario/${producto_id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const importarProductos = async (negocio_id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/inventario/${negocio_id}/importar`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });
  return handleResponse(res);
};

export const getClientes = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/clientes/${negocio_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createCliente = async (data: any) => {
  const res = await fetch(`${API_URL}/api/clientes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateCliente = async (cliente_id: string, data: any) => {
  const res = await fetch(`${API_URL}/api/clientes/${cliente_id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteCliente = async (cliente_id: string) => {
  const res = await fetch(`${API_URL}/api/clientes/${cliente_id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const createVenta = async (data: any) => {
  const res = await fetch(`${API_URL}/api/ventas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getVentas = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/ventas/${negocio_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getVentaDetalles = async (venta_id: string) => {
  const res = await fetch(`${API_URL}/api/ventas/detalle/${venta_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createCotizacion = async (data: any) => {
  const res = await fetch(`${API_URL}/api/cotizaciones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getCotizaciones = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/cotizaciones/${negocio_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getCotizacionDetalles = async (cotizacion_id: string) => {
  const res = await fetch(`${API_URL}/api/cotizaciones/detalle/${cotizacion_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const updateCotizacionEstado = async (cotizacion_id: string, estado: string) => {
  const res = await fetch(`${API_URL}/api/cotizaciones/${cotizacion_id}/estado`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  return handleResponse(res);
};

export const getMetricas = async (negocio_id: string) => {
  const res = await fetch(`${API_URL}/api/metricas/${negocio_id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
