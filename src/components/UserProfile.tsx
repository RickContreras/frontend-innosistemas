import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock,
  RefreshCw,
  LogOut,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';

interface UserProfileProps {
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfile = ({ onClose, onLogout }: UserProfileProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sessionInfo, setSessionInfo] = useState<{
    loginTime: string;
    expiryTime: string;
    timeRemaining: string;
  } | null>(null);

  useEffect(() => {
    loadSessionInfo();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSessionInfo = () => {
    const tokenExpiry = localStorage.getItem('token_expiry');
    const loginTime = localStorage.getItem('login_time') || new Date().toISOString();
    
    if (tokenExpiry) {
      const expiry = new Date(parseInt(tokenExpiry));
      setSessionInfo({
        loginTime: new Date(loginTime).toLocaleString('es-ES'),
        expiryTime: expiry.toLocaleString('es-ES'),
        timeRemaining: calculateTimeRemaining(expiry)
      });
    }
  };

  const calculateTimeRemaining = (expiryTime: Date): string => {
    const now = new Date().getTime();
    const expiry = expiryTime.getTime();
    const remaining = expiry - now;

    if (remaining <= 0) return 'Expirada';

    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const updateTimeRemaining = () => {
    if (sessionInfo) {
      const tokenExpiry = localStorage.getItem('token_expiry');
      if (tokenExpiry) {
        const expiry = new Date(parseInt(tokenExpiry));
        setSessionInfo(prev => prev ? {
          ...prev,
          timeRemaining: calculateTimeRemaining(expiry)
        } : null);
      }
    }
  };

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    setError('');

    try {
      const response = await apiService.getCurrentUser();
      
      if (response.error) {
        setError('Error al actualizar el perfil: ' + response.error);
      }
    } catch (error) {
      setError('Error de conexión al actualizar el perfil');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Error durante el logout:', error);
      onLogout(); // Cerrar sesión de todas formas
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ROLE_STUDENT': return 'default';
      case 'ROLE_TEACHER': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ROLE_STUDENT': return 'Estudiante';
      case 'ROLE_TEACHER': return 'Docente';
      default: return role.replace('ROLE_', '');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay información de usuario disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
            <p className="text-sm text-muted-foreground">Perfil de Usuario</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshProfile}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Información básica */}
      <Card className="border-0 gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Información Personal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Usuario</p>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="w-4 h-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Roles Asignados</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role, index) => (
                    <Badge 
                      key={index} 
                      variant={getRoleBadgeVariant(role)}
                      className="text-xs"
                    >
                      {getRoleDisplayName(role)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de sesión */}
      {sessionInfo && (
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Información de Sesión</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Inicio de sesión</span>
                </div>
                <span className="text-sm font-medium">{sessionInfo.loginTime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Expira</span>
                </div>
                <span className="text-sm font-medium">{sessionInfo.expiryTime}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiempo restante</span>
                <Badge 
                  variant={sessionInfo.timeRemaining === 'Expirada' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {sessionInfo.timeRemaining}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex-1"
        >
          Cerrar
        </Button>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex-1"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};