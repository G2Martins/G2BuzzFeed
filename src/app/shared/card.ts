// Result card (1080x1350 PNG) drawn client-side on a <canvas>: same paper, sticker tile and glyphs as the
// site. Posters are same-origin files in /media, so the canvas never gets tainted. Browser only.
import { GLYPHS } from '../data/glyphs';
import { Quiz, Result, SITE_URL, categoryBySlug, mediaFile } from '../data/quizzes';

const W = 1080;
const H = 1350;
const INK = '#16131d';
const SANS = '"Geist Variable", system-ui, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';

type Ctx = CanvasRenderingContext2D;

function dots(x: Ctx, w: number, h: number, color: string, gap: number) {
  x.fillStyle = color;
  for (let i = gap / 2; i < w; i += gap) for (let j = gap / 2; j < h; j += gap) x.fillRect(i, j, 2, 2);
}

/** Greedy word wrap; the last allowed line gets an ellipsis if text is left over. */
function wrap(x: Ctx, text: string, max: number, lines: number) {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (x.measureText(next).width <= max || !line) { line = next; continue; }
    out.push(line);
    line = word;
    if (out.length === lines) break;
  }
  if (out.length < lines) out.push(line);
  else if (out.join(' ').length < text.length) {
    let last = out[lines - 1];
    while (x.measureText(`${last}...`).width > max) last = last.slice(0, -1);
    out[lines - 1] = `${last.trimEnd()}...`;
  }
  return out.slice(0, lines);
}

const load = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });

