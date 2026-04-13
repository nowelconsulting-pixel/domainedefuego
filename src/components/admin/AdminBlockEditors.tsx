import { useState } from 'react';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { Block, BlockType } from '../../types/admin';
import { detectVideoType, getYoutubeThumbnail } from '../../utils/image';

export const BLOCK_TYPES: { type: BlockType; label: string; emoji: string }[] = [
  { type: 'text',         label: 'Texte riche',           emoji: '📝' },
  { type: 'image',        label: 'Image + légende',       emoji: '🖼️' },
  { type: 'card',         label: 'Carte info',            emoji: '🃏' },
  { type: 'cta',          label: 'Bouton CTA',            emoji: '🔘' },
  { type: 'gallery',      label: 'Galerie',               emoji: '📸' },
  { type: 'contact_form', label: 'Formulaire contact',    emoji: '✉️' },
  { type: 'faq',          label: 'Accordéon FAQ',         emoji: '❓' },
  { type: 'testimonial',  label: 'Témoignage',            emoji: '💬' },
  { type: 'video',        label: 'Vidéo',                 emoji: '🎬' },
  { type: 'separator',    label: 'Séparateur',            emoji: '➖' },
  { type: 'columns2',     label: 'Colonnes 2',            emoji: '📰' },
  { type: 'hero_banner',  label: 'Bannière hero',         emoji: '🏔️' },
  { type: 'stat',         label: 'Chiffre mis en avant',  emoji: '📊' },
  { type: 'team',         label: "Liste d'équipe",        emoji: '👥' },
  { type: 'embed',        label: 'Embed HTML',            emoji: '🔧' },
];

export function newBlock(type: BlockType): Block {
  return { id: `block-${Date.now()}`, type, data: {} };
}

// ─── Sub-editors for complex blocks ─────────────────────────────────────────

interface FaqItem { q: string; a: string; }

function FaqBlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const [items, setItems] = useState<FaqItem[]>(() => {
    try { return JSON.parse((block.data.items as string) || '[]'); }
    catch { return []; }
  });

  const commit = (next: FaqItem[]) => {
    setItems(next);
    onChange({ ...block, data: { ...block.data, items: JSON.stringify(next) } });
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 w-6">Q{i + 1}</span>
            <input
              className="form-input flex-1 text-sm"
              value={item.q}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], q: e.target.value }; commit(n); }}
              placeholder="Question"
            />
            <button onClick={() => commit(items.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-50 rounded">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-gray-500 w-6 mt-2">R</span>
            <textarea
              className="form-input flex-1 text-sm"
              rows={2}
              value={item.a}
              onChange={e => { const n = [...items]; n[i] = { ...n[i], a: e.target.value }; commit(n); }}
              placeholder="Réponse"
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => commit([...items, { q: '', a: '' }])}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-coral-50 text-coral-600 rounded-lg hover:bg-coral-100"
      >
        <Plus size={14} />Ajouter une entrée FAQ
      </button>
    </div>
  );
}

interface TeamMember { name: string; role: string; photo: string; desc: string; }

function TeamBlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try { return JSON.parse((block.data.members as string) || '[]'); }
    catch { return []; }
  });

  const commit = (next: TeamMember[]) => {
    setMembers(next);
    onChange({ ...block, data: { ...block.data, members: JSON.stringify(next) } });
  };

  const update = (i: number, field: keyof TeamMember, value: string) => {
    const n = [...members];
    n[i] = { ...n[i], [field]: value };
    commit(n);
  };

  return (
    <div className="space-y-3">
      {members.map((m, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Membre {i + 1}</span>
            <button onClick={() => commit(members.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-50 rounded">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="form-label text-xs">Nom</label>
              <input className="form-input text-sm" value={m.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Prénom Nom" />
            </div>
            <div>
              <label className="form-label text-xs">Rôle</label>
              <input className="form-input text-sm" value={m.role} onChange={e => update(i, 'role', e.target.value)} placeholder="Bénévole, Vétérinaire…" />
            </div>
          </div>
          <div>
            <label className="form-label text-xs">URL photo</label>
            <input className="form-input text-sm" value={m.photo} onChange={e => update(i, 'photo', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="form-label text-xs">Description courte</label>
            <textarea className="form-input text-sm" rows={2} value={m.desc} onChange={e => update(i, 'desc', e.target.value)} />
          </div>
        </div>
      ))}
      <button
        onClick={() => commit([...members, { name: '', role: '', photo: '', desc: '' }])}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-coral-50 text-coral-600 rounded-lg hover:bg-coral-100"
      >
        <Plus size={14} />Ajouter un membre
      </button>
    </div>
  );
}

// ─── Main BlockEditor ────────────────────────────────────────────────────────

export function BlockEditor({ block, onChange, onDelete, onMove, isFirst, isLast }: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const setData = (k: string, v: string) => onChange({ ...block, data: { ...block.data, [k]: v } });
  const label = BLOCK_TYPES.find(t => t.type === block.type)?.label ?? block.type;
  const emoji = BLOCK_TYPES.find(t => t.type === block.type)?.emoji ?? '';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <GripVertical size={16} className="text-gray-400" />
          {emoji} {label}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={isFirst} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">▲</button>
          <button onClick={() => onMove(1)} disabled={isLast} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">▼</button>
          <button onClick={onDelete} className="p-1 hover:bg-red-100 text-red-500 rounded"><X size={14} /></button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {block.type === 'text' && (
          <RichTextEditor
            content={(block.data.content as string) || ''}
            onChange={v => setData('content', v)}
          />
        )}

        {block.type === 'image' && (
          <>
            <div>
              <label className="form-label">URL de l'image</label>
              <input className="form-input" value={(block.data.url as string) || ''} onChange={e => setData('url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="form-label">Légende</label>
              <input className="form-input" value={(block.data.caption as string) || ''} onChange={e => setData('caption', e.target.value)} />
            </div>
            {block.data.url && (
              <img src={block.data.url as string} alt="" className="max-h-40 rounded-lg object-cover" />
            )}
          </>
        )}

        {block.type === 'card' && (
          <>
            <div>
              <label className="form-label">Icône (nom lucide-react)</label>
              <input className="form-input" value={(block.data.icon as string) || ''} onChange={e => setData('icon', e.target.value)} placeholder="Heart, Star, Home..." />
            </div>
            <div>
              <label className="form-label">Titre</label>
              <input className="form-input" value={(block.data.title as string) || ''} onChange={e => setData('title', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Texte</label>
              <textarea className="form-input" rows={3} value={(block.data.text as string) || ''} onChange={e => setData('text', e.target.value)} />
            </div>
          </>
        )}

        {block.type === 'cta' && (
          <>
            <div>
              <label className="form-label">Texte du bouton</label>
              <input className="form-input" value={(block.data.label as string) || ''} onChange={e => setData('label', e.target.value)} placeholder="En savoir plus" />
            </div>
            <div>
              <label className="form-label">Lien (URL)</label>
              <input className="form-input" value={(block.data.url as string) || ''} onChange={e => setData('url', e.target.value)} placeholder="/adopter ou https://..." />
            </div>
          </>
        )}

        {block.type === 'gallery' && (
          <div>
            <label className="form-label">URLs des photos (une par ligne)</label>
            <textarea
              className="form-input font-mono text-xs"
              rows={4}
              value={(block.data.photos as string) || ''}
              onChange={e => setData('photos', e.target.value)}
              placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
            />
          </div>
        )}

        {block.type === 'contact_form' && (
          <p className="text-sm text-gray-500 italic">Le formulaire de contact sera affiché ici sur le front-office.</p>
        )}

        {block.type === 'faq' && (
          <FaqBlockEditor block={block} onChange={onChange} />
        )}

        {block.type === 'testimonial' && (
          <>
            <div>
              <label className="form-label">Texte du témoignage</label>
              <textarea className="form-input" rows={4} value={(block.data.text as string) || ''} onChange={e => setData('text', e.target.value)} placeholder="Ce que la personne a dit..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Nom</label>
                <input className="form-input" value={(block.data.name as string) || ''} onChange={e => setData('name', e.target.value)} placeholder="Marie Dupont" />
              </div>
              <div>
                <label className="form-label">Rôle / Lieu</label>
                <input className="form-input" value={(block.data.role as string) || ''} onChange={e => setData('role', e.target.value)} placeholder="Adoptante, Lyon (69)" />
              </div>
            </div>
            <div>
              <label className="form-label">Note (1–5 étoiles)</label>
              <select className="form-input" value={(block.data.stars as string) || '5'} onChange={e => setData('stars', e.target.value)}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </>
        )}

        {block.type === 'video' && (() => {
          const url = (block.data.url as string) || '';
          const vtype = detectVideoType(url);
          const thumb = vtype === 'youtube' ? getYoutubeThumbnail(url) : null;
          return (
            <>
              <div>
                <label className="form-label">URL de la vidéo</label>
                <input className="form-input" value={url} onChange={e => setData('url', e.target.value)} placeholder="https://www.youtube.com/watch?v=... ou .mp4" />
                <p className="text-xs text-gray-400 mt-1">YouTube, URL directe (.mp4 / .webm)…</p>
              </div>
              {thumb && <img src={thumb} alt="Aperçu YouTube" className="max-h-32 rounded-lg object-cover" />}
              {vtype === 'direct' && url && <p className="text-xs text-green-600">✓ Vidéo directe détectée</p>}
            </>
          );
        })()}

        {block.type === 'separator' && (
          <div>
            <label className="form-label">Taille de l'espace</label>
            <select className="form-input" value={(block.data.size as string) || 'medium'} onChange={e => setData('size', e.target.value)}>
              <option value="small">Petit (16px)</option>
              <option value="medium">Moyen (32px)</option>
              <option value="large">Grand (64px)</option>
            </select>
          </div>
        )}

        {block.type === 'columns2' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Colonne gauche</label>
              <textarea className="form-input font-mono text-xs" rows={6} value={(block.data.left as string) || ''} onChange={e => setData('left', e.target.value)} placeholder="Texte ou HTML..." />
            </div>
            <div>
              <label className="form-label">Colonne droite</label>
              <textarea className="form-input font-mono text-xs" rows={6} value={(block.data.right as string) || ''} onChange={e => setData('right', e.target.value)} placeholder="Texte ou HTML..." />
            </div>
          </div>
        )}

        {block.type === 'hero_banner' && (
          <>
            <div>
              <label className="form-label">Image de fond (URL)</label>
              <input className="form-input" value={(block.data.bg_url as string) || ''} onChange={e => setData('bg_url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="form-label">Titre</label>
              <input className="form-input" value={(block.data.title as string) || ''} onChange={e => setData('title', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Sous-titre</label>
              <input className="form-input" value={(block.data.subtitle as string) || ''} onChange={e => setData('subtitle', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Texte du bouton CTA</label>
                <input className="form-input" value={(block.data.cta_label as string) || ''} onChange={e => setData('cta_label', e.target.value)} placeholder="En savoir plus" />
              </div>
              <div>
                <label className="form-label">Lien du bouton CTA</label>
                <input className="form-input" value={(block.data.cta_url as string) || ''} onChange={e => setData('cta_url', e.target.value)} placeholder="/adopter" />
              </div>
            </div>
          </>
        )}

        {block.type === 'stat' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Chiffre / Valeur</label>
                <input className="form-input" value={(block.data.value as string) || ''} onChange={e => setData('value', e.target.value)} placeholder="247" />
              </div>
              <div>
                <label className="form-label">Libellé</label>
                <input className="form-input" value={(block.data.label as string) || ''} onChange={e => setData('label', e.target.value)} placeholder="animaux adoptés" />
              </div>
            </div>
            <div>
              <label className="form-label">Couleur</label>
              <select className="form-input" value={(block.data.color as string) || 'coral'} onChange={e => setData('color', e.target.value)}>
                <option value="coral">Coral (accent)</option>
                <option value="blue">Bleu</option>
                <option value="green">Vert</option>
                <option value="purple">Violet</option>
              </select>
            </div>
          </>
        )}

        {block.type === 'team' && (
          <TeamBlockEditor block={block} onChange={onChange} />
        )}

        {block.type === 'embed' && (
          <>
            <div>
              <label className="form-label">Code HTML à intégrer</label>
              <textarea
                className="form-input font-mono text-xs"
                rows={6}
                value={(block.data.code as string) || ''}
                onChange={e => setData('code', e.target.value)}
                placeholder="<iframe ...></iframe>"
              />
            </div>
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
              ⚠️ N'intégrez que du code de confiance. Le HTML est rendu tel quel dans le navigateur.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
