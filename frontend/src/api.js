const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("fp_token");
}

function setToken(token) {
  if (token) localStorage.setItem("fp_token", token);
  else localStorage.removeItem("fp_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message =
      (data && (data.detail?.[0]?.msg || data.detail)) ||
      `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : "Request failed");
  }
  return data;
}

export const api = {
  // ---- auth ----
  register: (name, email, password) =>
    request("/register", { method: "POST", body: { name, email, password }, auth: false }),
  login: (email, password) =>
    request("/login", { method: "POST", body: { email, password }, auth: false }),

  // ---- profile ----
  getProfile: () => request("/profile"),
  updateProfile: (profile) => request("/profile", { method: "PUT", body: profile }),

  // ---- daily log ----
  getLogs: () => request("/daily-log"),
  addLog: (entry) => request("/daily-log", { method: "POST", body: entry }),
  deleteLog: (id) => request(`/daily-log/${id}`, { method: "DELETE" }),

  // ---- risk / prediction ----
  predict: (answers) => request("/predict", { method: "POST", body: answers }),
  getLatestRisk: () => request("/risk-latest"),

  // ---- recommendations ----
  getRecommendations: () => request("/recommendations"),
};

export { getToken, setToken };
