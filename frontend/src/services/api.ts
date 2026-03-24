import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  Appointment,
  AuthTokens,
  Client,
  PaginatedResponse,
  Pet,
  PublicBusiness,
  RegisterPayload,
  Service,
  User,
} from "../types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api/";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  const path = url.replace(/^https?:\/\/[^/]+\/api\/?/, "");
  return (
    path.startsWith("public/") ||
    path.startsWith("auth/register/") ||
    path.startsWith("auth/token/")
  );
}

function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
}

const API: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ access, refresh }: Partial<AuthTokens>): void {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function redirectToLogin(): void {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    throw new Error("No refresh token available");
  }

  const { data } = await refreshClient.post<AuthTokens>("auth/token/refresh/", {
    refresh,
  });

  setTokens({ access: data.access, refresh: data.refresh || refresh });
  return data.access;
}

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !isPublicEndpoint(config.url)) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url;

    if (isPublicEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.set(
          "Authorization",
          `Bearer ${newAccessToken}`,
        );
        return API(originalRequest);
      } catch {
        clearTokens();
        redirectToLogin();
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email: string, password: string) =>
    API.post<AuthTokens>("auth/token/", { email, password }),
  me: () => API.get<User>("auth/me/"),
  register: (data: RegisterPayload) => API.post<User>("auth/register/", data),
  createUser: (data: {
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: "staff" | "owner" | "super_admin";
  }) => API.post<User>("auth/users/", data),
  refresh: () => refreshAccessToken(),
};

export const publicAPI = {
  businesses: () =>
    API.get<PaginatedResponse<PublicBusiness>>("public/businesses/"),
};

export const clientAPI = {
  list: () => API.get<PaginatedResponse<Client>>("clients/"),
  create: (data: Partial<Client>) => API.post<Client>("clients/", data),
  update: (id: string, data: Partial<Client>) =>
    API.patch<Client>(`clients/${id}/`, data),
  remove: (id: string) => API.delete(`clients/${id}/`),
};

export const petAPI = {
  list: () => API.get<PaginatedResponse<Pet>>("pets/"),
  create: (data: Partial<Pet>) => API.post<Pet>("pets/", data),
  update: (id: string, data: Partial<Pet>) =>
    API.patch<Pet>(`pets/${id}/`, data),
  remove: (id: string) => API.delete(`pets/${id}/`),
};

export const serviceAPI = {
  list: () => API.get<PaginatedResponse<Service>>("services/"),
};

export const staffAPI = {
  list: () => API.get<PaginatedResponse<Service>>("staff/"),
  create: (data: Partial<Service>) => API.post<Service>("staff/", data),
  update: (id: string, data: Partial<Service>) =>
    API.patch<Service>(`staff/${id}/`, data),
  remove: (id: string) => API.delete(`staff/${id}/`),
};

export const appointmentAPI = {
  list: () => API.get<PaginatedResponse<Appointment>>("appointments/"),
  create: (data: Partial<Appointment>) =>
    API.post<Appointment>("appointments/", data),
  update: (id: string, data: Partial<Appointment>) =>
    API.patch<Appointment>(`appointments/${id}/`, data),
  remove: (id: string) => API.delete(`appointments/${id}/`),
};

export default API;
