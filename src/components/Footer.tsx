import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Logo from './Logo';
import { FacebookIcon, InstagramIcon, LinkedInIcon } from './SocialIcons';
import { useConfig } from '../hooks/useData';
import type { AdminPage } from '../types/admin';
import { SYSTEM_PAGES } from '../types/admin';

function buildFooterLinks(): { to: string; label: string }[] {
  const systemData: Record<string, Partial<AdminPage>> = (() => {
    try { return JSON.parse(localStorage.getItem('system_page_data') || '{}'); }
    catch { return {}; }
  })();

  const links: { to: string; label: string; order: number }[] = SYSTEM_PAGES
    .filter(p => p.show_in_footer)
    .map(p => ({
      to: p.slug ? `/${p.slug}` : '/',
      label: systemData[p.id]?.title ?? p.title,
      order: p.menu_order,
    }));

  try {
    const stored = localStorage.getItem('admin_pages');
    if (stored) {
      (JSON.parse(stored) as AdminPage[])
        .filter(p => p.status === 'published' && !p.system && p.slug && p.show_in_footer)
        .forEach(p => links.push({ to: `/${p.slug}`, label: p.title, order: p.menu_order }));
    }
  } catch { /* ignore */ }

  return links.sort((a, b) => a.order - b.order);
}

export default function Footer() {
  const { data: config } = useConfig();
  const footerLinks = buildFooterLinks();

  const headingCls = 'text-gold text-[11px] font-extrabold uppercase tracking-widest mb-5';
  const linkCls    = 'text-white/45 hover:text-white/85 transition-colors text-sm leading-relaxed';

  return (
    <footer className="mt-auto" style={{ backgroundColor: '#1E2822' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* Col 1 — Brand */}
          <div>
            <Logo className="brightness-0 invert" />
            <p className="mt-4 text-sm leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Parce que chaque animal mérite une histoire.
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Association loi 1901 dédiée à la protection animale et à l'adoption responsable.
            </p>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h3 className={headingCls}>Navigation</h3>
            <ul className="space-y-2.5">
              {footerLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className={linkCls}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <h3 className={headingCls}>Contact</h3>
            <ul className="space-y-3">
              {config?.telephone && (
                <li className="flex items-center gap-2">
                  <Phone size={15} className="text-nv-teal flex-shrink-0" />
                  <a href={`tel:${config.telephone}`} className={linkCls}>
                    {config.telephone}
                  </a>
                </li>
              )}
              {config?.email_contact && (
                <li className="flex items-center gap-2">
                  <Mail size={15} className="text-nv-teal flex-shrink-0" />
                  <a href={`mailto:${config.email_contact}`} className={linkCls}>
                    {config.email_contact}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2.5 pt-2">
                {config?.facebook_url && (
                  <a href={config.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-nv-green transition-colors text-white/50 hover:text-white"
                    aria-label="Facebook">
                    <FacebookIcon size={17} />
                  </a>
                )}
                {config?.instagram_url && (
                  <a href={config.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-nv-green transition-colors text-white/50 hover:text-white"
                    aria-label="Instagram">
                    <InstagramIcon size={17} />
                  </a>
                )}
                {config?.linkedin_url && (
                  <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-nv-green transition-colors text-white/50 hover:text-white"
                    aria-label="LinkedIn">
                    <LinkedInIcon size={17} />
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: '#161D19' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
          <p>© {new Date().getFullYear()} Domaine de Fuego · Association loi 1901</p>
          <Link to="/mentions-legales" className="hover:text-white/60 transition-colors">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
