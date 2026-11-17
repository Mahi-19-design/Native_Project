import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('@scamlens_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader, ...(options.headers as Record<string, string> || {}) },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const authService = {
  register: (name: string, email: string, password: string) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProfile: () => request<any>('/auth/profile'),
};

export const analysisService = {
  analyzeMessage: (content: string) =>
    request<any>('/analyze/message', { method: 'POST', body: JSON.stringify({ content }) }),
  analyzeUrl: (url: string) =>
    request<any>('/analyze/url', { method: 'POST', body: JSON.stringify({ url }) }),
  submitFeedback: (reportId: string, feedbackType: string, comments: string) =>
    request<any>('/analyze/feedback', { method: 'POST', body: JSON.stringify({ reportId, feedbackType, comments }) }),
};
