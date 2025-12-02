export async function api(path: string, options: any = {}) {
  const token = localStorage.getItem("token");
  const baseUrl = "http://127.0.0.1:8000"; // your FastAPI backend

  const res = await fetch(baseUrl + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
}
