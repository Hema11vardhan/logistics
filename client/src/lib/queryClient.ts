import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const contentType = res.headers.get("content-type");
      let errorMessage = `${res.status}: ${res.statusText}`;
      
      if (contentType && contentType.includes("application/json")) {
        // Try to parse as JSON first
        const clone = res.clone(); // Clone to avoid consuming the body
        try {
          const errorData = await clone.json();
          console.error("Server error response (JSON):", errorData);
          if (errorData.message) {
            errorMessage = `${res.status}: ${errorData.message}`;
          }
          if (errorData.details) {
            errorMessage += ` - Details: ${JSON.stringify(errorData.details)}`;
          }
        } catch (e) {
          console.error("Failed to parse JSON error response, falling back to text", e);
          const text = await res.text();
          errorMessage = `${res.status}: ${text || res.statusText}`;
        }
      } else {
        // Not JSON, just get text
        const text = await res.text();
        errorMessage = `${res.status}: ${text || res.statusText}`;
      }
      
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    } catch (e) {
      if (e instanceof Error) {
        throw e; // Re-throw if already an Error
      }
      throw new Error(`${res.status}: Unknown error`);
    }
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const method = options?.method || 'GET';
  const data = options?.data;
  const additionalHeaders = options?.headers || {};

  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...additionalHeaders
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
