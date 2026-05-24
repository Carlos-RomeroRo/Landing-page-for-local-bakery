import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: join(root, '.env') });

const apiKey = process.env['NG_APP_GOOGLE_MAPS_API_KEY']?.trim() ?? '';

const outputPath = join(root, 'src', 'environments', 'maps.config.local.ts');
const contents = `/** Generado por scripts/sync-env.mjs — no editar a mano. Fuente: .env */
export const GOOGLE_MAPS_API_KEY_VALUE = ${JSON.stringify(apiKey)};
`;

writeFileSync(outputPath, contents, 'utf8');

console.log(
  apiKey
    ? '[sync-env] NG_APP_GOOGLE_MAPS_API_KEY cargada en maps.config.local.ts'
    : '[sync-env] NG_APP_GOOGLE_MAPS_API_KEY vacía — define la clave en .env',
);
