import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, MessageSquare, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { getProject, updateProject } from '@/utils/mockData';
import { Comment, Reply, Delivery } from '@/types';
import { toast } from '@/hooks/use-toast';

interface FeedbackViewProps {
  projectId: string;
  deliveryId: string;
  onBack: () => void;
}

export const FeedbackView = ({ projectId, deliveryId, onBack }: FeedbackViewProps) => {
  const { user } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [editingReply, setEditingReply] = useState<{ commentId: string; replyId: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  const loadDelivery = useCallback(() => {
    const project = getProject(projectId);
    if (project) {
      const del = project.deliveries.find(d => d.id === deliveryId);
      if (del) {
        setDelivery(del);
      }
    }
  }, [projectId, deliveryId]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  const handleRealtimeMessage = useCallback((message: any) => {
    if (message.type === 'comment' || message.type === 'reply') {
      loadDelivery();
      toast({
        title: 'Nuevo mensaje',
        description: message.type === 'comment' ? 'Nueva retroalimentación recibida' : 'Nueva respuesta recibida',
      });
    }
  }, [loadDelivery]);

  const { broadcast } = useRealtime(`feedback-${deliveryId}`, handleRealtimeMessage);

  const handleSendComment = async () => {
    if (!newComment.trim() || !user || !delivery) return;

    if (simulateError) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la retroalimentación, inténtalo de nuevo',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      body: newComment,
      timestamp: new Date().toISOString(),
      replies: [],
      isNew: true
    };

    const project = getProject(projectId);
    if (project) {
      const deliveryIndex = project.deliveries.findIndex(d => d.id === deliveryId);
      if (deliveryIndex !== -1) {
        project.deliveries[deliveryIndex].comments.push(comment);
        updateProject(project);
        
        broadcast({
          type: 'comment',
          data: comment,
          timestamp: new Date().toISOString()
        });

        setNewComment('');
        loadDelivery();
        
        toast({
          title: 'Éxito',
          description: 'Retroalimentación enviada correctamente',
        });
      }
    }

    setIsSending(false);
  };

  const handleSendReply = async (commentId: string) => {
    const text = replyText[commentId];
    if (!text?.trim() || !user || !delivery) return;

    const reply: Reply = {
      id: `r-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      body: text,
      timestamp: new Date().toISOString()
    };

    const project = getProject(projectId);
    if (project) {
      const deliveryIndex = project.deliveries.findIndex(d => d.id === deliveryId);
      if (deliveryIndex !== -1) {
        const commentIndex = project.deliveries[deliveryIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          project.deliveries[deliveryIndex].comments[commentIndex].replies.push(reply);
          updateProject(project);
          
          broadcast({
            type: 'reply',
            data: { commentId, reply },
            timestamp: new Date().toISOString()
          });

          setReplyText(prev => ({ ...prev, [commentId]: '' }));
          loadDelivery();
          
          toast({
            title: 'Respuesta enviada',
            description: 'Tu respuesta ha sido publicada',
          });
        }
      }
    }
  };

  const handleEditReply = (commentId: string, replyId: string) => {
    const comment = delivery?.comments.find(c => c.id === commentId);
    const reply = comment?.replies.find(r => r.id === replyId);
    if (reply) {
      setReplyText(prev => ({ ...prev, [commentId]: reply.body }));
      setEditingReply({ commentId, replyId });
    }
  };

  const handleUpdateReply = async (commentId: string, replyId: string) => {
    const text = replyText[commentId];
    if (!text?.trim() || !user || !delivery) return;

    const project = getProject(projectId);
    if (project) {
      const deliveryIndex = project.deliveries.findIndex(d => d.id === deliveryId);
      if (deliveryIndex !== -1) {
        const commentIndex = project.deliveries[deliveryIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          const replyIndex = project.deliveries[deliveryIndex].comments[commentIndex].replies.findIndex(r => r.id === replyId);
          if (replyIndex !== -1) {
            project.deliveries[deliveryIndex].comments[commentIndex].replies[replyIndex] = {
              ...project.deliveries[deliveryIndex].comments[commentIndex].replies[replyIndex],
              body: text,
              editedAt: new Date().toISOString()
            };
            updateProject(project);
            
            broadcast({
              type: 'reply',
              data: { commentId, replyId, updated: true },
              timestamp: new Date().toISOString()
            });

            setReplyText(prev => ({ ...prev, [commentId]: '' }));
            setEditingReply(null);
            loadDelivery();
            
            toast({
              title: 'Respuesta actualizada',
              description: 'Los cambios se han guardado',
            });
          }
        }
      }
    }
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta respuesta?')) return;

    const project = getProject(projectId);
    if (project) {
      const deliveryIndex = project.deliveries.findIndex(d => d.id === deliveryId);
      if (deliveryIndex !== -1) {
        const commentIndex = project.deliveries[deliveryIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          project.deliveries[deliveryIndex].comments[commentIndex].replies = 
            project.deliveries[deliveryIndex].comments[commentIndex].replies.filter(r => r.id !== replyId);
          updateProject(project);
          
          broadcast({
            type: 'reply',
            data: { commentId, replyId, deleted: true },
            timestamp: new Date().toISOString()
          });

          loadDelivery();
          
          toast({
            title: 'Respuesta eliminada',
            description: 'La respuesta ha sido eliminada',
          });
        }
      }
    }
  };

  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <p className="text-muted-foreground">Cargando entrega...</p>
      </div>
    );
  }

  const isProfessor = user?.role === 'profesor';
  const isStudent = user?.role === 'estudiante';
  const isAdmin = user?.role === 'admin';
  const canComment = isProfessor;
  const canReply = isStudent || isProfessor;
  const isReadOnly = isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{delivery.title}</h1>
          <p className="text-muted-foreground">{delivery.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              Entrega: {new Date(delivery.dueDate).toLocaleDateString('es-ES')}
            </Badge>
            {delivery.grade && (
              <Badge className="bg-accent text-accent-foreground">
                Calificación: {delivery.grade}/100
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Role Badge */}
        {isReadOnly && (
          <Alert className="mb-6 border-warning/50 bg-warning/5">
            <AlertDescription className="text-warning font-medium">
              Vista de solo lectura - Los administradores no pueden modificar retroalimentación
            </AlertDescription>
          </Alert>
        )}

        {/* New Comment Form (Professor only) */}
        {canComment && (
          <Card className="mb-6 border-0 gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Enviar Retroalimentación
              </CardTitle>
              <CardDescription>
                Escribe tus comentarios para el estudiante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Escribe tu retroalimentación aquí..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px]"
                aria-label="Retroalimentación"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={simulateError}
                    onChange={(e) => setSimulateError(e.target.checked)}
                    className="rounded"
                  />
                  Simular error de red
                </label>
                <Button
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || isSending}
                  aria-label="Enviar retroalimentación"
                >
                  {isSending ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Retroalimentación ({delivery.comments.length})
          </h2>

          {delivery.comments.length === 0 ? (
            <Alert>
              <AlertDescription>
                No hay retroalimentación disponible para esta entrega.
              </AlertDescription>
            </Alert>
          ) : (
            delivery.comments.map((comment) => (
              <Card key={comment.id} className="border-0 gradient-card">
                <CardContent className="pt-6">
                  {/* Comment */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{comment.authorName}</span>
                        {comment.isNew && <Badge variant="default">Nuevo</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.body}</p>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-6 space-y-3 border-l-2 border-border pl-4">
                      <p className="text-sm font-medium text-muted-foreground">Respuestas:</p>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{reply.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.timestamp).toLocaleString('es-ES')}
                              {reply.editedAt && ' (editado)'}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{reply.body}</p>
                          
                          {/* Edit/Delete buttons for own replies */}
                          {user?.id === reply.authorId && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditReply(comment.id, reply.id)}
                                aria-label="Editar respuesta"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                className="text-destructive hover:text-destructive"
                                aria-label="Eliminar respuesta"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No replies message for professors */}
                  {isProfessor && comment.replies.length === 0 && (
                    <p className="ml-6 text-sm text-muted-foreground italic">
                      Sin respuestas del estudiante
                    </p>
                  )}

                  {/* Reply Form - Only for students and professors */}
                  {canReply && !isReadOnly && (
                    <div className="mt-4 ml-6">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyText[comment.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        className="mb-2"
                        aria-label="Respuesta al comentario"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (editingReply?.commentId === comment.id) {
                            handleUpdateReply(comment.id, editingReply.replyId);
                          } else {
                            handleSendReply(comment.id);
                          }
                        }}
                        disabled={!replyText[comment.id]?.trim()}
                        aria-label={editingReply?.commentId === comment.id ? 'Actualizar respuesta' : 'Enviar respuesta'}
                      >
                        {editingReply?.commentId === comment.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Actualizar
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Responder
                          </>
                        )}
                      </Button>
                      {editingReply?.commentId === comment.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingReply(null);
                            setReplyText(prev => ({ ...prev, [comment.id]: '' }));
                          }}
                          className="ml-2"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
