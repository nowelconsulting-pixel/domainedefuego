import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useConfig } from '../hooks/useData';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from '../components/SocialIcons';

function loadMaintenanceContent() {
  try {
    const raw = localStorage.getItem('maintenance_config');
    if (raw) return JSON.parse(raw) as { title?: string; subtitle?: string; show_don_btn?: boolean; preview_code?: string };
  } catch { /**/ }
  return {};
}

export default function MaintenancePage() {
  const { data: config } = useConfig();
  const mc = loadMaintenanceContent();
  const secretCode = mc.preview_code || 'Bigdodo33$';
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (code === secretCode) {
      localStorage.setItem('preview_access', 'true');
      window.dispatchEvent(new Event('maintenance_changed'));
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-forest-dark flex flex-col items-center justify-center px-6 text-center">

      {/* Paw */}
      <div className="w-20 h-20 rounded-full bg-nv-amber/20 flex items-center justify-center mb-8 text-4xl animate-[gentle-pulse_2.8s_ease-in-out_infinite]">
        🐾
      </div>

      {/* Title */}
      <h1 className="font-black text-4xl md:text-5xl text-white mb-4 leading-tight">
        {mc.title || 'Le site arrive bientôt 🐾'}
      </h1>

      {/* Subtitle */}
      <p className="text-white/50 text-lg max-w-md leading-relaxed mb-10 whitespace-pre-line">
        {mc.subtitle || 'Nous préparons actuellement la plateforme d\'adoption.\nMerci pour votre patience.'}
      </p>

      {/* Donation CTA */}
      {mc.show_don_btn !== false && (
        <Link to="/faire-un-don" className="btn-don mb-10">
          Soutenir le projet dès maintenant ♥
        </Link>
      )}

      {/* Email from config */}
      {config?.email_contact && (
        <a
          href={`mailto:${config.email_contact}`}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-6"
        >
          <Mail size={16} />
          {config.email_contact}
        </a>
      )}

      {/* Social links from config */}
      {config && (config.facebook_url || config.instagram_url || config.linkedin_url) && (
        <div className="flex items-center gap-3 mb-16">
          {config.facebook_url && (
            <a href={config.facebook_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-nv-green transition-colors text-white/50 hover:text-white"
              aria-label="Facebook">
              <FacebookIcon size={20} />
            </a>
          )}
          {config.instagram_url && (
            <a href={config.instagram_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-nv-green transition-colors text-white/50 hover:text-white"
              aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
          )}
          {config.linkedin_url && (
            <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-nv-green transition-colors text-white/50 hover:text-white"
              aria-label="LinkedIn">
              <LinkedInIcon size={20} />
            </a>
          )}
        </div>
      )}

      {/* Secret access */}
      <div className="mt-auto pt-8 pb-6">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="text-white/20 hover:text-white/40 text-xs transition-colors"
          >
            Accès
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Code d'accès"
              className={`px-3 py-1.5 rounded-lg bg-forest text-white text-sm border ${
                error ? 'border-red-500' : 'border-white/10'
              } focus:outline-none focus:border-white/30`}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-lg bg-forest text-white/40 hover:text-white text-sm border border-white/10 hover:border-white/30 transition-colors"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
