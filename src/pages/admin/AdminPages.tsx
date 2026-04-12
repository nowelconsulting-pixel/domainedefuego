import { useState, useEffect } from 'react';
import { Save, Download, Upload, CheckCircle2 } from 'lucide-react';
import { usePages } from '../../hooks/useData';
import type { Pages } from '../../types';

export default function AdminPages() {
  const { data: pages, save } = usePages();
  const [presTexte, setPresTexte] = useState('');
  const [donTexte, setDonTexte] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pages) {
      setPresTexte(pages.presentation.texte);
      setDonTexte(pages.faire_un_don.texte);
    }
  }, [pages]);

  const handleSave = () => {
    if (!pages) return;
    const updated: Pages = {
      ...pages,
      presentation: { ...pages.presentation, texte: presTexte },
      faire_un_don: { ...pages.faire_un_don, texte: donTexte },
    };
    save(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    if (!pages) return;
    const updated: Pages = {
      ...pages,
      presentation: { ...pages.presentation, texte: presTexte },
      faire_un_don: { ...pages.faire_un_don, texte: donTexte },
    };
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pages.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string) as Pages;
        save(parsed);
        setPresTexte(parsed.presentation.texte);
        setDonTexte(parsed.faire_un_don.texte);
        alert('Importé avec succès !');
      } catch { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Éditeur de pages</h1>
        <div className="flex gap-3">
          <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={16} />Exporter
          </button>
          <label className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload size={16} />Importer
            <input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
        </div>
      </div>

      <div className="space-y-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Page Présentation — Texte principal</h2>
          <textarea
            className="form-input font-sans text-sm"
            rows={12}
            value={presTexte}
            onChange={e => setPresTexte(e.target.value)}
            placeholder="Texte de la page Présentation..."
          />
          <p className="text-xs text-gray-400 mt-2">Séparez les paragraphes par une ligne vide</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Page Faire un don — Texte principal</h2>
          <textarea
            className="form-input font-sans text-sm"
            rows={8}
            value={donTexte}
            onChange={e => setDonTexte(e.target.value)}
            placeholder="Texte de la page Faire un don..."
          />
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-coral-500 hover:bg-coral-600 text-white'
          }`}
        >
          {saved ? <><CheckCircle2 size={18} />Sauvegardé !</> : <><Save size={18} />Sauvegarder</>}
        </button>
      </div>
    </div>
  );
}
