// Core types for the academic system

export type UserRole = 'estudiante' | 'profesor' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  authorizedProjects: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  timestamp: string;
  replies: Reply[];
  isNew?: boolean;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  timestamp: string;
  editedAt?: string;
}

export interface Delivery {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  submittedAt?: string;
  grade?: number;
  comments: Comment[];
}

// Project interface from backend API
export interface ProjectFromAPI {
  id: number;
  name: string;
  description: string;
  statusId: number;
  createdAt: string;
  courseId: number;
}

// Delivery interface from backend API
export interface DeliveryFromAPI {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  projectId: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  participants: number;
  deadline: string;
  category: 'investigacion' | 'desarrollo' | 'analisis';
  teamId: string;
  deliveries: Delivery[];
}

export interface Report {
  id: string;
  projectId: string;
  type: 'student' | 'team';
  createdBy: string;
  createdAt: string;
  contentHtml: string;
}
