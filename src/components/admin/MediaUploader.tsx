import { useRef } from 'react';
import { Upload, X, Star, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { compressImage, MAX_PHOTOS, MAX_PHOTO_SIZE_MB, formatBytes, totalBase64Size } from '../../utils/image';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function MediaUploader({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const toProcess = Array.from(files).slice(0, remaining);
    const results: string[] = [];
    for (const file of toProcess) {
      if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} dépasse ${MAX_PHOTO_SIZE_MB}Mo et a été ignoré.`);
        continue;
      }
      try {
        const b64 = await compressImage(file);
        results.push(b64);
      } catch {
        alert(`Impossible de traiter ${file.name}`);
      }
    }
    onChange([...photos, ...results]);
  };

  const remove = (i: number) => {
    if (confirm('Supprimer cette photo ?')) onChange(photos.filter((_, idx) => idx !== i));
  };

  const moveLeft = (i: number) => {
    if (i === 0) return;
    const arr = [...photos];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    onChange(arr);
  };

  const moveRight = (i: number) => {
    if (i === photos.length - 1) return;
    const arr = [...photos];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    onChange(arr);
  };

  const setMain = (i: number) => {
    if (i === 0) return;
    const arr = [...photos];
    const [main] = arr.splice(i, 1);
    onChange([main, ...arr]);
  };

  const usedBytes = totalBase64Size(photos);
  const usedMb = (usedBytes / (1024 * 1024)).toFixed(1);
  const pct = Math.min(100, (usedBytes / (10 * 1024 * 1024)) * 100);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-coral-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={28} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">
          Glissez vos photos ici ou <span className="text-coral-500">cliquez pour sélectionner</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WEBP · Max {MAX_PHOTO_SIZE_MB}Mo par photo · {photos.length}/{MAX_PHOTOS} photos
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Storage indicator */}
      {photos.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Stockage utilisé : {formatBytes(usedBytes)}</span>
            <span>{usedMb} Mo / 10 Mo</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : 'bg-coral-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct > 80 && (
            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
              <AlertCircle size={12} />
              Stockage presque plein — supprimez des photos ou réduisez leur taille
            </div>
          )}
        </div>
      )}

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

              {/* Main badge */}
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-coral-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={10} className="fill-white" />
                  Principale
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                {i > 0 && (
                  <button
                    onClick={() => setMain(i)}
                    className="text-xs bg-white/90 text-gray-800 px-2 py-1 rounded-full font-medium hover:bg-white"
                  >
                    Principale
                  </button>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => moveLeft(i)}
                    disabled={i === 0}
                    className="p-1.5 bg-white/80 rounded-full hover:bg-white disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => moveRight(i)}
                    disabled={i === photos.length - 1}
                    className="p-1.5 bg-white/80 rounded-full hover:bg-white disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => remove(i)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
