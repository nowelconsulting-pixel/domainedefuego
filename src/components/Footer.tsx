import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Logo from './Logo';
import { FacebookIcon, InstagramIcon } from './SocialIcons';
import { useConfig } from '../hooks/useData';

export default function Footer() {
  const { data: config } = useConfig();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Logo className="brightness-0 invert" size={36} />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Association loi 1901 dédiée à la protection animale et à l'adoption responsable.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/animaux', label: 'Nos animaux' },
                { to: '/presentation', label: 'Présentation' },
                { to: '/adopter', label: 'Adopter' },
                { to: '/famille-accueil', label: "Famille d'accueil" },
                { to: '/faire-un-don', label: 'Faire un don' },
                { to: '/contact', label: 'Contact' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-coral-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              {config?.telephone && (
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-coral-400 flex-shrink-0" />
                  <a href={`tel:${config.telephone}`} className="hover:text-coral-400 transition-colors">
                    {config.telephone}
                  </a>
                </li>
              )}
              {config?.email_contact && (
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-coral-400 flex-shrink-0" />
                  <a href={`mailto:${config.email_contact}`} className="hover:text-coral-400 transition-colors">
                    {config.email_contact}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-3 pt-2">
                {config?.facebook_url && (
                  <a
                    href={config.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-coral-500 transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon size={18} />
                  </a>
                )}
                {config?.instagram_url && (
                  <a
                    href={config.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-coral-500 transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={18} />
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Domaine de Fuego. Tous droits réservés.</p>
          <Link to="/mentions-legales" className="hover:text-gray-300">Mentions légales</Link>
        </div>
      </div>
    </footer>
  );
}
