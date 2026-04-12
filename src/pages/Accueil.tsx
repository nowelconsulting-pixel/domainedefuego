import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, ChevronRight, Star } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { useAnimaux, useConfig } from '../hooks/useData';

const etapes = [
  {
    num: '01',
    titre: 'Candidature',
    desc: 'Remplissez notre formulaire en ligne. Présentez-vous, votre logement et votre projet de vie avec un animal.',
  },
  {
    num: '02',
    titre: 'Entretien',
    desc: "Un bénévole de l'association vous contacte pour échanger et vérifier la compatibilité avec l'animal.",
  },
  {
    num: '03',
    titre: 'Adoption',
    desc: "Signature du contrat d'adoption, versement de la participation aux frais, et votre nouveau compagnon rentre à la maison !",
  },
];

const temoignages = [
  {
    texte:
      "Nous avons adopté Rex il y a 6 mois et c'est le plus beau cadeau qu'on se soit fait. L'équipe de Domaine de Fuego nous a accompagnés avec beaucoup de professionnalisme et de bienveillance.",
    auteur: 'Marie & Julien',
    lieu: 'Lyon (69)',
  },
  {
    texte:
      "Lola a rejoint notre famille et elle s'est intégrée en quelques jours seulement. Merci à l'association pour leur suivi post-adoption, c'est vraiment rassurant.",
    auteur: 'Pascal',
    lieu: 'Montpellier (34)',
  },
  {
    texte:
      "J'avais des craintes avec mes jeunes enfants mais l'association a très bien évalué la compatibilité. Mia adore nos enfants, c'est magique !",
    auteur: 'Sandrine',
    lieu: 'Paris (75)',
  },
];

export default function Accueil() {
  const { data: animaux } = useAnimaux();
  const { data: config } = useConfig();
  const derniers = animaux?.filter(a => a.statut === 'Disponible').slice(0, 3) ?? [];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-coral-500/20 text-coral-400 border border-coral-500/30 px-4 py-1 rounded-full text-sm font-medium mb-6">
              Association loi 1901 · Ardèche &amp; Vaucluse
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Chaque animal<br />
              <span className="text-coral-400">mérite un foyer</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Domaine de Fuego accompagne chiens, chats et autres animaux vers l'adoption responsable depuis 2016.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/animaux" className="btn-primary text-base px-8 py-4">
                Voir les animaux
                <ChevronRight size={20} />
              </Link>
              <Link to="/faire-un-don" className="btn-secondary text-base px-8 py-4">
                Faire un don
                <Heart size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="bg-coral-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">
                {config?.chiffres.animaux_adoptes ?? '...'}
              </div>
              <div className="text-lg opacity-90">animaux adoptés</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">
                {config?.chiffres.familles_accueil ?? '...'}
              </div>
              <div className="text-lg opacity-90">familles d'accueil actives</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">
                {config?.chiffres.annees_existence ?? '...'}
              </div>
              <div className="text-lg opacity-90">ans d'existence</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">Un processus simple et bienveillant en 3 étapes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {etapes.map(e => (
              <div key={e.num} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-coral-50 transition-colors">
                <div className="w-16 h-16 bg-coral-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {e.num}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{e.titre}</h3>
                <p className="text-gray-600 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/adopter" className="btn-primary">
              Déposer une candidature
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* DERNIERS ARRIVANTS */}
      {derniers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title">Derniers arrivants</h2>
              <p className="section-subtitle">Ces animaux attendent leur famille idéale</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {derniers.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/animaux" className="btn-primary">
                Voir tous nos animaux
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TÉMOIGNAGES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Ils ont adopté</h2>
            <p className="section-subtitle">Les témoignages de nos familles adoptantes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {temoignages.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-coral-400 text-coral-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.texte}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.auteur}</div>
                  <div className="text-sm text-gray-500">{t.lieu}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à changer une vie ?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Devenez adoptant ou famille d'accueil — chaque geste compte pour nos animaux.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/animaux" className="btn-primary">
              <Heart size={20} />
              Adopter un animal
            </Link>
            <Link to="/famille-accueil" className="btn-secondary border-gray-600 text-gray-300 hover:bg-gray-800">
              <Users size={20} />
              Devenir famille d'accueil
            </Link>
            <Link to="/faire-un-don" className="btn-secondary border-gray-600 text-gray-300 hover:bg-gray-800">
              <Calendar size={20} />
              Faire un don
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
