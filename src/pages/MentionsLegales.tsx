import { usePageContent } from '../hooks/usePageContent';

export default function MentionsLegales() {
  const pc = usePageContent('mentions-legales');

  const sections = [
    { title: pc.editeur_title       as string, content: pc.editeur_content       as string },
    { title: pc.hebergement_title   as string, content: pc.hebergement_content   as string },
    { title: pc.donnees_title       as string, content: pc.donnees_content       as string },
    { title: pc.cookies_title       as string, content: pc.cookies_content       as string },
  ].filter(s => s.title || s.content);

  return (
    <div className="min-h-screen bg-page py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-forest mb-10">
          {(pc.hero_title as string) || 'Mentions légales'}
        </h1>
        <div className="bg-surface rounded-2xl p-8 shadow-sm space-y-8 border-2 border-site-border">
          {sections.map((s, i) => (
            <div key={i}>
              {s.title && (
                <h2 className="text-xl font-semibold text-forest mb-3">{s.title}</h2>
              )}
              {s.content && (
                s.content.trimStart().startsWith('<')
                  ? <div className="text-muted leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_a]:text-nv-green" dangerouslySetInnerHTML={{ __html: s.content }} />
                  : <p className="text-muted leading-relaxed whitespace-pre-line">{s.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
