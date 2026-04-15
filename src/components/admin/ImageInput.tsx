import { useRef } from 'react';
import { compressImage, resolveImageUrl } from '../../utils/image';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageInput({ value, onChange, label, placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image.');
      return;
    }
    try {
      const b64 = await compressImage(file);
      const key = `uploaded_img_${Date.now()}`;
      localStorage.setItem(key, b64);
      onChange(`local:${key}`);
    } catch {
      alert("Impossible de charger l'image. Vérifiez que le fichier est bien une image.");
    }
  };

  const preview = value ? resolveImageUrl(value) : '';

  return (
    <div className="space-y-2">
      {label && <label className="form-label">{label}</label>}
      <div className="flex gap-2">
        <input
          className="form-input flex-1"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://... ou cliquez sur Parcourir'}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg border border-gray-300"
        >
          📁 Parcourir
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
      </div>
      {preview && (
        <img src={preview} alt="" className="max-h-40 rounded-lg object-cover border border-gray-200" />
      )}
    </div>
  );
}
