'use client';

/**
 * ============================================================================
 * CREATE DEVIS PAGE
 * ============================================================================
 * 
 * Main quote creation interface
 * Replaces the static HTML form with React components
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ALARM_PRODUCTS, CAMERA_PRODUCTS, applyVAT } from '@/lib/products/catalog';

interface QuoteProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function CreateDevisPage() {
  // Form state
  const [quoteType, setQuoteType] = useState<'alarme' | 'video'>('alarme');
  const [clientName, setClientName] = useState('');
  const [commercial, setCommercial] = useState('');
  const [centralType, setCentralType] = useState<'titane' | 'jablotron'>('titane');
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  const [includeAccessories, setIncludeAccessories] = useState(false);
  const [addOverlay, setAddOverlay] = useState(true);
  
  // UI state
  const [commercials, setCommercials] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  // Load commercials from API
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCommercials(data.data.commercials);
        }
      })
      .catch(err => console.error('Failed to load config:', err));
  }, []);

  // Add product to quote
  const addProduct = (productId: string) => {
    const catalog = quoteType === 'alarme' ? ALARM_PRODUCTS : CAMERA_PRODUCTS;
    const product = catalog.find(p => p.id === productId);
    
    if (!product) return;
    
    const existing = products.find(p => p.id === productId);
    
    if (existing) {
      setProducts(products.map(p => 
        p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setProducts([...products, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
      }]);
    }
  };

  // Remove product from quote
  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  // Update product quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    
    setProducts(products.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    const productsTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const installation = 690; // Base installation
    const totalHT = productsTotal + installation;
    const totalTTC = applyVAT(totalHT);
    
    return { totalHT, totalTTC, productsTotal, installation };
  };

  // Generate PDF and complete workflow
  const generateQuote = async () => {
    // Validation
    if (!clientName.trim()) {
      setError('Nom du client requis');
      return;
    }
    
    if (!commercial) {
      setError('Sélectionnez un commercial');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setProgress('Génération du PDF...');
    
    try {
      // Step 1: Generate PDF
      const pdfResponse = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          commercial,
          quoteType,
          centralType: quoteType === 'alarme' ? centralType : undefined,
          products: products.map(p => p.name),
          includeAccessories,
          addCommercialOverlay: addOverlay,
        }),
      });
      
      const pdfData = await pdfResponse.json();
      
      if (!pdfData.success) {
        throw new Error(pdfData.error || 'PDF generation failed');
      }
      
      console.log('✅ PDF generated:', pdfData.fileName);
      
      // Step 2: Upload to Drive
      setProgress('Upload vers Google Drive...');
      
      const driveResponse = await fetch('/api/drive-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: pdfData.pdfBase64,
          fileName: pdfData.fileName,
          commercial,
          clientName,
        }),
      });
      
      const driveData = await driveResponse.json();
      
      if (!driveData.success) {
        throw new Error(driveData.error || 'Drive upload failed');
      }
      
      console.log('✅ Uploaded to Drive:', driveData.file.url);
      
      // Step 3: Send Email
      setProgress('Envoi de l\'email...');
      
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          commercial,
          fileName: pdfData.fileName,
          pdfBase64: pdfData.pdfBase64,
          assemblyInfo: pdfData.assemblyInfo,
        }),
      });
      
      const emailData = await emailResponse.json();
      
      if (!emailData.success) {
        console.warn('⚠️ Email sending failed (non-critical)');
      } else {
        console.log('✅ Email sent');
      }
      
      // Step 4: Log to database
      setProgress('Enregistrement...');
      
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          commercial,
          quoteType,
          centralType: quoteType === 'alarme' ? centralType : undefined,
          products: products.map(p => p.name),
          fileName: pdfData.fileName,
          driveUrl: driveData.file.url,
          emailSent: emailData.success,
        }),
      });
      
      console.log('✅ Quote logged');
      
      // Step 5: Download PDF locally
      setProgress('Téléchargement du PDF...');
      
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(pdfData.pdfBase64), c => c.charCodeAt(0))],
        { type: 'application/pdf' }
      );
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded locally');
      
      // Success!
      setSuccess(true);
      setProgress('');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setClientName('');
        setProducts([]);
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('❌ Quote generation error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();
  const catalog = quoteType === 'alarme' ? ALARM_PRODUCTS : CAMERA_PRODUCTS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📄 Créer un devis
          </h1>
          <p className="text-gray-600">
            Générez des devis professionnels en quelques clics
          </p>
        </div>

        <Tabs value={quoteType} onValueChange={(v) => setQuoteType(v as 'alarme' | 'video')} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="alarme">🚨 Alarme</TabsTrigger>
            <TabsTrigger value="video">📹 Vidéosurveillance</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Nom du client *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercial">Commercial *</Label>
                    <Select value={commercial} onValueChange={setCommercial}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {commercials.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {quoteType === 'alarme' && (
                  <div>
                    <Label>Type de centrale</Label>
                    <Select value={centralType} onValueChange={(v) => setCentralType(v as 'titane' | 'jablotron')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="titane">Titane</SelectItem>
                        <SelectItem value="jablotron">Jablotron</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produits</CardTitle>
                <CardDescription>Sélectionnez les produits à inclure dans le devis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={addProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.price} CHF
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {products.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun produit sélectionné
                  </p>
                )}

                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.price} CHF/unité</p>
                    </div>
                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                      className="w-20"
                      min="1"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quoteType === 'video' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accessories"
                      checked={includeAccessories}
                      onCheckedChange={(checked) => setIncludeAccessories(checked as boolean)}
                    />
                    <Label htmlFor="accessories">
                      Inclure la fiche accessoires (onduleurs, coffrets, switches)
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overlay"
                    checked={addOverlay}
                    onCheckedChange={(checked) => setAddOverlay(checked as boolean)}
                  />
                  <Label htmlFor="overlay">
                    Ajouter l'overlay commercial (nom, téléphone, email)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Matériel ({products.length})</span>
                    <span>{totals.productsTotal.toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Installation</span>
                    <span>{totals.installation.toFixed(2)} CHF</span>
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total HT</span>
                    <span>{totals.totalHT.toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Total TTC</span>
                    <span>{totals.totalTTC.toFixed(2)} CHF</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    <CheckCircle size={16} />
                    Devis généré avec succès!
                  </div>
                )}

                {progress && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    {progress}
                  </div>
                )}

                <Button
                  onClick={generateQuote}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Générer le devis
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Le PDF sera téléchargé, envoyé par email et sauvegardé sur Drive
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

