import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  ShieldCheck, 
  Database,
  Activity,
  FileText,
  Settings,
  Trash2
} from 'lucide-react';
import { clearDemoData } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

interface AdminPanelProps {
  onBack: () => void;
}

interface UserData {
  id: string;
  username: string;
  name: string;
  role: 'estudiante' | 'profesor' | 'admin';
  authorizedProjects: string[];
}

const mockUsers: UserData[] = [
  {
    id: '1',
    username: 'estudiante',
    name: 'Ana García',
    role: 'estudiante',
    authorizedProjects: ['proyecto-a']
  },
  {
    id: '2',
    username: 'profesor',
    name: 'Dr. Carlos Rodríguez',
    role: 'profesor',
    authorizedProjects: ['proyecto-a', 'proyecto-b']
  },
  {
    id: '3',
    username: 'admin',
    name: 'María López',
    role: 'admin',
    authorizedProjects: ['proyecto-a', 'proyecto-b', 'proyecto-c']
  }
];

export const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [users] = useState<UserData[]>(mockUsers);

  const handleClearData = () => {
    if (confirm('¿Estás seguro de reiniciar todos los datos de demostración? Esta acción no se puede deshacer.')) {
      clearDemoData();
      toast({
        title: 'Datos reiniciados',
        description: 'Todos los datos han sido restaurados al estado inicial',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const getAuditLog = () => {
    const log = localStorage.getItem('audit_log');
    return log ? JSON.parse(log) : [];
  };

  const auditLog = getAuditLog();
  const recentAccess = auditLog.slice(-10).reverse();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'profesor': return 'secondary';
      case 'estudiante': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'profesor': return 'Profesor';
      case 'estudiante': return 'Estudiante';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestión de usuarios, permisos y configuración del sistema
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Alert className="border-primary/50 bg-primary/5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary font-medium">
            Panel exclusivo para administradores - Solo lectura en proyectos
          </AlertDescription>
        </Alert>

        {/* System Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Usuarios</p>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <Database className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Proyectos</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </CardContent>
          </Card>

          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Accesos</p>
              <p className="text-2xl font-bold text-foreground">{auditLog.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 gradient-card">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Reportes</p>
              <p className="text-2xl font-bold text-foreground">
                {JSON.parse(localStorage.getItem('academic_reports') || '[]').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>
              Vista general de usuarios y sus permisos (demo)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{user.username} • {user.authorizedProjects.length} proyecto(s) autorizado(s)
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.authorizedProjects.map((projectId) => (
                        <Badge key={projectId} variant="outline" className="text-xs">
                          {projectId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Access Log */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Registro de Accesos Recientes
            </CardTitle>
            <CardDescription>
              Últimos 10 intentos de acceso a proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAccess.length > 0 ? (
              <div className="space-y-2">
                {recentAccess.map((entry: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={entry.success ? 'default' : 'destructive'} className="text-xs">
                        {entry.success ? 'Exitoso' : 'Denegado'}
                      </Badge>
                      <span className="text-foreground">{entry.username}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">{entry.projectId}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay registros de acceso disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card className="border-0 gradient-card border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Acciones del Sistema
            </CardTitle>
            <CardDescription>
              Operaciones administrativas (precaución requerida)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-destructive/50 bg-destructive/5">
              <AlertDescription className="text-destructive text-sm">
                Estas acciones reiniciarán el sistema al estado inicial y no se pueden deshacer
              </AlertDescription>
            </Alert>
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reiniciar Datos de Demostración
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
