import { config, logger } from '@/config/env';

// Usar siempre la URL del backend desde la variable de entorno
const API_BASE_URL = config.apiUrl;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMinutes: number;
  user: {
    username: string;
    email: string;
    roles: string[];
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    
    if (status === 204) {
      return { status };
    }

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.ok) {
      return { data, status };
    } else {
      const error = typeof data === 'string' ? data : data?.message || 'Error desconocido';
      return { error, status };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials)
      });

      const result = await this.handleResponse<LoginResponse>(response);
      if (result.data) {
        logger.info('Login successful for user:', result.data.user.username);
      } else {
        logger.warn('Login failed:', result.error);
      }
      return result;
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<LoginResponse['user']>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  // Users endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<User[]>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async getUsersWithRoles(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/with-roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<User[]>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async createUser(user: Omit<User, 'id'> & { password: string }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user)
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async updateUser(id: number, user: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user)
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  // Roles endpoints
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<Role[]>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async getUserRoles(userId: number): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<string[]>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async assignUserRole(userId: number, roleName: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/roles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name: roleName })
      });

      return this.handleResponse<string[]>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  async removeUserRole(userId: number, roleName: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/roles`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name: roleName })
      });

      return this.handleResponse<string[]>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<{ status: string; url?: string; product?: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/db`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return this.handleResponse<{ status: string; url?: string; product?: string }>(response);
    } catch (error) {
      return { 
        error: 'Error de conexión con el servidor', 
        status: 0 
      };
    }
  }
}

export const apiService = new ApiService();