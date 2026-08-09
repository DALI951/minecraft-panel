let token = null;

export function setToken(t) {
  token = t;
}

export function getToken() {
  return token;
}

export async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    token = null;
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res.json();
}
