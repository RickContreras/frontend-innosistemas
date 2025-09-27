import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  User,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiService, type User as ApiUser, type Role } from '@/services/api';

interface UserManagementProps {
  onClose: () => void;
}

interface FormUser {
  username: string;
  email: string;
  password: string;
}

export const UserManagement = ({ onClose }: UserManagementProps) => {
  const { user: currentUser, hasAnyRole } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [formUser, setFormUser] = useState<FormUser>({
    username: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar permisos
  const hasAdminAccess = hasAnyRole(['ROLE_STUDENT', 'ROLE_TEACHER']);

  useEffect(() => {
    if (hasAdminAccess) {
      loadData();
    }
  }, [hasAdminAccess]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiService.getUsersWithRoles(),
        apiService.getRoles()
      ]);

      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (rolesResponse.data) {
        setRoles(rolesResponse.data);
      }

      if (usersResponse.error || rolesResponse.error) {
        setError('Error al cargar algunos datos');
      }
    } catch (error) {
      setError('Error de conexión al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormUser({ username: '', email: '', password: '' });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: ApiUser) => {
    setEditingUser(user);
    setFormUser({
      username: user.username,
      email: user.email,
      password: '' // No mostrar contraseña existente
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const response = await apiService.updateUser(editingUser.id, {
          username: formUser.username,
          email: formUser.email,
          ...(formUser.password && { password: formUser.password })
        });

        if (response.error) {
          setError(response.error);
          return;
        }
      } else {
        // Crear nuevo usuario
        const response = await apiService.createUser({
          username: formUser.username,
          email: formUser.email,
          password: formUser.password
        });

        if (response.error) {
          setError(response.error);
          return;
        }
      }

      setIsDialogOpen(false);
      await loadData(); // Recargar lista
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const response = await apiService.deleteUser(userId);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      await loadData(); // Recargar lista
    } catch (error) {
      setError('Error al eliminar el usuario');
    }
  };

  const handleRoleChange = async (userId: number, action: 'add' | 'remove', roleName: string) => {
    try {
      const response = action === 'add' 
        ? await apiService.assignUserRole(userId, roleName)
        : await apiService.removeUserRole(userId, roleName);

      if (response.error) {
        setError(response.error);
        return;
      }

      await loadData(); // Recargar para mostrar cambios
    } catch (error) {
      setError('Error al modificar roles');
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_STUDENT': return 'default';
      case 'ROLE_TEACHER': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_STUDENT': return 'Estudiante';
      case 'ROLE_TEACHER': return 'Docente';
      default: return roleName.replace('ROLE_', '');
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No tienes permisos para acceder a esta funcionalidad</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Gestión de Usuarios</h2>
            <p className="text-sm text-muted-foreground">Administra los usuarios del sistema</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm" onClick={handleCreateUser}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de usuarios */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="border-0 gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{user.username}</h3>
                      {user.username === currentUser?.username && (
                        <Badge variant="outline" className="text-xs">Tú</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Roles */}
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role) => (
                        <Badge
                          key={role.id}
                          variant={getRoleBadgeVariant(role.name)}
                          className="text-xs"
                        >
                          {getRoleDisplayName(role.name)}
                        </Badge>
                      )) || <span className="text-xs text-muted-foreground">Sin roles</span>}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {user.username !== currentUser?.username && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Gestión de roles */}
              {user.username !== currentUser?.username && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Gestionar Roles:</span>
                    <div className="flex space-x-2">
                      {roles.map((role) => {
                        const hasRole = user.roles?.some(ur => ur.name === role.name);
                        return (
                          <Button
                            key={role.id}
                            variant={hasRole ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRoleChange(
                              user.id,
                              hasRole ? 'remove' : 'add',
                              role.name
                            )}
                            className="text-xs"
                          >
                            {hasRole ? '- ' : '+ '}
                            {getRoleDisplayName(role.name)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Modifica la información del usuario' 
                : 'Completa los datos para crear un nuevo usuario'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-username">Usuario</Label>
              <Input
                id="form-username"
                value={formUser.username}
                onChange={(e) => setFormUser(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nombre de usuario"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-email">Email</Label>
              <Input
                id="form-email"
                type="email"
                value={formUser.email}
                onChange={(e) => setFormUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@innosistemas.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-password">
                {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              </Label>
              <Input
                id="form-password"
                type="password"
                value={formUser.password}
                onChange={(e) => setFormUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña"
                required={!editingUser}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Acciones del panel */}
      <div className="flex justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Total: {users.length} usuarios
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};