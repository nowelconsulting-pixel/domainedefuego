import { Link } from 'react-router-dom';
import { PawPrint, Home, Clock, CheckCircle2, Plus, Inbox } from 'lucide-react';
import { useAnimaux } from '../../hooks/useData';
import { useCandidatures } from '../../hooks/useAdminData';
import { getSession } from '../../utils/auth';

const STATUS_COLORS: Record<string, string> = {
  'nouvelle':  'bg-blue-100 text-blue-700',
  'en_cours':  'bg-yellow-100 text-yellow-700',
  'acceptee':  'bg-green-100 text-green-700',
  'refusee':   'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  'nouvelle': 'Nouvelle', 'en_cours': 'En cours',
  'acceptee': 'Acceptée',  'refusee': 'Refusée',
};

export default function AdminDashboard() {
  const { data: animaux } = useAnimaux();
  const { candidatures, markAllRead } = useCandidatures();
  const session = getSession();

  const disponibles = animaux?.filter(a => a.statut === 'Disponible').length ?? 0;
  const reserves    = animaux?.filter(a => a.statut === 'Réservé').length ?? 0;
  const adoptes     = animaux?.filter(a => a.statut === 'Adopté').length ?? 0;
  const total       = animaux?.length ?? 0;

  const recent5 = [...candidatures]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentAnimaux = [...(animaux ?? [])]
    .slice(-4)
    .reverse();

  const Stat = ({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour{session?.name ? `, ${session.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Voici un aperçu de l'activité récente.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={PawPrint} value={disponibles} label="Disponibles"  color="bg-green-500"  />
        <Stat icon={Clock}     value={reserves}   label="Réservés"     color="bg-orange-400" />
        <Stat icon={CheckCircle2} value={adoptes} label="Adoptés"      color="bg-gray-400"   />
        <Stat icon={Home}      value={total}      label="Total"        color="bg-coral-500"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dernières candidatures */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Inbox size={18} className="text-coral-500" />
              Dernières candidatures
            </h2>
            <Link
              to="/admin/candidatures"
              onClick={markAllRead}
              className="text-xs text-coral-500 hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recent5.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">Aucune candidature pour le moment</p>
            ) : (
              recent5.map(c => (
                <div key={c.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{c.nom}</div>
                    <div className="text-xs text-gray-400">
                      {c.type === 'adoption' ? 'Adoption' : 'Famille d\'accueil'}
                      {c.animal ? ` · ${c.animal}` : ''}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions rapides + animaux récents */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/animaux/new" className="flex items-center gap-2 p-3 bg-coral-50 hover:bg-coral-100 rounded-lg text-coral-700 text-sm font-medium transition-colors">
                <Plus size={16} />Ajouter un animal
              </Link>
              <Link to="/admin/pages" className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 text-sm font-medium transition-colors">
                <Plus size={16} />Nouvelle page
              </Link>
              <Link to="/admin/candidatures" className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 text-sm font-medium transition-colors">
                <Inbox size={16} />Candidatures
              </Link>
              <Link to="/admin/config" className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 text-sm font-medium transition-colors">
                <PawPrint size={16} />Configuration
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Animaux récents</h2>
              <Link to="/admin/animaux" className="text-xs text-coral-500 hover:underline">Voir tout</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentAnimaux.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">Aucun animal</p>
              ) : (
                recentAnimaux.map(a => (
                  <div key={a.id} className="px-6 py-3 flex items-center gap-3">
                    {a.photos[0] ? (
                      <img src={a.photos[0]} className="w-10 h-8 object-cover rounded" alt="" />
                    ) : (
                      <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400">🐾</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{a.nom}</div>
                      <div className="text-xs text-gray-400">{a.espece} · {a.race}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.statut === 'Disponible' ? 'bg-green-100 text-green-700' :
                      a.statut === 'Réservé' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{a.statut}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
