import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';
import './garde-a-domicile.css';

// Mentions légales de la landing /garde-a-domicile (page autonome, hors Layout).
// Reprend le contenu éditable de /mentions-legales, seul l'éditeur du site change.
const EDITEUR_SAS =
  'SAS Domaine de Fuego en cours de formation\nSiège social : 24 rue de la Ravinière 95520 Osny, France\nEmail : contact@domainedefuego.fr';

export default function MentionsLegalesSas() {
  const pc = usePageContent('mentions-legales');

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Mentions légales — Visites à domicile — Domaine de Fuego';
    return () => { document.title = prevTitle; };
  }, []);

  const sections = [
    { title: (pc.editeur_title as string) || 'Éditeur du site', content: EDITEUR_SAS },
    { title: pc.hebergement_title as string, content: pc.hebergement_content as string },
    { title: pc.donnees_title     as string, content: pc.donnees_content     as string },
    { title: pc.cookies_title     as string, content: pc.cookies_content     as string },
  ].filter(s => s.title || s.content);

  return (
    <div className="gad">
      <header>
        <div className="wrap">
          <Link to="/garde-a-domicile" className="brand"><img src="/logo_transparent.png" alt="Domaine de Fuego" /><span className="brand-tag">Visites à domicile</span></Link>
          <Link to="/garde-a-domicile" className="link">Retour</Link>
        </div>
      </header>

      <main className="legal">
        <div className="wrap">
          <h1 className="h2">Mentions légales</h1>
          <div className="legal-box">
            {sections.map((s, i) => (
              <div key={i}>
                {s.title && <h2>{s.title}</h2>}
                {s.content && (
                  s.content.trimStart().startsWith('<')
                    ? <div className="legal-text" dangerouslySetInnerHTML={{ __html: s.content }} />
                    : <p className="legal-text legal-pre">{s.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer>
        <div className="foot-bottom"><div className="wrap"><span>© {new Date().getFullYear()} Domaine de Fuego · Visites à domicile</span></div></div>
      </footer>
    </div>
  );
}
