import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Layout from './components/Layout';
import MaintenancePage from './pages/MaintenancePage';
import Accueil from './pages/Accueil';
import Animaux from './pages/Animaux';
import AnimalDetail from './pages/AnimalDetail';
import Adopter from './pages/Adopter';
import FamilleAccueil from './pages/FamilleAccueil';
import FaireUnDon from './pages/FaireUnDon';
import Contact from './pages/Contact';
import Presentation from './pages/Presentation';
import MentionsLegales from './pages/MentionsLegales';
import Blog from './pages/Blog';
import ArticleDetail from './pages/ArticleDetail';
import CustomPage from './pages/CustomPage';
import FormulairePage from './pages/FormulairePage';
import DevenirMembre from './pages/DevenirMembre';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnimaux from './pages/admin/AdminAnimaux';
import AdminPageManager from './pages/admin/AdminPageManager';
import AdminPageEditor from './pages/admin/AdminPageEditor';
import AdminBlog from './pages/admin/AdminBlog';
import AdminArticleEditor from './pages/admin/AdminArticleEditor';
import AdminConfig from './pages/admin/AdminConfig';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminCandidatures from './pages/admin/AdminCandidatures';
import AdminFormulaires from './pages/admin/AdminFormulaires';

// ── Migration localStorage ─────────────────────────────────────────────────
// Incrémenter SCHEMA_V à chaque déploiement qui change les defaults de page.
// Efface toutes les clés page_content_* pour forcer les nouveaux defaults sur
// tous les navigateurs (Samsung, Chrome mobile, etc.).
// NB : animaux / config / articles / candidatures sont préservés.
const SCHEMA_V = '5';
if (typeof localStorage !== 'undefined' && localStorage.getItem('_schema_v') !== SCHEMA_V) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('page_content_'))
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('_schema_v', SCHEMA_V);
}
// ──────────────────────────────────────────────────────────────────────────

function readMaintenance() {
  const stored = localStorage.getItem('site_maintenance');
  if (stored !== null) return stored === 'true';
  return import.meta.env.VITE_MAINTENANCE_MODE === 'true';
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const [isMaintenance, setIsMaintenance] = useState(readMaintenance);
  const [hasPreviewAccess, setHasPreviewAccess] = useState(
    () => localStorage.getItem('preview_access') === 'true',
  );

  useEffect(() => {
    const sync = () => {
      setIsMaintenance(readMaintenance());
      setHasPreviewAccess(localStorage.getItem('preview_access') === 'true');
    };
    // storage fires in OTHER tabs; maintenance_changed fires in the SAME tab
    window.addEventListener('storage', sync);
    window.addEventListener('maintenance_changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('maintenance_changed', sync);
    };
  }, []);

  if (isMaintenance && !hasPreviewAccess && !pathname.startsWith('/admin')) {
    return <MaintenancePage />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route element={<Layout />}>
          <Route path="/"                   element={<Accueil />} />
          <Route path="/presentation"       element={<Presentation />} />
          <Route path="/animaux"            element={<Animaux />} />
          <Route path="/animaux/:id"        element={<AnimalDetail />} />
          <Route path="/adopter"            element={<Adopter />} />
          <Route path="/famille-accueil"    element={<FamilleAccueil />} />
          <Route path="/faire-un-don"       element={<FaireUnDon />} />
          <Route path="/contact"            element={<Contact />} />
          <Route path="/devenir-membre"     element={<DevenirMembre />} />
          <Route path="/mentions-legales"   element={<MentionsLegales />} />
          <Route path="/actualites"         element={<Blog />} />
          <Route path="/actualites/:slug"   element={<ArticleDetail />} />
          <Route path="/blog"               element={<Blog />} />
          <Route path="/blog/:slug"         element={<ArticleDetail />} />
          <Route path="/formulaire/:slug"   element={<FormulairePage />} />
          <Route path="/:slug"              element={<CustomPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin">
          <Route index element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="animaux"       element={<AdminAnimaux />} />
            <Route path="animaux/:action" element={<AdminAnimaux />} />
            <Route path="pages"         element={<AdminPageManager />} />
            <Route path="pages/edit/:id" element={<AdminPageEditor />} />
            <Route path="blog"          element={<AdminBlog />} />
            <Route path="blog/edit/:id" element={<AdminArticleEditor />} />
            <Route path="config"        element={<AdminConfig />} />
            <Route path="users"         element={<AdminUsers />} />
            <Route path="roles"         element={<AdminRoles />} />
            <Route path="candidatures"  element={<AdminCandidatures />} />
            <Route path="formulaires"   element={<AdminFormulaires />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
