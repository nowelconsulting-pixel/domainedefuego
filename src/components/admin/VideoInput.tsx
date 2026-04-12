import { useRef } from 'react';
import { X, Film, Upload, PlayCircle } from 'lucide-react';
import { detectVideoType, getYoutubeThumbnail } from '../../utils/image';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function VideoInput({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const type = detectVideoType(value);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('La vidéo dépasse 50Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => onChange(evt.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          className="form-input flex-1"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="URL YouTube, Instagram ou laissez vide pour upload direct"
        />
        {value && (
          <button onClick={() => onChange('')} className="p-2 text-gray-400 hover:text-red-500 flex-shrink-0">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Upload option */}
      <div className="flex items-center gap-3">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-gray-400">ou</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Upload size={16} />
        Uploader une vidéo MP4 (max 50Mo)
      </button>
      <input ref={fileRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleFile} />

      {/* Preview */}
      {type === 'youtube' && (
        <div className="rounded-xl overflow-hidden bg-gray-900 relative">
          {getYoutubeThumbnail(value) && (
            <div className="relative aspect-video">
              <img src={getYoutubeThumbnail(value)!} alt="YouTube thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-3">
                  <PlayCircle size={28} className="text-white" />
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 p-2 text-center">YouTube détecté ✓</p>
        </div>
      )}

      {type === 'instagram' && (
        <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg text-pink-700 text-sm">
          <Film size={16} />
          Lien Instagram détecté ✓
        </div>
      )}

      {type === 'direct' && value.startsWith('data:video') && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
          <Film size={16} />
          Vidéo uploadée ✓ — sera lue directement
        </div>
      )}
    </div>
  );
}
