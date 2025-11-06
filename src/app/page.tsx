import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Settings } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full text-3xl font-bold mb-6">
            D
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Dialarme Quote Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Système professionnel de génération de devis PDF pour alarmes et vidéosurveillance
          </p>
          <p className="text-sm text-gray-500 mt-2">Version 2.0 - Serverless Architecture</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Link href="/create-devis">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                <FileText size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Créer un devis
              </h2>
              <p className="text-gray-600 mb-4">
                Générez des devis professionnels en PDF avec assemblage automatique des fiches produits
              </p>
              <Button className="w-full">
                Commencer →
              </Button>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <BarChart3 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tableau de bord
              </h2>
              <p className="text-gray-600 mb-4">
                Visualisez les statistiques, top commerciaux et produits les plus demandés
              </p>
              <Button variant="outline" className="w-full">
                Voir les stats →
              </Button>
            </div>
          </Link>

          <Link href="/settings">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-4">
                <Settings size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Paramètres
              </h2>
              <p className="text-gray-600 mb-4">
                Configurez les produits, commerciaux et paramètres système
              </p>
              <Button variant="outline" className="w-full">
                Configurer →
              </Button>
            </div>
          </Link>
        </div>

        {/* Features List */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 Fonctionnalités clés
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              '✅ Génération PDF professionnelle',
              '✅ Assemblage automatique des fiches',
              '✅ Envoi email avec pièce jointe',
              '✅ Sauvegarde Google Drive',
              '✅ Overlay commercial personnalisé',
              '✅ Dashboard analytics en temps réel',
              '✅ Support alarmes (Titane & Jablotron)',
              '✅ Support vidéosurveillance',
              '✅ Déduplication intelligente',
              '✅ Architecture serverless',
              '✅ Responsive (iPad, mobile, desktop)',
              '✅ Performance < 3s',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>© 2024 Dialarme - Tous droits réservés</p>
          <p className="text-sm mt-2">
            Développé avec Next.js 14, TypeScript & TailwindCSS
          </p>
        </div>
      </div>
    </main>
  );
}

