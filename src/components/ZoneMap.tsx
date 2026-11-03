import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { Circle, Map as LeafletMap, Marker, Polyline } from 'leaflet';

// Carte de la zone d'intervention + recherche de commune (API Géo de l'État).
// L'éligibilité se juge à la distance en voiture (itinéraire IGN Géoplateforme)
// depuis le centre d'Osny ou d'Hénonville. Leaflet est chargé à la demande.

type LeafletModule = typeof import('leaflet');

interface Centre { nom: string; lat: number; lng: number }

// Centres des communes, jamais une adresse.
const CENTRES: Centre[] = [
  { nom: 'Osny',       lat: 49.0600, lng: 2.0633 },
  { nom: 'Hénonville', lat: 49.2078, lng: 2.0539 },
];
const RADIUS_KM = 15;
const GREEN = '#4F7F6A';
const AMBER = '#E2A94F';
const GEO_API = 'https://geo.api.gouv.fr/communes';
const FIELDS = 'fields=nom,code,codesPostaux,centre';
const ROUTE_API = 'https://data.geopf.fr/navigation/itineraire';

interface Commune {
  nom: string;
  code: string;
  codesPostaux: string[];
  centre?: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
}

interface Suggestion { id: string; label: string; nom: string; lat: number; lng: number }

interface Route { km: number; centre: Centre; coords: [number, number][] } // coords en [lat, lng]

// route : undefined = calcul en cours, null = itinéraire indisponible
interface Result { nom: string; lat: number; lng: number; route: Route | null | undefined }

type Status = 'idle' | 'empty' | 'error';

interface ItineraireResponse {
  distance?: number;
  geometry?: { type: string; coordinates: [number, number][] };
}

const formatKm = (km: number) => km.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

