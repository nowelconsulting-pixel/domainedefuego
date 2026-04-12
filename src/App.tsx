import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import Animaux from './pages/Animaux';
import AnimalDetail from './pages/AnimalDetail';
import Adopter from './pages/Adopter';
import FamilleAccueil from './pages/FamilleAccueil';
import FaireUnDon from './pages/FaireUnDon';
import Contact from './pages/Contact';
import Presentation from './pages/Presentation';
import MentionsLegales from './pages/MentionsLegales';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAnimaux from './pages/admin/AdminAnimaux';
import AdminPages from './pages/admin/AdminPages';
import AdminConfig from './pages/admin/AdminConfig';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/animaux" element={<Animaux />} />
          <Route path="/animaux/:id" element={<AnimalDetail />} />
          <Route path="/adopter" element={<Adopter />} />
          <Route path="/famille-accueil" element={<FamilleAccueil />} />
          <Route path="/faire-un-don" element={<FaireUnDon />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
        </Route>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="animaux" element={<AdminAnimaux />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="config" element={<AdminConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
