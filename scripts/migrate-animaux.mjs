import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://flvmbrkpvywtymndrqns.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EMgOqc7Gy9RvFREWnK5cOw_7j-Prpl2';
const BUCKET = 'animaux-photos';
const JSON_PATH = '/root/.claude/uploads/a4bf9448-df23-48f9-98bf-3792325c14d0/4b990790-animaux.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function base64ToBuffer(dataUrl) {
  const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

function mimeFromDataUrl(dataUrl) {
  const m = dataUrl.match(/^data:([^;]+);base64,/);
  return m ? m[1] : 'image/jpeg';
}

function extFromMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

async function uploadPhoto(animalId, index, dataUrl) {
  const mime = mimeFromDataUrl(dataUrl);
  const ext = extFromMime(mime);
  const path = `${animalId}/photo-${index}.${ext}`;
  const buffer = base64ToBuffer(dataUrl);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: true });

  if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const animals = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
  console.log(`Migrating ${animals.length} animals...`);

  for (const animal of animals) {
    console.log(`\n→ ${animal.nom} (${animal.id})`);

    // Upload photos
    const photoUrls = [];
    for (let i = 0; i < animal.photos.length; i++) {
      const photo = animal.photos[i];
      if (photo.startsWith('data:')) {
        process.stdout.write(`  Uploading photo ${i + 1}/${animal.photos.length}... `);
        const url = await uploadPhoto(animal.id, i, photo);
        photoUrls.push(url);
        console.log('OK');
      } else {
        photoUrls.push(photo); // already a URL
      }
    }

    // Insert into DB
    const record = {
      id: animal.id,
      nom: animal.nom,
      espece: animal.espece,
      race: animal.race ?? '',
      naissance: animal.naissance,
      sexe: animal.sexe,
      departement: animal.departement ?? '',
      localisation: animal.localisation ?? 'Refuge',
      statut: animal.statut ?? 'Disponible',
      description: animal.description ?? '',
      entente_chiens: animal.entente_chiens ?? false,
      entente_chats: animal.entente_chats ?? false,
      entente_enfants: animal.entente_enfants ?? false,
      vaccine: animal.vaccine ?? false,
      sterilise: animal.sterilise ?? false,
      identifie: animal.identifie ?? false,
      participation_frais: animal.participation_frais ?? 0,
      association_nom: animal.association_nom ?? '',
      association_ville: animal.association_ville ?? '',
      photos: photoUrls,
      video_youtube: animal.video_youtube ?? '',
    };

    const { error } = await supabase.from('animaux').upsert(record);
    if (error) {
      console.error(`  DB insert error: ${error.message}`);
    } else {
      console.log(`  Inserted into DB with ${photoUrls.length} photo(s).`);
    }
  }

  console.log('\nMigration complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
