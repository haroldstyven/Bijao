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
