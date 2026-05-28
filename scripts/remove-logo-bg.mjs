import sharp from "sharp";
import path from "path";
import { renameSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public");

/** Convierte píxeles oscuros (fondo negro/gris) en transparentes. */
async function removeDarkBackground(file) {
  const input = path.join(root, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 48;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }

  const tmp = path.join(root, `${file}.tmp.png`);
  await sharp(data, { raw: { width, height, channels } }).png().toFile(tmp);
  renameSync(tmp, input);

  console.log(`OK ${file} (${width}x${height})`);
}

await removeDarkBackground("logo-actionsnap.png");
await removeDarkBackground("logo-actionsnap-horizontal.png");
await removeDarkBackground("isotipo-actionsnap.png");
