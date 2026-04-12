import { useState } from 'react';
import { X, MessageSquare, Download, ChevronDown } from 'lucide-react';
import { useCandidatures } from '../../hooks/useAdminData';
import type { Candidature, CandidatureStatus } from '../../types/admin';

const STATUS_COLORS: Record<CandidatureStatus, string> = {
  nouvelle:  'bg-blue-100 text-blue-700',
  en_cours:  'bg-yellow-100 text-yellow-700',
  acceptee:  'bg-green-100 text-green-700',
  refusee:   'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<CandidatureStatus, string> = {
  nouvelle: 'Nouvelle', en_cours: 'En cours', acceptee: 'Acceptée', refusee: 'Refusée',
};

const TYPE_LABELS: Record<string, string> = {
  adoption: 'Adoption',
  fa: "Famille d'accueil",
};

export default function AdminCandidatures() {
  const { candidatures, update, markAllRead } = useCandidatures();
  const [selected, setSelected] = useState<Candidature | null>(null);
  const [filterType, setFilterType]     = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

  // Mark all read when opening this page
  useState(() => { markAllRead(); });

  const filtered = candidatures.filter(c => {
    if (filterType !== 'Tous' && c.type !== filterType) return false;
    if (filterStatus !== 'Tous' && c.status !== filterStatus) return false;
    return true;
  });

  const setStatus = (id: string, status: CandidatureStatus) => update(id, { status });

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = ['Date', 'Type', 'Nom', 'Email', 'Téléphone', 'Animal', 'Statut', 'Notes'];
    const rows = filtered.map(c => [
      new Date(c.createdAt).toLocaleDateString('fr-FR'),
      TYPE_LABELS[c.type] ?? c.type,
      c.nom, c.email, c.telephone, c.animal ?? '',
      STATUS_LABELS[c.status], c.notes,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'candidatures.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Candidatures
          <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
        </h1>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download size={16} />Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative">
          <select className="form-input py-2 pr-8 appearance-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="Tous">Tous les types</option>
            <option value="adoption">Adoption</option>
            <option value="fa">Famille d'accueil</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="form-input py-2 pr-8 appearance-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="Tous">Tous les statuts</option>
            {(Object.entries(STATUS_LABELS) as [CandidatureStatus, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Candidat</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Animal</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune candidature</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.type === 'adoption' ? 'bg-coral-100 text-coral-700' : 'bg-blue-100 text-blue-700'}`}>
                      {TYPE_LABELS[c.type]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{c.nom}</div>
                    <div className="text-xs text-gray-400">{c.email}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{c.animal ?? '—'}</td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <select
                        className={`px-2 py-1 rounded-full text-xs font-medium appearance-none pr-5 cursor-pointer ${STATUS_COLORS[c.status]}`}
                        value={c.status}
                        onChange={e => setStatus(c.id, e.target.value as CandidatureStatus)}
                      >
                        {(Object.entries(STATUS_LABELS) as [CandidatureStatus, string][]).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setSelected(c)} title="Détails"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <MessageSquare size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected.nom}</h2>
                <p className="text-sm text-gray-400">{TYPE_LABELS[selected.type]} · {formatDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                <div><div className="text-xs text-gray-400">Email</div><div className="text-sm font-medium">{selected.email}</div></div>
                <div><div className="text-xs text-gray-400">Téléphone</div><div className="text-sm font-medium">{selected.telephone}</div></div>
                {selected.animal && <div><div className="text-xs text-gray-400">Animal souhaité</div><div className="text-sm font-medium">{selected.animal}</div></div>}
              </div>

              {/* Data */}
              {Object.keys(selected.data).length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Détails de la candidature</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selected.data).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 capitalize">{k.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-gray-800 mt-0.5">{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="form-label">Notes internes</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={selected.notes}
                  onChange={e => {
                    update(selected.id, { notes: e.target.value });
                    setSelected({ ...selected, notes: e.target.value });
                  }}
                  placeholder="Vos notes sur cette candidature..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="form-label">Statut</label>
                <select
                  className="form-input"
                  value={selected.status}
                  onChange={e => {
                    const s = e.target.value as CandidatureStatus;
                    setStatus(selected.id, s);
                    setSelected({ ...selected, status: s });
                  }}
                >
                  {(Object.entries(STATUS_LABELS) as [CandidatureStatus, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