async function roadRoute(from: Centre, lat: number, lng: number, signal: AbortSignal): Promise<Route> {
  const params = new URLSearchParams({
    resource: 'bdtopo-osrm',
    profile: 'car',
    optimization: 'shortest',
    start: `${from.lng},${from.lat}`,
    end: `${lng},${lat}`,
    distanceUnit: 'kilometer',
    geometryFormat: 'geojson',
    getSteps: 'false',
  });
  const res = await fetch(`${ROUTE_API}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as ItineraireResponse;
  if (typeof data.distance !== 'number') throw new Error('Réponse d\'itinéraire inattendue');
  const coords = (data.geometry?.coordinates ?? []).map(([x, y]): [number, number] => [y, x]);
  return { km: data.distance, centre: from, coords };
}

// Distance en voiture jusqu'au plus proche des deux centres.
async function nearestByRoad(lat: number, lng: number, signal: AbortSignal): Promise<Route> {
  const settled = await Promise.allSettled(CENTRES.map(c => roadRoute(c, lat, lng, signal)));
  const routes = settled.flatMap(s => (s.status === 'fulfilled' ? [s.value] : []));
  if (!routes.length) throw new Error('Itinéraire indisponible');
  return routes.reduce((best, cur) => (cur.km < best.km ? cur : best));
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestCentre(lat: number, lng: number): { centre: Centre; distance: number } {
  return CENTRES
    .map(centre => ({ centre, distance: haversineKm(lat, lng, centre.lat, centre.lng) }))
    .reduce((best, cur) => (cur.distance < best.distance ? cur : best));
}

function toSuggestions(communes: Commune[], codePostal: string | null): Suggestion[] {
  return communes.flatMap((c) => {
    if (!c.centre) return [];
    const cp = codePostal ?? c.codesPostaux.at(0);
    const [lng, lat] = c.centre.coordinates;
    return [{ id: c.code, label: cp ? `${c.nom} (${cp})` : c.nom, nom: c.nom, lat, lng }];
  }).slice(0, 5);
}

export default function ZoneMap({ calendlyUrl, children }: { calendlyUrl: string; children?: ReactNode }) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const listId = `${uid}-list`;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const circlesRef = useRef<Map<string, Circle>>(new Map());
  const markerRef = useRef<Marker | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);
  const skipSearchRef = useRef(false);

  // ── Carte : chargement différé ────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let cancelled = false;

    const init = async () => {
      try {
        const mod = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        if (cancelled || !canvasRef.current) return;
        const L: LeafletModule = mod.default;
        leafletRef.current = L;

        const map = L.map(canvasRef.current, { scrollWheelZoom: false });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // La vue doit exister avant d'ajouter les cercles : emprise calculée sans la carte.
        const bounds = L.latLngBounds([]);
        for (const c of CENTRES) bounds.extend(L.latLng(c.lat, c.lng).toBounds(RADIUS_KM * 2000));
        map.fitBounds(bounds, { padding: [16, 16] });

        for (const c of CENTRES) {
          const circle = L.circle([c.lat, c.lng], {
            radius: RADIUS_KM * 1000, color: GREEN, weight: 2, fillColor: GREEN, fillOpacity: 0.12,
          }).addTo(map);
          circlesRef.current.set(c.nom, circle);
          L.marker([c.lat, c.lng], {
            // iconSize undefined : taille auto, le <span> se centre lui-même en CSS
            icon: L.divIcon({ className: 'zm-label', html: `<span>${c.nom}</span>`, iconSize: undefined }),
            interactive: false,
            keyboard: false,
          }).addTo(map);
        }
        mapRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.warn('Carte indisponible', err);
        if (!cancelled) setMapFailed(true);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        observer.disconnect();
        void init();
      }
    }, { rootMargin: '200px' });
    observer.observe(el);

    const circles = circlesRef.current;
    return () => {
      cancelled = true;
      observer.disconnect();
      routeAbortRef.current?.abort();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      routeLineRef.current = null;
      circles.clear();
    };
  }, []);

  // ── Recherche : anti-rebond 250 ms + annulation de la requête précédente ──
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const q = query.trim();
    const isCodePostal = /^\d{5}$/.test(q);
    if (!isCodePostal && q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const url = isCodePostal
        ? `${GEO_API}?codePostal=${encodeURIComponent(q)}&${FIELDS}&limit=5`
        : `${GEO_API}?nom=${encodeURIComponent(q)}&${FIELDS}&boost=population&limit=5`;
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = toSuggestions((await res.json()) as Commune[], isCodePostal ? q : null);
        setSuggestions(items);
        setActive(items.length ? 0 : -1);
        setOpen(items.length > 0);
        setStatus(items.length ? 'idle' : 'empty');
        if (!items.length) setResult(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn('Recherche de commune indisponible', err);
        setSuggestions([]);
        setOpen(false);
        setResult(null);
        setStatus('error');
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // ── Résultat sur la carte ─────────────────────────────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;
    routeLineRef.current?.remove();
    routeLineRef.current = null;
    if (!result) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const icon = L.divIcon({ className: 'zm-pin', iconSize: [20, 20], iconAnchor: [10, 10] });
    if (markerRef.current) markerRef.current.setLatLng([result.lat, result.lng]);
    else markerRef.current = L.marker([result.lat, result.lng], { icon, keyboard: false }).addTo(map);

    const bounds = L.latLngBounds([[result.lat, result.lng]]);
    if (result.route?.coords.length) {
      routeLineRef.current = L.polyline(result.route.coords, { color: AMBER, weight: 4, opacity: 0.9, interactive: false }).addTo(map);
      bounds.extend(routeLineRef.current.getBounds());
    } else {
      // Itinéraire en cours ou indisponible : on montre le cercle le plus proche.
      const circle = circlesRef.current.get(result.route?.centre.nom ?? nearestCentre(result.lat, result.lng).centre.nom);
      if (circle) bounds.extend(circle.getBounds());
    }
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [result, mapReady]);

  const choose = (s: Suggestion) => {
    skipSearchRef.current = true;
    setQuery(s.label);
    setOpen(false);
    setActive(-1);
    setStatus('idle');
    setResult({ nom: s.nom, lat: s.lat, lng: s.lng, route: undefined });

    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;
    nearestByRoad(s.lat, s.lng, controller.signal)
      .then(route => { if (!controller.signal.aborted) setResult({ nom: s.nom, lat: s.lat, lng: s.lng, route }); })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('Calcul d\'itinéraire indisponible', err);
        setResult({ nom: s.nom, lat: s.lat, lng: s.lng, route: null });
      });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && open && active >= 0 && suggestions.at(active)) {
      e.preventDefault();
      const s = suggestions.at(active);
      if (s) choose(s);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && suggestions.length > 0;
  const cta = (
    <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-main">Demander une visite</a>
  );

  return (
    <>
      <div className="zone-text">
        {children}
        <div className="zm-search">
          <label htmlFor={inputId}>Votre commune ou code postal</label>
          <div className="zm-field">
            <input
              id={inputId}
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              placeholder="Ex. : Cergy ou 95000"
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={listId}
              aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
              value={query}
              onChange={e => { routeAbortRef.current?.abort(); setQuery(e.target.value); setResult(null); }}
              onKeyDown={onKeyDown}
              onFocus={() => { if (suggestions.length) setOpen(true); }}
              onBlur={() => setOpen(false)}
            />
            <ul id={listId} role="listbox" className="zm-list" hidden={!showList}>
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? 'active' : undefined}
                  onMouseDown={e => { e.preventDefault(); choose(s); }}
                  onMouseEnter={() => setActive(i)}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="zm-message" aria-live="polite">
          {result && result.route === undefined && (
            <p className="zm-info">Calcul de la distance en voiture…</p>
          )}
          {result?.route && result.route.km <= RADIUS_KM && (
            <div className="zm-ok">
              <p>✓ <b>{result.nom}</b> est dans notre zone d'intervention&nbsp;: environ <b>{formatKm(result.route.km)} km</b> en voiture depuis {result.route.centre.nom}.</p>
              {cta}
            </div>
          )}
          {result?.route && result.route.km > RADIUS_KM && (
            <div className="zm-out">
              <p><b>{result.nom}</b> est à environ <b>{formatKm(result.route.km)} km</b> en voiture d'{result.route.centre.nom}, au-delà de notre zone de 15&nbsp;km. Contactez-nous&nbsp;: une intervention reste peut-être possible avec un supplément kilométrique.</p>
              {cta}
            </div>
          )}
          {result && result.route === null && (
            <div className="zm-info">
              <p>Le calcul de la distance en voiture est momentanément indisponible. Contactez-nous pour vérifier votre commune.</p>
              {cta}
            </div>
          )}
          {!result && status === 'empty' && (
            <p className="zm-info">Aucune commune trouvée. Vérifiez l'orthographe ou essayez le code postal.</p>
          )}
          {!result && status === 'error' && (
            <p className="zm-info">La recherche est momentanément indisponible. La carte reste consultable.</p>
          )}
        </div>
      </div>

      <div className="zone-map">
        <div ref={canvasRef} className="zm-canvas" role="region" aria-label="Carte de la zone d'intervention : 15 km autour d'Osny et d'Hénonville">
          {mapFailed && <p className="zm-fallback">La carte n'a pas pu être chargée.</p>}
        </div>
        <p className="zm-note">Distances en voiture, depuis le centre des communes. Cercles de 15&nbsp;km indicatifs.</p>
      </div>
    </>
  );
}
