// API Configuration - Change this to your hosting URL
const API_BASE_URL = 'https://caba-dz.com/api';

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// HTTP helper
const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
};

// ===== AUTH API =====
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    username: string;
    wilaya: string;
  }) => {
  const result = await request('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.access_token) {
      setToken(result.access_token);
    }
    return result;
  },

  login: async (email: string, password: string) => {
    const result = await request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.access_token) {
      setToken(result.access_token);
    }
    return result;
  },

  getMe: async () => {
    return request('/auth/me.php');
  },

  googleLogin: async (idToken: string) => {
    const result = await request('/auth/google.php', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    if (result.access_token) {
      setToken(result.access_token);
    }
    return result;
  },

  logout: () => {
    removeToken();
  },

  isAuthenticated: () => !!getToken(),
  
  getToken,
  setToken,
};

// ===== PROFILES API =====
export const profilesApi = {
  getProfile: async (userId: string) => {
    return request(`/profiles/index.php?user_id=${userId}`);
  },

  updateProfile: async (data: {
    full_name?: string;
    username?: string;
    wilaya?: string;
    avatar_url?: string;
  }) => {
    return request('/profiles/update.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/profiles/upload-avatar.php`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    
    return data;
  },

  getAll: async () => {
    return request('/profiles/index.php');
  },

  delete: async (userId: string) => {
    return request(`/profiles/update.php?user_id=${userId}`, {
      method: 'DELETE',
    });
  },
};

// ===== CURRENCIES API =====
export const currenciesApi = {
  getAll: async () => {
    return request('/currencies/index.php');
  },

  create: async (data: {
    code: string;
    name_ar: string;
    name_en: string;
    type: string;
    icon_url?: string;
    buy_price?: number;
    sell_price?: number;
    display_order?: number;
  }) => {
    return request('/currencies/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    code?: string;
    name_ar?: string;
    name_en?: string;
    type?: string;
    icon_url?: string;
    buy_price?: number;
    sell_price?: number;
    is_active?: boolean;
    display_order?: number;
  }) => {
    return request(`/currencies/update.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request(`/currencies/update.php?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== COMMENTS API =====
export const commentsApi = {
  getByCode: async (currencyCode: string) => {
    return request(`/comments/index.php?currency_code=${currencyCode}`);
  },

  create: async (data: {
    currency_code: string;
    content: string;
    is_guest?: boolean;
    guest_name?: string;
    parent_id?: string | null;
  }) => {
    return request('/comments/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request(`/comments/delete.php?id=${id}`, {
      method: 'DELETE',
    });
  },

  like: async (commentId: string, guestId?: string) => {
    return request('/comments/like.php', {
      method: 'POST',
      body: JSON.stringify({ comment_id: commentId, guest_id: guestId }),
    });
  },

  dislike: async (commentId: string, guestId?: string) => {
    return request('/comments/dislike.php', {
      method: 'POST',
      body: JSON.stringify({ comment_id: commentId, guest_id: guestId }),
    });
  },

  getLikes: async (guestId?: string) => {
    const url = guestId 
      ? `/comments/like.php?guest_id=${guestId}`
      : '/comments/like.php';
    return request(url);
  },

  getDislikes: async (guestId?: string) => {
    const url = guestId 
      ? `/comments/dislike.php?guest_id=${guestId}`
      : '/comments/dislike.php';
    return request(url);
  },
};

// ===== ADMIN API =====
export const adminApi = {
  getUsers: async () => {
    return request('/admin/users.php');
  },

  getStats: async () => {
    return request('/admin/stats.php');
  },

  getSettings: async () => {
    return request('/admin/settings.php');
  },

  updateSettings: async (data: {
    registration_enabled?: string;
    email_verification_required?: string;
    google_login_enabled?: string;
    guest_comments_enabled?: string;
    site_name?: string;
    site_description?: string;
  }) => {
    return request('/admin/settings.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// User type for PHP API
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  wilaya: string | null;
  avatar_url: string | null;
  member_number: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string | null;
  currency_code: string;
  content: string;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  is_guest: boolean;
  guest_name: string | null;
  parent_id: string | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

export interface Currency {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  type: string;
  icon_url: string | null;
  buy_price: number | null;
  sell_price: number | null;
  is_active: boolean;
  display_order: number;
}
