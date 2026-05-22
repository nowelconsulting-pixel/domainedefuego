import emailjs from '@emailjs/browser';

const ADMIN_EMAIL = 'domainedefuego@gmail.com';

interface AdminNotifParams {
  form_type: string;
  from_name: string;
  from_email: string;
  telephone?: string;
  details: string;
}

export async function notifyAdmin(params: AdminNotifParams): Promise<void> {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) return;

  await emailjs.send(
    serviceId,
    templateId,
    {
      to_email:   ADMIN_EMAIL,
      form_type:  params.form_type,
      from_name:  params.from_name,
      from_email: params.from_email,
      telephone:  params.telephone ?? '',
      details:    params.details,
      date:       new Date().toLocaleString('fr-FR'),
    },
    publicKey,
  );
}
