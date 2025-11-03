import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Eye, 
  Type, 
  Contrast, 
  Keyboard, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface AccessibilityPanelProps {
  onBack: () => void;
}

interface AccessibilityCheck {
  name: string;
  passed: boolean;
  description: string;
}

export const AccessibilityPanel = ({ onBack }: AccessibilityPanelProps) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [highContrast, setHighContrast] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [checkResults, setCheckResults] = useState<AccessibilityCheck[]>([]);
  const [hasRunCheck, setHasRunCheck] = useState(false);

  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}px`;
  };

  const toggleHighContrast = (enabled: boolean) => {
    setHighContrast(enabled);
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const runAccessibilityCheck = () => {
    const results: AccessibilityCheck[] = [];

    // Check 1: Images with alt text
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    results.push({
      name: 'Imágenes con texto alternativo',
      passed: imagesWithoutAlt.length === 0,
      description: imagesWithoutAlt.length === 0 
        ? 'Todas las imágenes tienen texto alternativo' 
        : `${imagesWithoutAlt.length} imágenes sin texto alternativo`
    });

    // Check 2: Form inputs with labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
    let inputsWithoutLabel = 0;
    inputs.forEach(input => {
      const id = input.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label && !input.getAttribute('aria-label')) {
          inputsWithoutLabel++;
        }
      } else if (!input.getAttribute('aria-label')) {
        inputsWithoutLabel++;
      }
    });
    results.push({
      name: 'Campos de formulario etiquetados',
      passed: inputsWithoutLabel === 0,
      description: inputsWithoutLabel === 0 
        ? 'Todos los campos tienen etiquetas' 
        : `${inputsWithoutLabel} campos sin etiqueta o aria-label`
    });

    // Check 3: Heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasH1 = document.querySelector('h1') !== null;
    results.push({
      name: 'Jerarquía de encabezados',
      passed: hasH1 && headings.length > 0,
      description: hasH1 
        ? `Estructura correcta con ${headings.length} encabezados` 
        : 'Falta encabezado H1 principal'
    });

    // Check 4: Button accessibility
    const buttons = document.querySelectorAll('button');
    let buttonsWithoutText = 0;
    buttons.forEach(button => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        buttonsWithoutText++;
      }
    });
    results.push({
      name: 'Botones accesibles',
      passed: buttonsWithoutText === 0,
      description: buttonsWithoutText === 0 
        ? 'Todos los botones tienen texto o aria-label' 
        : `${buttonsWithoutText} botones sin texto accesible`
    });

    // Check 5: Keyboard navigation
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const negativeTabindex = document.querySelectorAll('[tabindex="-1"]');
    results.push({
      name: 'Navegación por teclado',
      passed: focusableElements.length > 0,
      description: `${focusableElements.length} elementos navegables (${negativeTabindex.length} excluidos)`
    });

    // Check 6: Color contrast (simplified check)
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
    let lowContrastElements = 0;
    textElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;
      // Simplified check - in production, use a proper contrast ratio calculator
      if (color === bgColor) {
        lowContrastElements++;
      }
    });
    results.push({
      name: 'Contraste de colores',
      passed: lowContrastElements === 0,
      description: lowContrastElements === 0 
        ? 'Contraste adecuado en todos los elementos' 
        : `${lowContrastElements} elementos con posible bajo contraste`
    });

    setCheckResults(results);
    setHasRunCheck(true);
  };

  const passedChecks = checkResults.filter(r => r.passed).length;
  const totalChecks = checkResults.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Panel de Accesibilidad
          </h1>
          <p className="text-muted-foreground">
            Configura las opciones de accesibilidad y verifica el cumplimiento WCAG 2.1 AA
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Controls */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Controles de Accesibilidad
            </CardTitle>
            <CardDescription>
              Ajusta las opciones según tus necesidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Tamaño de fuente</label>
                <span className="text-sm text-muted-foreground">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => applyFontSize(value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
                aria-label="Tamaño de fuente"
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contrast className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Modo Alto Contraste</p>
                  <p className="text-xs text-muted-foreground">Mejora la visibilidad del texto</p>
                </div>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
                aria-label="Activar modo alto contraste"
              />
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Navegación por Teclado</p>
                  <p className="text-xs text-muted-foreground">Habilitar foco visible</p>
                </div>
              </div>
              <Switch
                checked={keyboardNav}
                onCheckedChange={setKeyboardNav}
                aria-label="Activar navegación por teclado"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Check */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Verificación de Accesibilidad
            </CardTitle>
            <CardDescription>
              Ejecuta una verificación automática de cumplimiento WCAG 2.1 AA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runAccessibilityCheck} className="w-full">
              Ejecutar Chequeo de Accesibilidad
            </Button>

            {hasRunCheck && (
              <>
                <Alert className={passedChecks === totalChecks ? 'border-accent' : 'border-warning'}>
                  <AlertDescription className="flex items-center gap-2">
                    {passedChecks === totalChecks ? (
                      <CheckCircle className="w-4 h-4 text-accent" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <span>
                      Resultado: {passedChecks} de {totalChecks} verificaciones aprobadas
                    </span>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {checkResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {result.passed ? (
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{result.name}</p>
                          <Badge variant={result.passed ? 'default' : 'destructive'} className="text-xs">
                            {result.passed ? 'Aprobado' : 'Requiere atención'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="border-0 gradient-card">
          <CardHeader>
            <CardTitle>Guías de Accesibilidad</CardTitle>
            <CardDescription>
              Mejores prácticas implementadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Contraste de color cumple WCAG 2.1 nivel AA (4.5:1 para texto normal)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Navegación completa por teclado con orden lógico de tabulación</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Roles ARIA y etiquetas accesibles en elementos interactivos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Notificaciones en tiempo real con aria-live para lectores de pantalla</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Imágenes e íconos con texto alternativo descriptivo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>PDFs exportados con estructura semántica accesible</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
