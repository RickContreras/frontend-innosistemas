import { ArrowLeft, BookOpen, Calendar, Users, MessageSquare, FileText, Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { getProject } from '@/utils/mockData';
import { Project, Delivery, ProjectFromAPI } from '@/types';
import { FeedbackView } from '@/components/FeedbackView';
import { ReportView } from '@/components/ReportView';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

type DetailView = 'overview' | 'feedback' | 'report' | 'accessibility';

export const ProjectDetail = ({ projectId, onBack }: ProjectDetailProps) => {
  const [currentView, setCurrentView] = useState<DetailView>('overview');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasRole } = useAuth();

  // Determinar roles usando hasRole
  const isAdmin = hasRole('ROLE_ADMIN') || (hasRole('ROLE_STUDENT') && hasRole('ROLE_TEACHER'));
  const isProfessor = hasRole('ROLE_TEACHER') && !hasRole('ROLE_STUDENT');
  const isStudent = hasRole('ROLE_STUDENT') && !hasRole('ROLE_TEACHER');

  // Función para transformar ProjectFromAPI a Project
  const transformProject = (apiProject: ProjectFromAPI): Project => {
    const statusMap: { [key: number]: 'active' | 'completed' | 'pending' } = {
      1: 'active',
      2: 'completed',
      3: 'pending'
    };

    const category: 'investigacion' | 'desarrollo' | 'analisis' = 
      apiProject.name.toLowerCase().includes('investiga') ? 'investigacion' :
      apiProject.name.toLowerCase().includes('desarroll') ? 'desarrollo' :
      'analisis';

    return {
      id: apiProject.id.toString(),
      name: apiProject.name,
      description: apiProject.description,
      status: statusMap[apiProject.statusId] || 'active',
      participants: 0,
      deadline: new Date(apiProject.createdAt).toISOString().split('T')[0],
      category,
      teamId: apiProject.courseId.toString(),
      deliveries: []
    };
  };

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // Intentar cargar desde el microservicio
        const projectIdNum = parseInt(projectId);
        
        if (!isNaN(projectIdNum)) {
          const response = await apiService.getProjectById(projectIdNum);
          
          if (response.data) {
            const transformedProject = transformProject(response.data);
            setProject(transformedProject);
          } else {
            // Fallback a datos mock
            setError('No se pudo cargar el proyecto desde el servidor');
            const proj = getProject(projectId);
            if (proj) {
              setProject(proj);
            }
          }
        } else {
          // Si el ID no es numérico, usar datos mock directamente
          const proj = getProject(projectId);
          if (proj) {
            setProject(proj);
          }
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Error al cargar el proyecto');
        // Fallback a datos mock
        const proj = getProject(projectId);
        if (proj) {
          setProject(proj);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (currentView === 'feedback' && selectedDeliveryId) {
    return (
      <FeedbackView
        projectId={projectId}
        deliveryId={selectedDeliveryId}
        onBack={() => {
          setCurrentView('overview');
          setSelectedDeliveryId('');
        }}
      />
    );
  }

  if (currentView === 'report') {
    return (
      <ReportView
        projectId={projectId}
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'accessibility') {
    return (
      <AccessibilityPanel
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <p className="text-destructive font-medium mb-4">No se encontró el proyecto</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  // Mapear datos del proyecto
  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // Información adicional del proyecto (mock hasta que esté en el API)
  const mockProjectDetails: Record<string, any> = {
    'proyecto-a': {
      instructor: 'Dr. Carlos Rodríguez'
    },
    'proyecto-b': {
      instructor: 'Ing. Ana Martínez'
    },
    'proyecto-c': {
      instructor: 'Dra. Laura Fernández'
    },
    '201': {
      instructor: 'Prof. Sistema InnoSistemas'
    },
    '202': {
      instructor: 'Prof. Desarrollo Móvil'
    }
  };

  const details = mockProjectDetails[projectId] || { instructor: 'Por asignar' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">{project.name}</h1>
              <p className="text-muted-foreground">Instructor: {details.instructor}</p>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Equipo {project.teamId}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(project.deadline).toLocaleDateString('es-ES')}
            </Badge>
            {project.participants > 0 && (
              <Badge variant="outline">
                {project.participants} participantes
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert className="border-warning/50 bg-warning/5">
            <AlertDescription className="text-warning-foreground font-medium">
              {error}. Mostrando información de ejemplo.
            </AlertDescription>
          </Alert>
        )}

        {/* Role Badge */}
        {isAdmin && (
          <Alert className="border-warning/50 bg-warning/5">
            <AlertDescription className="text-warning font-medium">
              Vista de administrador - Solo lectura, no puedes modificar entregas ni retroalimentación
            </AlertDescription>
          </Alert>
        )}

        {/* Description */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Descripción del Proyecto
            </CardTitle>
            <CardDescription>
              Información detallada sobre el proyecto y sus objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h4>
              <p className="text-foreground leading-relaxed">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Categoría</p>
                <Badge variant="outline" className="capitalize">
                  {project.category}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ID del Curso</p>
                <p className="text-foreground font-medium">{project.teamId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Funcionalidades disponibles para tu rol' 
                : 'Accede a las funcionalidades del proyecto'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {!isAdmin && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCurrentView('report')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isProfessor ? 'Generar Reporte de Equipo' : 'Ver mi Reporte'}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setCurrentView('accessibility')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Accesibilidad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries */}
        {project.deliveries && project.deliveries.length > 0 && (
          <Card className="border-0 gradient-card">
            <CardHeader>
              <CardTitle>Entregas del Proyecto</CardTitle>
              <CardDescription>
                {project.deliveries.length} entrega(s) programada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.deliveries.map((delivery: Delivery) => (
                  <div
                    key={delivery.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{delivery.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {delivery.description}
                        </p>
                      </div>
                      {delivery.grade && (
                        <Badge className="ml-2">
                          {delivery.grade}/100
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(delivery.dueDate).toLocaleDateString('es-ES')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {delivery.comments.length} comentarios
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDeliveryId(delivery.id);
                        setCurrentView('feedback');
                      }}
                      disabled={isAdmin}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {isAdmin ? 'Ver (Solo lectura)' : 'Ver Retroalimentación'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Equipo</p>
              <p className="text-2xl font-bold text-foreground">{project.teamId}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Entregas</p>
              <p className="text-2xl font-bold text-foreground">{project.deliveries.length}</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Comentarios</p>
              <p className="text-2xl font-bold text-foreground">
                {project.deliveries.reduce((sum, d) => sum + d.comments.length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
