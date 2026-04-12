import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPwd: string | undefined = import.meta.env.VITE_ADMIN_PASSWORD;
    const expected = adminPwd && adminPwd !== 'undefined' ? adminPwd : 'admin';
    if (password === expected) {
      sessionStorage.setItem('admin_auth', '1');
      navigate('/admin/animaux');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center" size={40} />
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Administration</h1>
          <p className="text-gray-500 text-sm">Accès réservé aux membres de l'association</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <Lock size={14} className="text-gray-400" /> Mot de passe
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className="form-input pr-12"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder="••••••••"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} />
              Mot de passe incorrect
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center">
            Se connecter
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Mot de passe par défaut : <code className="bg-gray-100 px-1 rounded">admin</code> — ou définissez <code className="bg-gray-100 px-1 rounded">VITE_ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
