import { config, logger } from '@/config/env';
import type { ProjectFromAPI as ProjectFromAPIType, DeliveryFromAPI } from '@/types';

// URLs de los microservicios
const AUTH_SERVICE_URL = config.services.auth;
const PROJECTS_SERVICE_URL = config.services.projects;
const DELIVERIES_SERVICE_URL = config.services.deliveries;

// Legacy - mantener por compatibilidad
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
      logger.debug(`Attempting login at ${AUTH_SERVICE_URL}`);
      
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
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
      logger.error('Login error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<LoginResponse['user']>(response);
    } catch (error) {
      logger.error('Get current user error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      logger.error('Logout error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  // Users endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<User[]>(response);
    } catch (error) {
      logger.error('Get users error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async getUsersWithRoles(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/with-roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<User[]>(response);
    } catch (error) {
      logger.error('Get users with roles error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async createUser(user: Omit<User, 'id'> & { password: string }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user)
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      logger.error('Create user error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async updateUser(id: number, user: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user)
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      logger.error('Update user error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      logger.error('Delete user error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  // Roles endpoints
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<Role[]>(response);
    } catch (error) {
      logger.error('Get roles error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async getUserRoles(userId: number): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${userId}/roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<string[]>(response);
    } catch (error) {
      logger.error('Get user roles error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async assignUserRole(userId: number, roleName: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${userId}/roles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name: roleName })
      });

      return this.handleResponse<string[]>(response);
    } catch (error) {
      logger.error('Assign user role error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  async removeUserRole(userId: number, roleName: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/users/${userId}/roles`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name: roleName })
      });

      return this.handleResponse<string[]>(response);
    } catch (error) {
      logger.error('Remove user role error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<{ status: string; url?: string; product?: string }>> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/health/db`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return this.handleResponse<{ status: string; url?: string; product?: string }>(response);
    } catch (error) {
      logger.error('Health check error:', error);
      return { 
        error: 'Error de conexión con el servidor de autenticación', 
        status: 0 
      };
    }
  }

  // Projects endpoints
  async getProjectsByStudent(studentId: number): Promise<ApiResponse<ProjectFromAPIType[]>> {
    try {
      logger.debug(`Fetching projects for student ${studentId} from ${PROJECTS_SERVICE_URL}`);
      
      const response = await fetch(`${PROJECTS_SERVICE_URL}/api/projects/student/${studentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<ProjectFromAPIType[]>(response);
      if (result.data) {
        logger.info(`Projects loaded successfully for student ${studentId}:`, result.data.length, 'projects');
      } else {
        logger.warn('Failed to load projects:', result.error);
      }
      return result;
    } catch (error) {
      logger.error('Error fetching projects:', error);
      return { 
        error: 'Error de conexión con el servidor de proyectos', 
        status: 0 
      };
    }
  }

  async getProjectById(projectId: number): Promise<ApiResponse<ProjectFromAPIType>> {
    try {
      logger.debug(`Fetching project ${projectId} from ${PROJECTS_SERVICE_URL}`);
      
      const response = await fetch(`${PROJECTS_SERVICE_URL}/api/projects/${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<ProjectFromAPIType>(response);
      if (result.data) {
        logger.info(`Project ${projectId} loaded successfully`);
      } else {
        logger.warn('Failed to load project:', result.error);
      }
      return result;
    } catch (error) {
      logger.error('Error fetching project:', error);
      return { 
        error: 'Error de conexión con el servidor de proyectos', 
        status: 0 
      };
    }
  }

  // Deliveries endpoints
  async getDeliveriesByProject(projectId: number): Promise<ApiResponse<DeliveryFromAPI[]>> {
    try {
      logger.debug(`Fetching deliveries for project ${projectId} from ${DELIVERIES_SERVICE_URL}`);
      
      const response = await fetch(`${DELIVERIES_SERVICE_URL}/api/deliveries/project/${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<DeliveryFromAPI[]>(response);
      if (result.data) {
        logger.info(`Deliveries loaded successfully for project ${projectId}:`, result.data.length, 'deliveries');
      } else {
        logger.warn('Failed to load deliveries:', result.error);
      }
      return result;
    } catch (error) {
      logger.error('Error fetching deliveries:', error);
      return { 
        error: 'Error de conexión con el servidor de entregas', 
        status: 0 
      };
    }
  }

  async getDeliveryById(deliveryId: number): Promise<ApiResponse<DeliveryFromAPI>> {
    try {
      logger.debug(`Fetching delivery ${deliveryId} from ${DELIVERIES_SERVICE_URL}`);
      
      const response = await fetch(`${DELIVERIES_SERVICE_URL}/api/deliveries/${deliveryId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<DeliveryFromAPI>(response);
      if (result.data) {
        logger.info(`Delivery ${deliveryId} loaded successfully`);
      } else {
        logger.warn('Failed to load delivery:', result.error);
      }
      return result;
    } catch (error) {
      logger.error('Error fetching delivery:', error);
      return { 
        error: 'Error de conexión con el servidor de entregas', 
        status: 0 
      };
    }
  }
}

export const apiService = new ApiService();