import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './garde-a-domicile.css';

// Landing commerciale autonome (hors Layout) : header et footer propres.
const CALENDLY_URL = 'https://calendly.com/domainedefuego/30min';

const PAGE_TITLE = 'Visites à domicile pour chats & NAC — Domaine de Fuego';
const PAGE_DESCRIPTION =
  "Votre animal reste chez lui, nous venons prendre soin de lui. Visites à domicile pour chats et NAC dans un rayon de 15 km autour d'Osny ou d'Hénonville.";

// ── Pictogrammes ───────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  );
}

function Check({ width = '2.6' }: { width?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
  );
}

function Pin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
  );
}

function Icon({ children, width = '2' }: { children: ReactNode; width?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  );
}

const HOME = <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />;
const HEART = <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />;
const CAMERA = (
  <>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
    <circle cx="12" cy="13" r="3" />
  </>
);
const PAW = (
  <>
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.8 1.2 2 2 0 0 0-1.6-1.4A3 3 0 0 1 6 12.5 3 3 0 0 1 9 10z" />
  </>
);
const CAT = (
  <>
    <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z" />
    <path d="M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17z" />
  </>
);

// ── Briques ────────────────────────────────────────────────────────────────
function Cta({ children, className = 'btn btn-main', arrow = true }: { children: ReactNode; className?: string; arrow?: boolean }) {
  return (
    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className={className}>
      {children}{arrow && <> <Arrow /></>}
    </a>
  );
}

function Item({ children }: { children: ReactNode }) {
  return <li><Check />{children}</li>;
}

function Faq({ q, open = false, children }: { q: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open}>
      <summary>{q}<Chevron /></summary>
      <div className="a">{children}</div>
    </details>
  );
}

interface PriceCardProps {
  who: string;
  icon: ReactNode;
  dur: string;
  durClass?: string;
  day: number;
  weekend: number;
  week: number;
}

