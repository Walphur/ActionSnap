import path from "path";
import sharp from "sharp";
import { createWorker, PSM, type Worker } from "tesseract.js";
import { pickPlateNumbers } from "@/lib/detect/pick-plate-numbers";

export function hasLocalOcr() {
  return process.env.DETECTION_DISABLE_LOCAL !== "true";
}

const workerPath = path.join(
  process.cwd(),
  "node_modules/tesseract.js/src/worker-script/node/index.js"
);
const cachePath = path.join(process.cwd(), ".cache/tesseract");

let workerInstance: Worker | null = null;
let workerInit: Promise<Worker> | null = null;
async function getWorker() {
  if (workerInstance) return workerInstance;
  if (!workerInit) {
    workerInit = (async () => {
      const worker = await createWorker("eng", 1, {
        workerPath,
        cachePath,
        logger: () => {},
      });
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
      });
      workerInstance = worker;
      return worker;
    })();
  }
  return workerInit;
}

async function plateCrop(buffer: Buffer) {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;

  return sharp(buffer)
    .extract({
      left: Math.floor(w * 0.15),
      top: Math.floor(h * 0.02),
      width: Math.max(1, Math.floor(w * 0.7)),
      height: Math.max(1, Math.floor(h * 0.5)),
    })
    .resize({ width: 900, withoutEnlargement: true })
    .grayscale()
    .normalize()
    .linear(1.4, -60)
    .sharpen()
    .toBuffer();
}

async function ocrPlate(worker: Worker, image: Buffer) {
  const meta = await sharp(image).metadata();
  const w = meta.width ?? 900;
  const h = meta.height ?? 600;

  const { data } = await worker.recognize(image);
  const words = (data.words ?? []).map((word) => ({
    text: word.text,
    confidence: word.confidence,
    bbox: word.bbox,
  }));

  const fromWords = pickPlateNumbers(words, w, h);

  if (fromWords.length > 0) return fromWords;

  const lineText = (data.text ?? "").replace(/[^\d]/g, " ");
  const chunks = lineText.split(/\s+/).filter((c) => /^\d{1,3}$/.test(c));
  const best = chunks.sort((a, b) => b.length - a.length)[0];
  if (best) {
    const n = best.replace(/^0+/, "") || "0";
    if (/^\d{1,3}$/.test(n) && parseInt(n, 10) <= 199) {
      return [{ number: n, confidence: 0.7 }];
    }
  }

  return [];
}

export async function detectWithTesseract(buffer: Buffer) {
  const rotated = await sharp(buffer).rotate().toBuffer();
  const plate = await plateCrop(rotated);
  const worker = await getWorker();

  const plateResult = await ocrPlate(worker, plate);
  if (plateResult.length > 0) return plateResult;

  const top = await sharp(rotated)
    .extract({
      left: 0,
      top: 0,
      width: (await sharp(rotated).metadata()).width ?? 1,
      height: Math.floor(((await sharp(rotated).metadata()).height ?? 1) * 0.55),
    })
    .resize({ width: 900 })
    .grayscale()
    .normalize()
    .toBuffer();

  return ocrPlate(worker, top);
}
