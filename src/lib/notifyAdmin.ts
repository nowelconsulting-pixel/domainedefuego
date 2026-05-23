import emailjs from '@emailjs/browser';

export async function notifyAdmin(
  templateId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID as string,
    templateId,
    data,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string,
  );
}
