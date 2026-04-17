import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true'
  || localStorage.getItem('site_maintenance') === 'true';
const isPreview = isMaintenance && localStorage.getItem('preview_access') === 'true';

function PreviewBanner() {
  const quit = () => {
    localStorage.removeItem('preview_access');
    window.location.reload();
  };
  return (
    <div className="bg-amber-500 text-amber-900 text-xs text-center py-1.5 px-4 flex items-center justify-center gap-3">
      <span>Mode aperçu — le site est en maintenance pour les visiteurs</span>
      <button onClick={quit} className="underline font-semibold hover:text-amber-950">
        Quitter l'aperçu
      </button>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {isPreview && <PreviewBanner />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
