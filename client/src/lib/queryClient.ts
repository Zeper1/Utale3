import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { headers?: Record<string, string> }
): Promise<Response> {
  // Si data es FormData, no establecemos Content-Type para que el navegador lo maneje
  const isFormData = data instanceof FormData;
  
  // Obtener usuario del localStorage si existe
  let firebaseUid = null;
  let userId = null;
  try {
    // Intentar obtener las credenciales almacenadas en localStorage
    const storedUser = localStorage.getItem('utale_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.firebaseUid) {
        firebaseUid = parsedUser.firebaseUid;
      }
      if (parsedUser.id) {
        userId = parsedUser.id;
      }
    }
  } catch (e) {
    console.error("Error al obtener credentials de localStorage:", e);
  }
  
  const res = await fetch(url, {
    method,
    headers: {
      // Si no es FormData y hay datos, establecer Content-Type como application/json
      ...(data && !isFormData ? { "Content-Type": "application/json" } : {}),
      // Añadir cabeceras de autenticación si están disponibles
      ...(firebaseUid ? { "X-Firebase-UID": firebaseUid } : {}),
      ...(userId ? { "Authorization": `Bearer ${userId}` } : {}),
      // Mezclar con headers adicionales si se proporcionan
      ...(options?.headers || {})
    },
    // Si es FormData, enviar directamente; si no, stringify sólo si hay datos
    body: isFormData ? data as FormData : data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Obtener usuario del localStorage si existe
    let firebaseUid = null;
    let userId = null;
    try {
      // Intentar obtener las credenciales almacenadas en localStorage
      const storedUser = localStorage.getItem('utale_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.firebaseUid) {
          firebaseUid = parsedUser.firebaseUid;
        }
        if (parsedUser.id) {
          userId = parsedUser.id;
        }
      }
    } catch (e) {
      console.error("Error al obtener credentials de localStorage:", e);
    }
    
    const headers: Record<string, string> = {};
    
    // Añadir cabeceras de autenticación si están disponibles
    if (firebaseUid) {
      headers["X-Firebase-UID"] = firebaseUid;
    }
    if (userId) {
      headers["Authorization"] = `Bearer ${userId}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
