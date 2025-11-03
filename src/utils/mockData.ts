import { Project, Delivery, Comment } from '@/types';

// Initialize mock data in localStorage
export const initializeMockData = () => {
  if (!localStorage.getItem('academic_projects')) {
    const mockComments: Comment[] = [
      {
        id: 'c1',
        authorId: '2',
        authorName: 'Dr. Carlos Rodríguez',
        body: 'Excelente análisis del algoritmo QuickSort. Sin embargo, falta profundizar en el caso promedio.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        replies: [
          {
            id: 'r1',
            authorId: '1',
            authorName: 'Ana García',
            body: 'Gracias profesor, agregaré más detalles sobre el análisis del caso promedio.',
            timestamp: new Date(Date.now() - 43200000).toISOString()
          }
        ]
      }
    ];

    const mockDeliveries: Delivery[] = [
      {
        id: 'd1',
        projectId: 'proyecto-a',
        title: 'Entrega 1: Análisis de complejidad',
        description: 'Análisis teórico de algoritmos de ordenamiento',
        dueDate: '2024-11-20',
        submittedAt: '2024-11-19',
        grade: 85,
        comments: mockComments
      },
      {
        id: 'd2',
        projectId: 'proyecto-a',
        title: 'Entrega 2: Implementación práctica',
        description: 'Implementación y pruebas de rendimiento',
        dueDate: '2024-12-01',
        comments: []
      }
    ];

    const mockProjects: Project[] = [
      {
        id: 'proyecto-a',
        name: 'Análisis de Algoritmos',
        description: 'Investigación sobre complejidad computacional y optimización de algoritmos de ordenamiento.',
        status: 'active',
        participants: 15,
        deadline: '2024-12-15',
        category: 'investigacion',
        teamId: 'equipo-alfa',
        deliveries: mockDeliveries
      },
      {
        id: 'proyecto-b',
        name: 'Desarrollo Web Avanzado',
        description: 'Proyecto de desarrollo de aplicaciones web modernas con React y Node.js.',
        status: 'active',
        participants: 8,
        deadline: '2024-11-30',
        category: 'desarrollo',
        teamId: 'equipo-delta',
        deliveries: []
      },
      {
        id: 'proyecto-c',
        name: 'Machine Learning Aplicado',
        description: 'Implementación de modelos de aprendizaje automático para análisis de datos.',
        status: 'pending',
        participants: 12,
        deadline: '2025-01-20',
        category: 'analisis',
        teamId: 'equipo-beta',
        deliveries: []
      }
    ];

    localStorage.setItem('academic_projects', JSON.stringify(mockProjects));
  }

  if (!localStorage.getItem('academic_reports')) {
    localStorage.setItem('academic_reports', JSON.stringify([]));
  }
};

export const getProjects = (): Project[] => {
  const data = localStorage.getItem('academic_projects');
  return data ? JSON.parse(data) : [];
};

export const getProject = (projectId: string): Project | undefined => {
  return getProjects().find(p => p.id === projectId);
};

export const updateProject = (project: Project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    localStorage.setItem('academic_projects', JSON.stringify(projects));
  }
};

export const clearDemoData = () => {
  localStorage.removeItem('academic_projects');
  localStorage.removeItem('academic_reports');
  localStorage.removeItem('audit_log');
  initializeMockData();
};
