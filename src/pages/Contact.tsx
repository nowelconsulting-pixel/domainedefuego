import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormContact from '../components/FormContact';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from '../components/SocialIcons';
import { useConfig } from '../hooks/useData';
import { usePageContent } from '../hooks/usePageContent';

export default function Contact() {
  const { data: config } = useConfig();
  const pc = usePageContent('contact');

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-forest mb-3">
            {(pc.hero_title as string) || 'Contact'}
          </h1>
          <p className="text-muted text-lg">
            {(pc.hero_subtitle as string) || "Une question ? N'hésitez pas à nous écrire."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-forest mb-6">Nos coordonnées</h2>
              <div className="space-y-4">
                {config?.telephone && (
                  <a href={`tel:${config.telephone}`} className="flex items-center gap-4 p-4 bg-surface rounded-xl border-2 border-site-border hover:border-nv-green transition-colors group">
                    <div className="w-12 h-12 bg-nv-green-light rounded-xl flex items-center justify-center group-hover:bg-nv-green-light transition-colors">
                      <Phone size={22} className="text-nv-green" />
                    </div>
                    <div>
                      <div className="text-xs text-hint mb-0.5">Téléphone</div>
                      <div className="font-semibold text-forest">{config.telephone}</div>
                    </div>
                  </a>
                )}
                {config?.email_contact && (
                  <a href={`mailto:${config.email_contact}`} className="flex items-center gap-4 p-4 bg-surface rounded-xl border-2 border-site-border hover:border-nv-green transition-colors group">
                    <div className="w-12 h-12 bg-nv-green-light rounded-xl flex items-center justify-center">
                      <Mail size={22} className="text-nv-green" />
                    </div>
                    <div>
                      <div className="text-xs text-hint mb-0.5">Email</div>
                      <div className="font-semibold text-forest">{config.email_contact}</div>
                    </div>
                  </a>
                )}
                {config?.adresse && (
                  <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border-2 border-site-border">
                    <div className="w-12 h-12 bg-nv-green-light rounded-xl flex items-center justify-center">
                      <MapPin size={22} className="text-nv-green" />
                    </div>
                    <div>
                      <div className="text-xs text-hint mb-0.5">Adresse</div>
                      <div className="font-semibold text-forest">{config.adresse}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Réseaux */}
            <div>
              <h2 className="text-xl font-bold text-forest mb-4">Réseaux sociaux</h2>
              <div className="flex flex-wrap gap-3">
                {config?.facebook_url && (
                  <a
                    href={config.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 bg-surface rounded-xl border-2 border-site-border hover:border-nv-green transition-colors font-medium text-forest"
                  >
                    <FacebookIcon size={20} className="text-blue-600" />
                    Facebook
                  </a>
                )}
                {config?.instagram_url && (
                  <a
                    href={config.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 bg-surface rounded-xl border-2 border-site-border hover:border-nv-green transition-colors font-medium text-forest"
                  >
                    <InstagramIcon size={20} className="text-pink-500" />
                    Instagram
                  </a>
                )}
                {config?.linkedin_url && (
                  <a
                    href={config.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 bg-surface rounded-xl border-2 border-site-border hover:border-nv-green transition-colors font-medium text-forest"
                  >
                    <LinkedInIcon size={20} className="text-blue-700" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-surface rounded-[20px] p-8 border-2 border-site-border">
            <h2 className="text-xl font-bold text-forest mb-6">Envoyer un message</h2>
            <FormContact />
          </div>
        </div>
      </div>

      {/* Optional CTA button */}
      {(pc.cta_url as string) && (
        <div className="bg-nv-green py-14 text-center">
          {(pc.cta_url as string).startsWith('http') ? (
            <a href={pc.cta_url as string} target="_blank" rel="noopener noreferrer"
              className="bg-white text-nv-green hover:bg-nv-green-light font-semibold px-10 py-4 rounded-xl inline-flex items-center gap-2 transition-colors">
              {(pc.cta_label as string) || 'En savoir plus'} <ChevronRight size={20} />
            </a>
          ) : (
            <Link to={pc.cta_url as string}
              className="bg-white text-nv-green hover:bg-nv-green-light font-semibold px-10 py-4 rounded-xl inline-flex items-center gap-2 transition-colors">
              {(pc.cta_label as string) || 'En savoir plus'} <ChevronRight size={20} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
