export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Mentions légales</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Éditeur du site</h2>
          <p className="text-gray-700 mb-6">
            <strong>Domaine de Fuego</strong><br />
            Association loi 1901<br />
            Siège social : 07200 Aubenas, France<br />
            Email : contact@domainedefuego.fr
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hébergement</h2>
          <p className="text-gray-700 mb-6">
            Ce site est hébergé par <strong>Netlify</strong><br />
            44 Montgomery Street, Suite 300, San Francisco, CA 94104, USA
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Données personnelles</h2>
          <p className="text-gray-700 mb-6">
            Les informations recueillies via les formulaires de ce site sont utilisées uniquement dans le cadre du traitement de vos candidatures d'adoption ou de famille d'accueil. Elles ne sont pas transmises à des tiers. Conformément à la loi Informatique et Libertés du 6 janvier 1978 et au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant à contact@domainedefuego.fr.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h2>
          <p className="text-gray-700">
            Ce site utilise le localStorage de votre navigateur pour sauvegarder vos préférences (animaux favoris) et les données de l'administration. Aucun cookie de tracking tiers n'est utilisé.
          </p>
        </div>
      </div>
    </div>
  );
}