function PriceCard({ who, icon, dur, durClass = 'dur', day, weekend, week }: PriceCardProps) {
  return (
    <article className="pc">
      <div className="who"><i><Icon>{icon}</Icon></i>{who}</div>
      <span className={durClass}>{dur}</span>
      <div className="main-price"><strong>{day}</strong><span>€</span></div>
      <div className="per">la journée · 1 visite par jour</div>
      <dl>
        <div><dt>Week-end<small>samedi, dimanche / jour férié</small></dt><dd>{weekend} €</dd></div>
        <div><dt>Tarif semaine</dt><dd>{week} €</dd></div>
      </dl>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function GardeADomicile() {
  const heroRef = useRef<HTMLElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const [showBar, setShowBar] = useState(false);

  // SEO : titre, description, noindex — restaurés en quittant la page.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const createdDesc = !desc;
    if (!desc) {
      desc = document.createElement('meta');
      desc.name = 'description';
      document.head.appendChild(desc);
    }
    const prevDesc = desc.content;
    desc.content = PAGE_DESCRIPTION;

    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);

    return () => {
      document.title = prevTitle;
      if (createdDesc) desc.remove();
      else desc.content = prevDesc;
      robots.remove();
    };
  }, []);

  // Barre CTA mobile : visible quand ni le hero ni le CTA final ne sont à l'écran.
  useEffect(() => {
    const hero = heroRef.current;
    const final = finalRef.current;
    if (!hero || !final) return;
    const visible = new Map<Element, boolean>();
    visible.set(hero, true);
    visible.set(final, false);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      setShowBar(!visible.get(hero) && !visible.get(final));
    });
    observer.observe(hero);
    observer.observe(final);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="gad">
      <header>
        <div className="wrap">
          <a href="#top" className="brand"><img src="/logo_transparent.png" alt="Domaine de Fuego" /><span className="brand-tag">Visites à domicile</span></a>
          <Cta arrow={false}>Demander une visite</Cta>
        </div>
      </header>

      <main id="top">

        {/* ═══ 1. HERO ═══ */}
        <section className="hero" ref={heroRef}>
          <div className="wrap hero-grid">
            <div>
              <div className="pill"><i><Icon width="2.4">{HOME}</Icon></i>Visites à domicile pour chats &amp; NAC</div>
              <h1 className="h1">Votre animal reste <span className="hl">chez lui.</span><span className="soft">Nous venons prendre soin de lui.</span></h1>
              <p className="lead">Vacances, week-end, déplacement&nbsp;: pendant votre absence, il garde son environnement, ses repères et ses habitudes. Vous partez l'esprit tranquille.</p>
              <div className="zone"><i><Pin /></i>À 15 km autour d'Osny ou d'Hénonville</div>
              <div className="hero-cta">
                <Cta>Demander une visite</Cta>
                <a href="#tarifs" className="link">Voir les tarifs <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg></a>
              </div>
              <div className="anchor">À partir de <strong>15&nbsp;€</strong> la journée (une visite)</div>
            </div>
            <div className="hero-art">
              <div className="art">
                <svg viewBox="0 0 420 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration : un chat assis devant sa fenêtre, chez lui">
                  <rect width="420" height="440" fill="#E8F2EE" />
                  <rect x="0" y="330" width="420" height="110" fill="#DCEAE4" />
                  <path d="M80 300V150a130 130 0 0 1 260 0v150z" fill="#CFE3DC" />
                  <circle cx="276" cy="122" r="26" fill="#E2A94F" opacity=".9" />
                  <path d="M96 268c40-28 80-30 118-14s70 18 110-6v52H96z" fill="#B9D4CA" />
                  <path d="M80 300V150a130 130 0 0 1 260 0v150" fill="none" stroke="#FAFAF7" strokeWidth="14" />
                  <path d="M210 26v274M80 178h260" stroke="#FAFAF7" strokeWidth="10" />
                  <rect x="52" y="296" width="316" height="22" rx="11" fill="#C8A96A" />
                  <g fill="#2D3A35">
                    <ellipse cx="190" cy="252" rx="56" ry="48" />
                    <circle cx="190" cy="186" r="36" />
                    <path d="M160 170l4-40 28 26zM220 170l-4-40-28 26z" />
                  </g>
                  <path d="M238 284c40 8 64-12 54-44" fill="none" stroke="#2D3A35" strokeWidth="15" strokeLinecap="round" />
                  <g>
                    <path d="M300 296l8-46h40l8 46z" fill="#6B4F3A" />
                    <ellipse cx="318" cy="226" rx="12" ry="28" fill="#4F7F6A" transform="rotate(-22 318 226)" />
                    <ellipse cx="338" cy="222" rx="12" ry="30" fill="#5A8E78" transform="rotate(18 338 222)" />
                    <ellipse cx="328" cy="210" rx="10" ry="30" fill="#4F7F6A" />
                  </g>
                  <g fill="#4F7F6A" opacity=".25">
                    <circle cx="70" cy="372" r="7" /><circle cx="84" cy="362" r="5" /><circle cx="96" cy="370" r="5" /><circle cx="90" cy="384" r="5" />
                    <circle cx="140" cy="398" r="7" /><circle cx="154" cy="388" r="5" /><circle cx="166" cy="396" r="5" /><circle cx="160" cy="410" r="5" />
                  </g>
                </svg>
              </div>
              <div className="bubble">
                <div className="top"><span className="ok"><Check width="3" /></span><div><small>Exemple de nouvelles</small><b>Visite terminée</b></div></div>
                <p>Gamelle remplie, eau changée, litière propre. Il est venu chercher ses caresses avant de retourner à sa sieste.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 2. POURQUOI À DOMICILE ═══ */}
        <section className="why">
          <div className="wrap why-grid">
            <div>
              <p className="eyebrow">Pourquoi la visite à domicile</p>
              <p className="big-quote">Chez lui, il connaît chaque recoin. <span>Pourquoi lui faire quitter ses repères&nbsp;?</span></p>
              <p className="lead">Un chat est attaché à son territoire, et beaucoup de petits animaux supportent mal d'être déplacés. Avec la visite à domicile, c'est nous qui nous déplaçons&nbsp;: lui ne change rien à sa vie.</p>
              <div className="situ"><span>Vacances</span><span>Week-end</span><span>Déplacement professionnel</span><span>Quelques jours d'absence</span><span>Indisponibilité ponctuelle</span></div>
            </div>
            <div className="keeps">
              <div className="keep"><i><Icon>{HOME}</Icon></i><h3>Il garde son environnement</h3><p>Son panier, ses odeurs, ses cachettes&nbsp;: tout reste à sa place.</p></div>
              <div className="keep"><i><Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon></i><h3>Il garde ses habitudes</h3><p>Ses repas, ses moments de jeu, son rythme&nbsp;: on suit vos consignes.</p></div>
              <div className="keep"><i><Icon>{HEART}</Icon></i><h3>Il n'est pas seul</h3><p>Une présence, des interactions, et un œil attentif sur son état.</p></div>
              <div className="keep you"><i><Icon>{CAMERA}</Icon></i><h3>Et vous, vous avez des nouvelles</h3><p>Après chaque passage, avec des photos quand c'est possible.</p></div>
            </div>
          </div>
        </section>

        {/* ═══ 3. CE QUE NOUS FAISONS ═══ */}
        <section className="visit">
          <div className="wrap">
            <div className="visit-head">
              <div><p className="eyebrow">Pendant chaque visite</p><h2 className="h2">Tout ce dont il a besoin,<br />comme si vous étiez là.</h2></div>
              <p className="lead">Chaque visite suit les consignes et les habitudes que vous nous avez transmises.</p>
            </div>
            <div className="sheet">
              <div className="col">
                <div className="ic"><Icon><path d="M12 2.7S6 9 6 14a6 6 0 0 0 12 0c0-5-6-11.3-6-11.3z" /></Icon></div>
                <h3>Alimentation &amp; eau</h3>
                <ul>
                  <Item>Repas servis selon vos consignes</Item>
                  <Item>Eau fraîche renouvelée</Item>
                  <Item>Ses habitudes alimentaires respectées</Item>
                </ul>
              </div>
              <div className="col">
                <div className="ic"><Icon><path d="m12 3-1.9 5.8L4 10l4.6 3.6L7.2 20 12 16.8 16.8 20l-1.4-6.4L20 10l-6.1-1.2z" /></Icon></div>
                <h3>Hygiène &amp; environnement</h3>
                <ul>
                  <Item>Litière nettoyée</Item>
                  <Item>Espaces de vie nettoyés si nécessaire</Item>
                  <Item>Entretien courant de son environnement</Item>
                </ul>
              </div>
              <div className="col">
                <div className="ic"><Icon>{HEART}</Icon></div>
                <h3>Bien-être &amp; présence</h3>
                <ul>
                  <Item>Du temps de présence</Item>
                  <Item>Jeux et interactions selon ses habitudes</Item>
                  <Item>Caresses et compagnie, s'il les apprécie</Item>
                  <Item>Attention portée à son comportement et à son état général</Item>
                </ul>
              </div>
              <div className="col news">
                <div className="ic"><Icon>{CAMERA}</Icon></div>
                <h3>Vos nouvelles</h3>
                <ul>
                  <Item>Des nouvelles après chaque passage</Item>
                  <Item>Des photos lorsque c'est possible</Item>
                </ul>
              </div>
            </div>
            <div className="nac-note"><i><Icon>{PAW}</Icon></i><p><b>Pour les NAC&nbsp;:</b> soins courants adaptés à l'espèce et à ses besoins.</p></div>
          </div>
        </section>

        {/* ═══ 4. POUR QUELS ANIMAUX ═══ */}
        <section className="animals">
          <div className="wrap an-grid">
            <div>
              <p className="eyebrow">Pour qui</p>
              <h2 className="h2">Chats et NAC&nbsp;: chacun ses besoins.</h2>
              <p className="lead">Le service s'adresse avant tout aux chats et aux petits animaux de compagnie, ceux qui sont bien mieux chez eux qu'ailleurs.</p>
            </div>
            <div>
              <div className="tags">
                <span className="main">Chats <em>1 ou plusieurs</em></span>
                <span>Lapins</span><span>Cochons d'Inde</span><span>Hamsters</span><span>Rats</span><span>Oiseaux</span><span>Certains reptiles</span>
                <span className="other">Autres petits animaux selon les besoins</span>
              </div>
              <p className="study"><Icon width="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></Icon><span><b>NAC&nbsp;: chaque demande est étudiée individuellement</b> avant la prise en charge, pour être sûr de bien répondre à ses besoins.</span></p>
            </div>
          </div>
        </section>

        {/* ═══ 5. COMMENT ÇA MARCHE ═══ */}
        <section className="how" id="comment">
          <div className="wrap">
            <div className="how-head">
              <div><p className="eyebrow amber">Comment ça marche</p><h2 className="h2">De votre demande à votre départ.</h2></div>
              <p>Tout commence par un échange de 15 minutes pour faire le point sur votre animal et vos dates.</p>
            </div>
            <ol className="steps">
              <li className="step"><div className="dot">1</div><div><h3>Vous nous contactez</h3><p>Un échange de 15 minutes&nbsp;: vos dates d'absence, votre commune, le nombre d'animaux, leurs besoins.</p></div></li>
              <li className="step"><div className="dot">2</div><div><h3>Nous faisons connaissance</h3><p>Avant la première prestation, une rencontre peut être organisée chez vous pour découvrir votre animal et noter vos consignes.</p></div></li>
              <li className="step"><div className="dot">3</div><div><h3>Nous organisons les visites</h3><p>Dates, fréquence, consignes, soins éventuels et accès au domicile&nbsp;: tout est défini ensemble.</p></div></li>
              <li className="step"><div className="dot">4</div><div><h3>Nous prenons soin de lui</h3><p>Chaque visite suit ses habitudes et vos consignes. Vous recevez des nouvelles après chaque passage.</p></div></li>
              <li className="step"><div className="dot">5</div><div><h3>Vous partez sereinement</h3><p>Il reste chez lui pendant toute votre absence.</p></div></li>
            </ol>
            <div className="how-cta">
              <Cta>Demander une visite</Cta>
              <span>Première étape&nbsp;: un échange de 15 minutes.</span>
            </div>
          </div>
        </section>

        {/* ═══ 6. TARIFS ═══ */}
        <section className="prices" id="tarifs">
          <div className="wrap">
            <div className="prices-head">
              <p className="eyebrow">Tarifs</p>
              <h2 className="h2">Des tarifs clairs, selon votre animal.</h2>
              <p className="lead">Une visite par jour&nbsp;: tarifs à la journée, le week-end et à la semaine.</p>
            </div>
            <div className="zone-chip"><span><Pin />Zone&nbsp;: 15 km autour d'Osny ou d'Hénonville</span></div>

            <div className="cards">
              <PriceCard who="1 chat" icon={CAT} dur="Visite de 30 min" day={18} weekend={35} week={120} />
              <PriceCard who="1 chat" icon={CAT} dur="Visite d'1 h" day={23} weekend={45} week={160} />
              <PriceCard who="2 chats et +" icon={CAT} dur="Visite d'1 h" day={28} weekend={55} week={190} />
              <PriceCard who="NAC" icon={PAW} dur="Étude au cas par cas" durClass="dur nac" day={15} weekend={30} week={105} />
            </div>

            <div className="prices-cta">
              <Cta>Demander une visite</Cta>
              <p>Le tarif adapté à votre situation est confirmé lors de notre échange.</p>
            </div>

            <div className="extras">
              <div><h3>Services complémentaires &amp; frais</h3><p>À ajouter selon vos besoins.</p></div>
              <div className="ex-list">
                <div><span>Relevé du courrier</span><b>10 €</b></div>
                <div><span>Arrosage des plantes</span><b>10 €</b></div>
                <div><span>Nettoyage / sortie des poubelles</span><b>30 €</b></div>
                <div><span>Soins sur ordonnance vétérinaire</span><b>2 € / jour</b></div>
                <div><span>Kilomètre supplémentaire</span><b>0,90 €</b></div>
                <div><span>Demande de dernière minute</span><b className="soft">Supplément possible</b></div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 7. RÉASSURANCE ═══ */}
        <section className="trust">
          <div className="wrap trust-grid">
            <div className="trust-side">
              <p className="eyebrow">Pendant votre absence</p>
              <h2 className="h2">Vous savez qui vient, ce qui est fait, et comment il va.</h2>
              <p className="lead">Confier ses clés et son animal demande de la confiance. Chaque garde est préparée avec vous, puis suivie visite après visite.</p>
              <div className="sign"><img src="/logo_transparent.png" alt="Domaine de Fuego" /><span>Un service de visites à domicile proposé par Domaine de Fuego.</span></div>
            </div>
            <div>
              <div className="row"><i><Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" /></Icon></i><h3>On fait connaissance avant de commencer</h3><p>Un premier échange, puis une rencontre chez vous si besoin, pour découvrir votre animal dans son environnement.</p></div>
              <div className="row"><i><Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></Icon></i><h3>Vos consignes, suivies à la lettre</h3><p>Repas, habitudes, soins éventuels&nbsp;: chaque visite se déroule comme vous l'avez demandé.</p></div>
              <div className="row"><i><Icon><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon></i><h3>Un œil attentif à chaque passage</h3><p>Son comportement et son état général sont observés à chaque visite.</p></div>
              <div className="row"><i><Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon></i><h3>Des nouvelles après chaque visite</h3><p>Vous savez comment il va, avec des photos lorsque c'est possible.</p></div>
              <div className="row"><i><Icon><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></Icon></i><h3>L'accès à votre domicile, défini ensemble</h3><p>Les modalités d'accès sont convenues avec vous lors de l'organisation des visites.</p></div>
            </div>
          </div>
        </section>

        {/* ═══ 8. FAQ ═══ */}
        <section className="faq" id="faq">
          <div className="wrap faq-grid">
            <div className="faq-side">
              <p className="eyebrow">Questions fréquentes</p>
              <h2 className="h2">Avant de demander une visite.</h2>
              <p className="lead">Les réponses aux questions que vous vous posez sûrement.</p>
              <div className="ask"><b>Votre question n'est pas là&nbsp;?</b><p>Posez-la lors de l'échange de 15 minutes.</p><Cta className="btn btn-line" arrow={false}>Demander une visite</Cta></div>
            </div>
            <div>
              <Faq open q={'Quels animaux pouvez-vous garder à domicile ?'}>Principalement les chats et les NAC&nbsp;: lapins, cochons d'Inde, hamsters, rats, oiseaux, certains reptiles et d'autres petits animaux de compagnie selon leurs besoins. Pour les NAC, chaque demande est étudiée individuellement avant la prise en charge.</Faq>
              <Faq q={'Dans quelle zone intervenez-vous ?'}>Dans un rayon de 15 km autour d'Osny ou d'Hénonville.</Faq>
              <Faq q={'Comment se passe une première demande ?'}>Tout commence par un échange de 15 minutes&nbsp;: vos dates d'absence, votre commune, le nombre d'animaux et leurs besoins. Avant la première prestation, une rencontre peut ensuite être organisée chez vous pour découvrir votre animal, son environnement et recueillir vos consignes.</Faq>
              <Faq q={'Combien de temps dure une visite ?'}>Pour un chat, vous avez le choix entre une visite de 30 minutes et une visite d'1 heure. À partir de 2 chats, la visite dure 1 heure. Pour les NAC, la visite est définie lors de l'étude de votre demande.</Faq>
              <Faq q={'Puis-je demander plusieurs visites par jour ?'}>Les tarifs affichés correspondent à une visite par jour. La fréquence des visites est définie avec vous lors de l'organisation&nbsp;: parlez-nous de votre besoin dès le premier échange.</Faq>
              <Faq q="Mon animal a des besoins particuliers ou un traitement.">Signalez-le dès le premier échange&nbsp;: ses besoins et vos consignes sont pris en compte dans l'organisation des visites. Les soins sur ordonnance vétérinaire sont facturés 2&nbsp;€ par jour.</Faq>
              <Faq q={'Est-ce que je reçois des nouvelles ?'}>Oui, après chaque passage, avec des photos lorsque c'est possible.</Faq>
              <Faq q={'Comment fonctionne le tarif week-end ?'}>Le tarif week-end s'applique au samedi, au dimanche et aux jours fériés. Par exemple, 35&nbsp;€ pour un chat avec une visite de 30 minutes. Le détail est confirmé lors de notre échange.</Faq>
              <Faq q={'Et si je fais ma demande à la dernière minute ?'}>Contactez-nous quand même&nbsp;: un supplément peut s'appliquer aux demandes de dernière minute.</Faq>
              <Faq q={'Pouvez-vous aussi relever le courrier ou arroser les plantes ?'}>Oui, en complément des visites&nbsp;: relevé du courrier 10&nbsp;€, arrosage des plantes 10&nbsp;€, nettoyage ou sortie des poubelles 30&nbsp;€.</Faq>
              <Faq q={'Comment réserver ?'}>Cliquez sur «&nbsp;Demander une visite&nbsp;» pour prendre rendez-vous pour un échange de 15 minutes. Nous organisons ensuite les visites avec vous.</Faq>
            </div>
          </div>
        </section>

        {/* ═══ 9. CTA FINAL ═══ */}
        <section className="final" id="reserver" ref={finalRef}>
          <div className="wrap">
            <div className="final-box">
              <p className="eyebrow amber">Demande de visite</p>
              <h2 className="h2">Partez tranquille.<br />Il reste chez lui.</h2>
              <p>Réservez un échange de 15 minutes&nbsp;: on fait le point sur votre animal, vos dates et vos consignes.</p>
              <div className="final-actions">
                <Cta>Demander une visite</Cta>
                <a href="#tarifs" className="btn btn-ghost-light">Revoir les tarifs</a>
              </div>
              <div className="final-meta">
                <span><Check width="3" />Chats &amp; NAC</span>
                <span><Check width="3" />15 km autour d'Osny ou d'Hénonville</span>
                <span><Check width="3" />Dès 15 € la journée</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer>
        <div className="wrap foot">
          <div><img src="/logo_transparent.png" alt="Domaine de Fuego" /><p style={{ marginTop: 14 }}>Visites à domicile pour chats et NAC, dans un rayon de 15&nbsp;km autour d'Osny ou d'Hénonville.</p></div>
          <div>
            <h5>Le service</h5>
            <ul>
              <li>Lorem ipsum dolor sit amet</li>
              <li>Lorem ipsum · SIREN lorem ipsum</li>
              <li>Contact&nbsp;: <a href="mailto:contact@domainedefuego.fr">contact@domainedefuego.fr</a></li>
            </ul>
          </div>
          <div>
            <h5>Informations</h5>
            <ul>
              <li><Link to="/mentions-legales">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom"><div className="wrap"><span>© {new Date().getFullYear()} Domaine de Fuego · Visites à domicile</span></div></div>
      </footer>

      <div className={`sticky${showBar ? ' show' : ''}`}>
        <div className="p">À partir de<b>15 € / jour</b></div>
        <Cta arrow={false}>Demander une visite</Cta>
      </div>
    </div>
  );
}
