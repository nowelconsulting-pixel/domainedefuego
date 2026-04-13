import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useConfig } from '../hooks/useData';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from '../components/SocialIcons';

const SECRET_CODE = 'Bigdodo33$';

export default function MaintenancePage() {
  const { data: config } = useConfig();
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (code === SECRET_CODE) {
      localStorage.setItem('preview_access', 'true');
      window.location.href = '/';
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-center">

      {/* Paw */}
      <div className="w-20 h-20 rounded-full bg-coral-500/20 flex items-center justify-center mb-8 text-4xl">
        🐾
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        Le site arrive bientôt 🐾
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-10">
        Nous préparons actuellement la plateforme d'adoption.<br />
        Merci pour votre patience.
      </p>

      {/* Email from config */}
      {config?.email_contact && (
        <a
          href={`mailto:${config.email_contact}`}
          className="flex items-center gap-2 text-gray-400 hover:text-coral-400 transition-colors text-sm mb-6"
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
              className="p-2 rounded-lg text-gray-500 hover:text-coral-400 hover:bg-white/5 transition-colors"
              aria-label="Facebook">
              <FacebookIcon size={20} />
            </a>
          )}
          {config.instagram_url && (
            <a href={config.instagram_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-coral-400 hover:bg-white/5 transition-colors"
              aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
          )}
          {config.linkedin_url && (
            <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-coral-400 hover:bg-white/5 transition-colors"
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
            className="text-gray-700 hover:text-gray-500 text-xs transition-colors"
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
              className={`px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm border ${
                error ? 'border-red-500' : 'border-gray-700'
              } focus:outline-none focus:border-gray-500`}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-500 transition-colors"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
