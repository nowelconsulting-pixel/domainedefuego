import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../../components/Logo';
import { authenticate, initDefaultUsers, setSession, getSession } from '../../utils/auth';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initDefaultUsers();
    if (getSession()) navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const user = await authenticate(email, password);
    setLoading(false);
    if (!user) {
      setError('Email ou mot de passe incorrect.');
      setPassword('');
      return;
    }
    setSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Administration</h1>
          <p className="text-gray-500 text-sm">Accès réservé aux membres de l'association</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <Mail size={14} className="text-gray-400" /> Adresse email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="votre@email.fr"
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Lock size={14} className="text-gray-400" /> Mot de passe
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className="form-input pr-12"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
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
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

      </div>
    </div>
  );
}
