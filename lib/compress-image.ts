/**
 * Shrinks an image in the browser before it is uploaded.
 *
 * Covers and in-article images now come from ChatGPT as 1–3 MB PNGs, and
 * nothing resized them: every one was served at full weight, which costs LCP on
 * mobile. This runs in the admin, before the upload, so it also keeps files under
 * Vercel's 4.5 MB request-body limit on /api/admin/upload-image.
 *
 * Output is WebP where the browser can encode it (Chrome, Firefox) and JPEG where
 * it cannot (Safari's canvas encodes PNG instead of WebP). GIFs keep their
 * animation, so they pass through untouched, as do files already small enough.
 */
const MAX_WIDTH = 1600;
const QUALITY = 0.85;
const SMALL_ENOUGH = 300 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  if (bitmap.width <= MAX_WIDTH && file.size <= SMALL_ENOUGH) {
    bitmap.close();
    return file;
  }

  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await toBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg");
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${name}.${ext}`, { type: blob.type });
}
