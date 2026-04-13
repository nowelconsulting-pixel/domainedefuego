import React from 'react';
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
import CustomPage from './pages/CustomPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnimaux from './pages/admin/AdminAnimaux';
import AdminPageManager from './pages/admin/AdminPageManager';
import AdminPageEditor from './pages/admin/AdminPageEditor';
import AdminConfig from './pages/admin/AdminConfig';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminCandidatures from './pages/admin/AdminCandidatures';

const MAINTENANCE = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (MAINTENANCE && !location.pathname.startsWith('/admin')) {
    return <MaintenancePage />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <MaintenanceGate>
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
          <Route path="/mentions-legales"   element={<MentionsLegales />} />
          {/* Custom pages (created via admin) */}
          <Route path="/:slug"              element={<CustomPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard"                element={<AdminDashboard />} />
          <Route path="animaux"                  element={<AdminAnimaux />} />
          <Route path="animaux/:action"          element={<AdminAnimaux />} />
          <Route path="pages"                    element={<AdminPageManager />} />
          <Route path="pages/edit/:id"           element={<AdminPageEditor />} />
          <Route path="config"                   element={<AdminConfig />} />
          <Route path="users"                    element={<AdminUsers />} />
          <Route path="roles"                    element={<AdminRoles />} />
          <Route path="candidatures"             element={<AdminCandidatures />} />
        </Route>
      </Routes>
      </MaintenanceGate>
    </BrowserRouter>
  );
}

export default App;
