// Rasterize scripts/_out/*.pdf to PNG so they display inline in chat. Throwaway dev tool.
import { pdf } from 'pdf-to-img';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'scripts', '_out');
const pdfs = readdirSync(dir).filter((f) => f.endsWith('.pdf'));

for (const f of pdfs) {
  const base = f.replace(/\.pdf$/, '');
  const doc = await pdf(join(dir, f), { scale: 2 });
  let i = 1;
  for await (const img of doc) {
    const name = i > 1 ? `${base}-p${i}.png` : `${base}.png`;
    writeFileSync(join(dir, name), img);
    console.log('wrote', name);
    i++;
  }
}
