import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SUPABASE_URL = 'https://flvmbrkpvywtymndrqns.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EMgOqc7Gy9RvFREWnK5cOw_7j-Prpl2';
const BUCKET = 'animaux-photos';
const JSON_PATH = '/root/.claude/uploads/a4bf9448-df23-48f9-98bf-3792325c14d0/cd557087-animaux.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL');
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
}

function extFromMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

async function uploadPhoto(animalId, index, dataUrl) {
  const { mime, buffer } = parseDataUrl(dataUrl);
  const ext = extFromMime(mime);
  const path = `${animalId}/photo-${index}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: true });

  if (error) throw new Error(`Storage upload failed [${path}]: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const animals = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
  console.log(`Processing ${animals.length} animals...\n`);

  let totalOk = 0;
  let totalErr = 0;

  for (const animal of animals) {
    console.log(`→ ${animal.nom} (${animal.id}) — ${animal.photos.length} photo(s)`);
    const urls = [];

    for (let i = 0; i < animal.photos.length; i++) {
      const photo = animal.photos[i];
      process.stdout.write(`  [${i + 1}/${animal.photos.length}] Uploading... `);
      try {
        const url = await uploadPhoto(animal.id, i, photo);
        urls.push(url);
        console.log(`OK → ${url.split('/').pop()}`);
        totalOk++;
      } catch (err) {
        console.error(`FAIL: ${err.message}`);
        totalErr++;
      }
    }

    if (urls.length > 0) {
      const { error } = await supabase
        .from('animaux')
        .update({ photos: urls })
        .eq('id', animal.id);

      if (error) {
        console.error(`  DB update failed: ${error.message}`);
      } else {
        console.log(`  ✓ DB updated with ${urls.length} URL(s)\n`);
      }
    } else {
      console.log(`  ⚠ No photos uploaded, DB not updated\n`);
    }
  }

  console.log(`\nDone. ${totalOk} photos uploaded, ${totalErr} failed.`);
}

main().catch(err => { console.error('\nFatal:', err.message); process.exit(1); });
