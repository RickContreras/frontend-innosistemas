import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  FileText,
  Download,
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

// Mock project details
const projectDetails = {
  'proyecto-a': {
    name: 'Análisis de Algoritmos',
    description: 'Investigación exhaustiva sobre complejidad computacional y optimización de algoritmos de ordenamiento, incluyendo análisis empírico y teórico.',
    status: 'active',
    participants: 15,
    deadline: '2024-12-15',
    category: 'investigacion',
    progress: 65,
    instructor: 'Dr. Carlos Rodríguez',
    resources: [
      'Manual de Algoritmos Avanzados',
      'Dataset de Pruebas',
      'Plantillas de Análisis'
    ],
    activities: [
      { name: 'Entrega parcial 1', date: '2024-10-15', completed: true },
      { name: 'Presentación intermedia', date: '2024-11-01', completed: true },
      { name: 'Entrega final', date: '2024-12-15', completed: false }
    ],
    announcements: [
      {
        title: 'Nueva extensión de plazo',
        content: 'Se ha extendido la fecha límite de entrega final hasta el 20 de diciembre.',
        date: '2024-10-20'
      },
      {
        title: 'Recursos adicionales disponibles',
        content: 'Se han agregado nuevos datasets en la sección de recursos.',
        date: '2024-10-18'
      }
    ]
  },
  'proyecto-b': {
    name: 'Desarrollo Web Avanzado',
    description: 'Proyecto integral de desarrollo de aplicaciones web modernas utilizando tecnologías como React, Node.js, y bases de datos NoSQL.',
    status: 'active',
    participants: 8,
    deadline: '2024-11-30',
    category: 'desarrollo',
    progress: 80,
    instructor: 'Ing. Ana Martínez',
    resources: [
      'Guía de React Avanzado',
      'API Documentation',
      'Herramientas de Testing'
    ],
    activities: [
      { name: 'Setup del proyecto', date: '2024-09-15', completed: true },
      { name: 'Desarrollo del backend', date: '2024-10-15', completed: true },
      { name: 'Desarrollo del frontend', date: '2024-11-15', completed: false },
      { name: 'Testing y despliegue', date: '2024-11-30', completed: false }
    ],
    announcements: [
      {
        title: 'Workshop de deployment',
        content: 'Se realizará un taller sobre despliegue en la nube el próximo viernes.',
        date: '2024-10-22'
      }
    ]
  },
  'proyecto-c': {
    name: 'Machine Learning Aplicado',
    description: 'Implementación práctica de modelos de aprendizaje automático para análisis predictivo en datasets reales del sector empresarial.',
    status: 'pending',
    participants: 12,
    deadline: '2025-01-20',
    category: 'analisis',
    progress: 25,
    instructor: 'Dra. Laura Fernández',
    resources: [
      'Curso de Python para ML',
      'Datasets Empresariales',
      'Notebooks de Ejemplo'
    ],
    activities: [
      { name: 'Análisis exploratorio', date: '2024-11-01', completed: false },
      { name: 'Entrenamiento de modelos', date: '2024-12-01', completed: false },
      { name: 'Evaluación y optimización', date: '2024-12-20', completed: false },
      { name: 'Presentación final', date: '2025-01-20', completed: false }
    ],
    announcements: [
      {
        title: 'Inicio del proyecto',
        content: 'El proyecto iniciará oficialmente el 1 de noviembre. Revisa los recursos preparatorios.',
        date: '2024-10-25'
      }
    ]
  }
};

export const ProjectDetail = ({ projectId, onBack }: ProjectDetailProps) => {
  const project = projectDetails[projectId as keyof typeof projectDetails];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Proyecto no encontrado</h3>
            <p className="text-muted-foreground mb-4">El proyecto solicitado no existe o no tienes acceso.</p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onBack}
              className="hover:bg-primary hover:text-primary-foreground transition-smooth"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">Instructor: {project.instructor}</p>
            </div>
          </div>
          
          <Badge className={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-fade-in space-y-8">
          {/* Project Overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Descripción del Proyecto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Activities Timeline */}
              <Card className="border-0 gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Cronograma de Actividades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.completed ? 'bg-accent' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium ${
                          activity.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {activity.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      {activity.completed && (
                        <Badge variant="outline" className="text-xs">Completado</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card className="border-0 gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Anuncios Recientes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.announcements.map((announcement, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium text-foreground">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <Card className="border-0 gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Estadísticas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progreso</span>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-smooth"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Participantes</span>
                      </div>
                      <span className="text-sm font-medium">{project.participants}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Fecha límite</span>
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="border-0 gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Recursos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-smooth">
                      <span className="text-sm font-medium">{resource}</span>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Foro de Discusión
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Subir Entrega
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendario
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};