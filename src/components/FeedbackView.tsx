import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, MessageSquare, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProject } from '@/utils/mockData';
import { Delivery } from '@/types';
import { toast } from '@/hooks/use-toast';
import { feedbackService, FeedbackWithResponses } from '@/services/feedbackService';

interface FeedbackViewProps {
  projectId: string;
  deliveryId: string;
  onBack: () => void;
}

export const FeedbackView = ({ projectId, deliveryId, onBack }: FeedbackViewProps) => {
  const { user, hasRole } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackWithResponses[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [editingReply, setEditingReply] = useState<{ feedbackId: number; responseId: number } | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedbacks = useCallback(async () => {
    try {
      console.log('🔄 [FeedbackView] Loading feedbacks for delivery:', deliveryId);
      setIsLoading(true);
      const data = await feedbackService.getFeedbacksWithResponses(deliveryId);
      console.log('✅ [FeedbackView] Feedbacks loaded:', data);
      console.log('📊 [FeedbackView] Setting feedbacks state with', data.length, 'items');
      setFeedbacks(data);
      console.log('✨ [FeedbackView] State updated, triggering re-render');
    } catch (error) {
      console.error('❌ [FeedbackView] Error loading feedbacks:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la retroalimentación',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 [FeedbackView] Setting isLoading to false');
      setIsLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    console.log('🎬 [FeedbackView] useEffect triggered');
    const project = getProject(projectId);
    console.log('📦 [FeedbackView] Project:', project);
    if (project) {
      const del = project.deliveries.find(d => d.id === deliveryId);
      console.log('📄 [FeedbackView] Delivery found:', del);
      if (del) {
        setDelivery(del);
      }
    }
    loadFeedbacks();
  }, [projectId, deliveryId, loadFeedbacks]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !user || !delivery) return;

    setIsSending(true);

    try {
      // TODO: Usar un ID numérico real del usuario cuando esté disponible en el backend
      // Por ahora usamos un hash del username como ID temporal
      const tempUserId = Math.abs(user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      await feedbackService.createFeedback(
        deliveryId,
        newComment,
        tempUserId
      );

      setNewComment('');
      await loadFeedbacks();

      toast({
        title: 'Éxito',
        description: 'Retroalimentación enviada correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la retroalimentación',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReply = async (feedbackId: number) => {
    const text = replyText[feedbackId];
    if (!text?.trim() || !user) return;

    try {
      // TODO: Usar un ID numérico real del usuario cuando esté disponible en el backend
      const tempUserId = Math.abs(user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      await feedbackService.createResponse(
        feedbackId,
        text,
        tempUserId
      );

      setReplyText(prev => ({ ...prev, [feedbackId]: '' }));
      await loadFeedbacks();

      toast({
        title: 'Respuesta enviada',
        description: 'Tu respuesta ha sido publicada',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la respuesta',
        variant: 'destructive',
      });
    }
  };

  const handleEditReply = (feedbackId: number, responseId: number, currentContent: string) => {
    setReplyText(prev => ({ ...prev, [feedbackId]: currentContent }));
    setEditingReply({ feedbackId, responseId });
  };

  const handleUpdateReply = async (feedbackId: number, responseId: number) => {
    const text = replyText[feedbackId];
    if (!text?.trim()) return;

    try {
      await feedbackService.updateResponse(responseId, text);

      setReplyText(prev => ({ ...prev, [feedbackId]: '' }));
      setEditingReply(null);
      await loadFeedbacks();

      toast({
        title: 'Respuesta actualizada',
        description: 'Los cambios se han guardado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la respuesta',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReply = async (responseId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta respuesta?')) return;

    try {
      await feedbackService.deleteResponse(responseId);
      await loadFeedbacks();

      toast({
        title: 'Respuesta eliminada',
        description: 'La respuesta ha sido eliminada',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la respuesta',
        variant: 'destructive',
      });
    }
  };

  const handleEditFeedback = (feedbackId: number, currentContent: string) => {
    setNewComment(currentContent);
    setEditingFeedback(feedbackId);
  };

  const handleUpdateFeedback = async (feedbackId: number) => {
    if (!newComment.trim()) return;

    setIsSending(true);

    try {
      await feedbackService.updateFeedback(feedbackId, newComment);

      setNewComment('');
      setEditingFeedback(null);
      await loadFeedbacks();

      toast({
        title: 'Retroalimentación actualizada',
        description: 'Los cambios se han guardado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la retroalimentación',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta retroalimentación?')) return;

    try {
      await feedbackService.deleteFeedback(feedbackId);
      await loadFeedbacks();

      toast({
        title: 'Retroalimentación eliminada',
        description: 'La retroalimentación ha sido eliminada',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la retroalimentación',
        variant: 'destructive',
      });
    }
  };

  console.log('🔍 [FeedbackView] Render check:', { delivery: !!delivery, isLoading, feedbacksCount: feedbacks.length });

  // Mostrar loading solo si no hay delivery Y estamos cargando
  if (isLoading && !delivery) {
    console.log('⏳ [FeedbackView] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Cargando retroalimentación...</p>
        </div>
      </div>
    );
  }

  // Si no hay delivery después de cargar, mostrar error
  if (!delivery) {
    console.log('❌ [FeedbackView] No delivery found');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            No se encontró la entrega solicitada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isProfessor = hasRole('ROLE_TEACHER');
  const isStudent = hasRole('ROLE_STUDENT');
  const isAdmin = hasRole('ROLE_ADMIN');
  const canComment = isProfessor;
  const canReply = isStudent || isProfessor;
  const isReadOnly = isAdmin;

  console.log('🎨 [FeedbackView] Rendering with:', {
    feedbacksCount: feedbacks.length,
    isLoading,
    deliveryId,
    isProfessor,
    isStudent,
    isAdmin
  });

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
                {editingFeedback ? 'Editar Retroalimentación' : 'Enviar Retroalimentación'}
              </CardTitle>
              <CardDescription>
                {editingFeedback ? 'Modifica tu retroalimentación' : 'Escribe tus comentarios para el estudiante'}
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
              <div className="flex items-center justify-end gap-2">
                {editingFeedback && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setNewComment('');
                      setEditingFeedback(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (editingFeedback) {
                      handleUpdateFeedback(editingFeedback);
                    } else {
                      handleSendComment();
                    }
                  }}
                  disabled={!newComment.trim() || isSending}
                  aria-label={editingFeedback ? "Actualizar retroalimentación" : "Enviar retroalimentación"}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingFeedback ? 'Actualizando...' : 'Enviando...'}
                    </>
                  ) : (
                    <>
                      {editingFeedback ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Actualizar
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar
                        </>
                      )}
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
            Retroalimentación ({feedbacks.length})
          </h2>

          {feedbacks.length === 0 ? (
            <Alert>
              <AlertDescription>
                No hay retroalimentación disponible para esta entrega.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {console.log('🎯 [FeedbackView] Rendering feedbacks:', feedbacks)}
              {feedbacks.map((item) => {
                console.log('📝 [FeedbackView] Rendering feedback item:', item);
                return (
              <Card key={item.feedback.id} className="border-0 gradient-card">
                <CardContent className="pt-6">
                  {/* Feedback */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          Profesor {item.feedback.authorId}
                        </span>
                        {item.feedback.edited && <Badge variant="secondary">Editado</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.feedback.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="text-foreground">{item.feedback.content}</p>

                    {/* Edit/Delete buttons for own feedback */}
                    {isProfessor && user && !isReadOnly && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeedback(item.feedback.id, item.feedback.content)}
                          aria-label="Editar retroalimentación"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeedback(item.feedback.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Eliminar retroalimentación"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Responses */}
                  {item.responses.length > 0 && (
                    <div className="ml-6 space-y-3 border-l-2 border-border pl-4">
                      <p className="text-sm font-medium text-muted-foreground">Respuestas:</p>
                      {item.responses.map((response) => (
                        <div key={response.id} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">
                              Usuario {response.authorId}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(response.createdAt).toLocaleString('es-ES')}
                              {response.edited && ' (editado)'}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{response.content}</p>

                          {/* Edit/Delete buttons for own responses */}
                          {user && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditReply(item.feedback.id, response.id, response.content)}
                                aria-label="Editar respuesta"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReply(response.id)}
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

                  {/* No responses message for professors */}
                  {isProfessor && item.responses.length === 0 && (
                    <p className="ml-6 text-sm text-muted-foreground italic">
                      Sin respuestas del estudiante
                    </p>
                  )}

                  {/* Reply Form - Only for students and professors */}
                  {canReply && !isReadOnly && (
                    <div className="mt-4 ml-6">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyText[item.feedback.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [item.feedback.id]: e.target.value }))}
                        className="mb-2"
                        aria-label="Respuesta al comentario"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (editingReply?.feedbackId === item.feedback.id) {
                            handleUpdateReply(item.feedback.id, editingReply.responseId);
                          } else {
                            handleSendReply(item.feedback.id);
                          }
                        }}
                        disabled={!replyText[item.feedback.id]?.trim()}
                        aria-label={editingReply?.feedbackId === item.feedback.id ? 'Actualizar respuesta' : 'Enviar respuesta'}
                      >
                        {editingReply?.feedbackId === item.feedback.id ? (
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
                      {editingReply?.feedbackId === item.feedback.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingReply(null);
                            setReplyText(prev => ({ ...prev, [item.feedback.id]: '' }));
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
              );
            })}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
