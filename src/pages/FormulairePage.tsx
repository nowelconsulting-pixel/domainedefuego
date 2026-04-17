import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import type { CustomForm, FieldType } from './admin/AdminFormulaires';
import { loadCustomForms } from './admin/AdminFormulaires';

export default function FormulairePage() {
  const { slug } = useParams<{ slug: string }>();
  const form: CustomForm | undefined = loadCustomForms().find(f => f.slug === slug);

  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!form) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-forest mb-3">Formulaire introuvable</h1>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  if (!form.active) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="bg-surface p-12 rounded-2xl border-2 border-site-border text-center max-w-md">
          <p className="text-lg font-semibold text-forest mb-2">Formulaire temporairement indisponible</p>
          <p className="text-muted text-sm">Revenez bientôt.</p>
        </div>
      </div>
    );
  }

  const setValue = (id: string, v: string | boolean) => {
    setValues(p => ({ ...p, [id]: v }));
    setErrors(p => { const n = { ...p }; delete n[id]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const field of form.fields) {
      if (field.required) {
        const v = values[field.id];
        if (v === undefined || v === '' || v === false) errs[field.id] = 'Champ obligatoire';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);

    try {
      const firstText  = form.fields.find(f => f.type === 'text');
      const firstEmail = form.fields.find(f => f.type === 'email');
      const candidature = {
        id: `custom_${form.id}_${Date.now()}`,
        type: `custom_${form.slug}`,
        form_title: form.title,
        status: 'nouvelle',
        nom:   firstText  ? String(values[firstText.id]  ?? 'Anonyme') : 'Anonyme',
        email: firstEmail ? String(values[firstEmail.id] ?? '')        : '',
        data:  Object.fromEntries(form.fields.map(f => [f.label, values[f.id] ?? ''])),
        notes: '', createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('candidatures') || '[]');
      localStorage.setItem('candidatures', JSON.stringify([candidature, ...existing]));
      const unread = parseInt(localStorage.getItem('candidatures_unread') || '0');
      localStorage.setItem('candidatures_unread', String(unread + 1));
    } catch { /* ignore */ }

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT,
        { form_title: form.title, ...values },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
    } catch { /* email failed but submission already saved */ }

    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="bg-surface p-12 rounded-2xl border-2 border-site-border text-center max-w-md">
          <CheckCircle2 size={48} className="text-nv-green mx-auto mb-4" />
          <h2 className="text-xl font-bold text-forest mb-2">Envoyé !</h2>
          <p className="text-muted">{form.success_message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-surface border-b-2 border-site-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-forest">{form.title}</h1>
          {form.intro && <p className="text-muted mt-2 leading-relaxed">{form.intro}</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={submit} noValidate className="bg-surface rounded-2xl p-8 border-2 border-site-border space-y-5">
          {form.fields.map(field => (
            <div key={field.id}>
              {field.type !== 'checkbox' && (
                <label className="form-label">
                  {field.label}{field.required ? ' *' : ''}
                </label>
              )}
              {renderField(field, values, setValue)}
              {errors[field.id] && <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>}
            </div>
          ))}
          <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
            {sending ? 'Envoi en cours…' : <><Send size={18} />Envoyer</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export function CustomFormEmbed({ slug }: { slug: string }) {
  const form = loadCustomForms().find(f => f.slug === slug);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!form || !form.active) {
    return <p className="text-sm text-muted italic">Formulaire indisponible.</p>;
  }

  const setValue = (id: string, v: string | boolean) => {
    setValues(p => ({ ...p, [id]: v }));
    setErrors(p => { const n = { ...p }; delete n[id]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const field of form.fields) {
      if (field.required) {
        const v = values[field.id];
        if (v === undefined || v === '' || v === false) errs[field.id] = 'Champ obligatoire';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const firstText  = form.fields.find(f => f.type === 'text');
      const firstEmail = form.fields.find(f => f.type === 'email');
      const candidature = {
        id: `custom_${form.id}_${Date.now()}`,
        type: `custom_${form.slug}`,
        form_title: form.title,
        status: 'nouvelle',
        nom:   firstText  ? String(values[firstText.id]  ?? 'Anonyme') : 'Anonyme',
        email: firstEmail ? String(values[firstEmail.id] ?? '')        : '',
        data:  Object.fromEntries(form.fields.map(f => [f.label, values[f.id] ?? ''])),
        notes: '', createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('candidatures') || '[]');
      localStorage.setItem('candidatures', JSON.stringify([candidature, ...existing]));
      const unread = parseInt(localStorage.getItem('candidatures_unread') || '0');
      localStorage.setItem('candidatures_unread', String(unread + 1));
    } catch { /**/ }
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT,
        { form_title: form.title, ...values },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
    } catch { /**/ }
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={40} className="text-nv-green mx-auto mb-3" />
        <p className="text-forest font-semibold">{form.success_message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {form.fields.map(field => (
        <div key={field.id}>
          {field.type !== 'checkbox' && (
            <label className="form-label">{field.label}{field.required ? ' *' : ''}</label>
          )}
          {renderField(field, values, setValue)}
          {errors[field.id] && <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>}
        </div>
      ))}
      <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
        {sending ? 'Envoi en cours…' : <><Send size={18} />Envoyer</>}
      </button>
    </form>
  );
}

function renderField(
  field: { id: string; type: FieldType; placeholder: string; options: string[]; label: string; required: boolean },
  values: Record<string, string | boolean>,
  setValue: (id: string, v: string | boolean) => void,
) {
  const base = `form-input`;
  const v = values[field.id];

  switch (field.type) {
    case 'textarea':
      return (
        <textarea className={base} rows={4}
          value={(v as string) || ''} onChange={e => setValue(field.id, e.target.value)}
          placeholder={field.placeholder} />
      );
    case 'select':
      return (
        <select className={base} value={(v as string) || ''} onChange={e => setValue(field.id, e.target.value)}>
          <option value="">Choisir…</option>
          {field.options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
      );
    case 'checkbox':
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-coral-500 mt-0.5"
            checked={(v as boolean) || false} onChange={e => setValue(field.id, e.target.checked)} />
          <span className="text-sm text-muted">
            {field.placeholder || field.label}{field.required ? ' *' : ''}
          </span>
        </label>
      );
    default:
      return (
        <input type={field.type} className={base}
          value={(v as string) || ''} onChange={e => setValue(field.id, e.target.value)}
          placeholder={field.placeholder} />
      );
  }
}
