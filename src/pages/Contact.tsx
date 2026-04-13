import { Phone, Mail, MapPin } from 'lucide-react';
import FormContact from '../components/FormContact';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from '../components/SocialIcons';
import { useConfig } from '../hooks/useData';

export default function Contact() {
  const { data: config } = useConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact</h1>
          <p className="text-gray-600 text-lg">Une question ? N'hésitez pas à nous écrire.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Nos coordonnées</h2>
              <div className="space-y-4">
                {config?.telephone && (
                  <a href={`tel:${config.telephone}`} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center group-hover:bg-coral-100 transition-colors">
                      <Phone size={22} className="text-coral-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Téléphone</div>
                      <div className="font-medium text-gray-900">{config.telephone}</div>
                    </div>
                  </a>
                )}
                {config?.email_contact && (
                  <a href={`mailto:${config.email_contact}`} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center group-hover:bg-coral-100 transition-colors">
                      <Mail size={22} className="text-coral-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Email</div>
                      <div className="font-medium text-gray-900">{config.email_contact}</div>
                    </div>
                  </a>
                )}
                {config?.adresse && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center">
                      <MapPin size={22} className="text-coral-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Adresse</div>
                      <div className="font-medium text-gray-900">{config.adresse}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Réseaux */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Réseaux sociaux</h2>
              <div className="flex gap-3">
                {config?.facebook_url && (
                  <a
                    href={config.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow font-medium text-gray-800"
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
                    className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow font-medium text-gray-800"
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
                    className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow font-medium text-gray-800"
                  >
                    <LinkedInIcon size={20} className="text-blue-700" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Envoyer un message</h2>
            <FormContact />
          </div>
        </div>
      </div>
    </div>
  );
}
