const BASE_URL = "http://127.0.0.1:8000";

export async function api(path: string, options: any = {}) {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  let res = await fetch(BASE_URL + path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // If token expired, try to refresh
  if (res.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(BASE_URL + "/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const { access_token } = await refreshRes.json();
        localStorage.setItem("access_token", access_token);
        
        // Retry original request with new token
        headers.Authorization = `Bearer ${access_token}`;
        res = await fetch(BASE_URL + path, {
          ...options,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      // Redirect to login if refresh fails
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      throw err;
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    console.error(`API Error [${res.status}]`, error);
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Create a dedicated auth API function
export const authApi = {
  async login(ssn: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", ssn);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Login failed");
    }

    return res.json();
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};