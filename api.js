const API = {
  tokenKey: 'crm_token',

  getToken() {
    return localStorage.getItem(this.tokenKey);
  },

  setToken(token) {
    if (token) localStorage.setItem(this.tokenKey, token);
    else localStorage.removeItem(this.tokenKey);
  },

  async req(method, url, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get(url) { return this.req('GET', url); },
  post(url, body) { return this.req('POST', url, body); },
  put(url, body) { return this.req('PUT', url, body); },
  del(url) { return this.req('DELETE', url); },

  async login(email, password) {
    const data = await this.post('/api/auth/login', { email, password });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async register(name, email, password, role) {
    return await this.post('/api/auth/register', { name, email, password, role });
  },

  logout() {
    this.setToken(null);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  getStoredUser() {
    try {
      const token = this.getToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { userId: payload.userId, name: payload.name, email: payload.email, role: payload.role };
    } catch { return null; }
  }
};
