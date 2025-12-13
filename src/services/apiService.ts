const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const sweetService = {
  async getSweets() {
    const res = await fetch(`${API_BASE}/api/sweets`);
    return res.json();
  }
};