export async function resultCard(quiz: Quiz, result: Result, hue: string, scoreLine: string): Promise<Blob> {
  await Promise.all([`600 80px ${SANS}`, `400 30px ${SANS}`, `500 24px ${MONO}`].map((f) => document.fonts.load(f).catch(() => null)));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  x.textBaseline = 'alphabetic';

  // Paper + dot grid.
  x.fillStyle = '#f4f1e8';
  x.fillRect(0, 0, W, H);
  dots(x, W, H, 'rgba(22,19,29,0.06)', 22);

  // Header: brand mark + name, category on the right.
  x.save();
  x.translate(80, 64);
  x.scale(56 / 32, 56 / 32);
  x.fillStyle = INK;
  x.beginPath(); x.roundRect(1, 3, 30, 28, 8.5); x.fill();
  x.fillStyle = '#3341f5';
  x.beginPath(); x.roundRect(1, 1, 30, 28, 8.5); x.fill();
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = '#fffdf7'; x.lineWidth = 3.1; x.stroke(new Path2D('M19.6 10.4a6.6 6.6 0 1 0 1 7.1h-5.4'));
  x.strokeStyle = '#ffe680'; x.lineWidth = 1.7; x.stroke(new Path2D('M22.2 5.9c.3-1 1.1-1.5 2-1.5 1.1 0 1.9.8 1.9 1.8 0 1.5-2 2.4-3.9 4.3h4'));
  x.restore();
  x.fillStyle = INK;
  x.font = `600 38px ${SANS}`;
  x.fillText('G2 Buzz', 154, 106);
  x.font = `500 21px ${MONO}`;
  x.letterSpacing = '3px';
  x.textAlign = 'right';
  x.fillStyle = '#4d4757';
  x.fillText(categoryBySlug(quiz.category)!.label.toUpperCase(), W - 80, 104);
  x.textAlign = 'left';
  x.letterSpacing = '0px';

  // Sticker tile with the result art.
  const [ax, ay, aw, ah] = [80, 170, W - 160, 600];
  x.save();
  x.beginPath(); x.roundRect(ax, ay, aw, ah, 28); x.clip();
  x.fillStyle = hue; x.fillRect(ax, ay, aw, ah);
  x.translate(ax, ay);
  dots(x, aw, ah, 'rgba(22,19,29,0.13)', 16);
  x.fillStyle = 'rgba(255,255,255,0.38)';
  x.beginPath(); x.arc(aw - 60, 40, 330, 0, Math.PI * 2); x.fill();
  const art = result.art ?? quiz.art;
  if (art.img?.length) {
    const img = await load(mediaFile(art.img[0]));
    const [pw, ph] = [330, 495];
    x.translate(aw / 2, ah / 2);
    x.rotate(-0.05);
    x.shadowColor = 'rgba(22,19,29,0.3)'; x.shadowBlur = 40; x.shadowOffsetY = 18;
    x.fillStyle = '#fff';
    x.beginPath(); x.roundRect(-pw / 2 - 9, -ph / 2 - 9, pw + 18, ph + 18, 16); x.fill();
    x.shadowColor = 'transparent';
    x.save();
    x.beginPath(); x.roundRect(-pw / 2, -ph / 2, pw, ph, 10); x.clip();
    x.drawImage(img, -pw / 2, -ph / 2, pw, ph);
    x.restore();
  } else if (art.t) {
    x.font = `650 190px ${MONO}`;
    x.letterSpacing = '-10px';
    const tw = x.measureText(art.t).width;
    x.fillStyle = INK;
    x.fillText(art.t, (aw - tw) / 2 - 30, ah / 2 + 66);
    x.fillStyle = '#3341f5';
    x.fillRect((aw + tw) / 2 - 18, ah / 2 + 50, 74, 18);
    x.letterSpacing = '0px';
  } else {
    const size = 330;
    x.translate((aw - size) / 2, (ah - size) / 2);
    x.scale(size / 24, size / 24);
    x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 1.5;
    const paths = (GLYPHS[art.g ?? ''] ?? GLYPHS['question']).map((d) => new Path2D(d));
    x.strokeStyle = 'rgba(22,19,29,0.16)';
    x.translate(0.2, 0.2);
    paths.forEach((p) => x.stroke(p));
    x.translate(-0.2, -0.2);
    x.strokeStyle = INK;
    paths.forEach((p) => x.stroke(p));
  }
  x.restore();
  x.strokeStyle = '#dcd4c3'; x.lineWidth = 2;
  x.beginPath(); x.roundRect(ax, ay, aw, ah, 28); x.stroke();

  // Copy: eyebrow, title, score, description.
  let y = 850;
  x.fillStyle = '#3341f5';
  x.beginPath(); x.arc(86, y - 8, 6, 0, Math.PI * 2); x.fill();
  x.font = `500 21px ${MONO}`;
  x.letterSpacing = '3px';
  x.fillStyle = '#4d4757';
  x.fillText(scoreLine ? `MEU RESULTADO · ${scoreLine.toUpperCase()}` : 'MEU RESULTADO', 104, y);
  x.letterSpacing = '0px';
  y += 84;
  x.font = `600 72px ${SANS}`;
  x.letterSpacing = '-2px';
  x.fillStyle = INK;
  for (const line of wrap(x, result.title, W - 160, 2)) { x.fillText(line, 80, y); y += 78; }
  x.letterSpacing = '0px';
  y += 4;
  x.font = `400 30px ${SANS}`;
  x.fillStyle = '#4d4757';
  for (const line of wrap(x, result.text, W - 160, 3)) { x.fillText(line, 80, y); y += 44; }

  // Footer: quiz title + URL.
  x.fillStyle = '#dcd4c3';
  x.fillRect(80, H - 122, W - 160, 2);
  x.font = `500 26px ${SANS}`;
  x.fillStyle = INK;
  x.fillText(wrap(x, quiz.title, W - 160, 1)[0], 80, H - 72);
  x.font = `500 21px ${MONO}`;
  x.fillStyle = '#6b6474';
  x.fillText(`Faça o quiz também: ${SITE_URL.replace('https://', '')}`, 80, H - 40);

  return new Promise((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error('toBlob'))), 'image/png'));
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
