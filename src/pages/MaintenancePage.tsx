import { Heart, Facebook, Instagram, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import { useConfig } from '../hooks/useData';

export default function MaintenancePage() {
  const { data: config } = useConfig();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="mb-8">
        <Logo size={56} />
      </div>

      {/* Paw icon */}
      <div className="w-20 h-20 bg-coral-500/20 rounded-full flex items-center justify-center mb-6">
        <Heart size={36} className="text-coral-400 fill-coral-400" />
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Le site arrive bientôt 🐾
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed mb-10">
        Nous préparons actuellement la plateforme d'adoption.<br />
        Merci pour votre patience.
      </p>

      {/* Disabled CTA */}
      <button
        disabled
        className="flex items-center gap-2 px-8 py-3 bg-coral-500/40 text-coral-300 rounded-lg font-semibold cursor-not-allowed mb-10 text-base"
      >
        <Heart size={18} />
        Voir les animaux
      </button>

      {/* Contact */}
      {config?.email_contact && (
        <a
          href={`mailto:${config.email_contact}`}
          className="flex items-center gap-2 text-gray-400 hover:text-coral-400 transition-colors text-sm mb-6"
        >
          <Mail size={16} />
          {config.email_contact}
        </a>
      )}

      {/* Social links */}
      {config && (
        <div className="flex items-center gap-4">
          {config.facebook_url && (
            <a
              href={config.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-coral-400 hover:bg-white/5 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
          )}
          {config.instagram_url && (
            <a
              href={config.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 hover:text-coral-400 hover:bg-white/5 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
