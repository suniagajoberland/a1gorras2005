// Genera muestras sinteticas de color a partir de la foto unica de cada producto.
//
// Metodo: transferencia de color en HSV. Se calcula el tono/saturacion/brillo
// promedio de la foto original (sobre los pixeles de color) y se desplaza toda
// la imagen para que ese promedio coincida con el color destino. Asi se conserva
// EXACTAMENTE la textura, el sombreado y el patron (ej. camuflaje) de la foto:
// solo cambia el color, no el modelo ni la estetica de los tonos.
//
// Actualiza index.html y admin.html con las rutas locales.
//
// Uso:  node generar-muestras.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PROJECT = __dirname;
const INDEX = path.join(PROJECT, "index.html");
const ADMIN = path.join(PROJECT, "admin.html");
const SIZE = 600;

function hexToRgb(hex) {
  const h = String(hex || "#888888").replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(n.slice(0, 2), 16) || 0,
    g: parseInt(n.slice(2, 4), 16) || 0,
    b: parseInt(n.slice(4, 6), 16) || 0,
  };
}

function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = mx ? d / mx : 0;
  return [h, s, mx];
}

function hsv2rgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

function readBlock(file, startMarker, endMarker) {
  const html = fs.readFileSync(file, "utf8");
  const s = html.indexOf(startMarker);
  const e = html.indexOf(endMarker, s);
  if (s < 0 || e < 0) throw new Error("No se encontraron marcadores en " + file);
  return { html, s, e };
}

async function recolorToFile(srcRel, hex, destRel) {
  const src = path.join(PROJECT, srcRel);
  const dest = path.join(PROJECT, destRel);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const N = width * height;

  // Promedios del original sobre pixeles de color (saturados).
  let sumSin = 0, sumCos = 0, sumS = 0, sumV = 0, cnt = 0;
  for (let i = 0; i < N; i++) {
    const p = i * channels;
    if (channels === 4 && data[p + 3] < 8) continue;
    const [h, s, v] = rgb2hsv(data[p], data[p + 1], data[p + 2]);
    if (s > 0.12 && v > 0.1) {
      sumSin += Math.sin((h * Math.PI) / 180);
      sumCos += Math.cos((h * Math.PI) / 180);
      sumS += s; sumV += v; cnt++;
    }
  }
  if (cnt < 20) {
    for (let i = 0; i < N; i++) {
      const p = i * channels;
      if (channels === 4 && data[p + 3] < 8) continue;
      const [h, s, v] = rgb2hsv(data[p], data[p + 1], data[p + 2]);
      sumSin += Math.sin((h * Math.PI) / 180);
      sumCos += Math.cos((h * Math.PI) / 180);
      sumS += s; sumV += v; cnt++;
    }
  }
  let Hm = (Math.atan2(sumSin, sumCos) * 180) / Math.PI;
  if (Hm < 0) Hm += 360;
  const Sm = sumS / cnt;
  const Vm = sumV / cnt;

  const trg = hexToRgb(hex);
  const [Th, Ts, Tv] = rgb2hsv(trg.r, trg.g, trg.b);

  let dH = Th - Hm;
  if (dH > 180) dH -= 360;
  if (dH < -180) dH += 360;
  const dS = Ts - Sm;
  const dV = Tv - Vm;

  const out = Buffer.from(data);
  for (let i = 0; i < N; i++) {
    const p = i * channels;
    if (channels === 4 && out[p + 3] < 8) continue;
    const [h, s, v] = rgb2hsv(out[p], out[p + 1], out[p + 2]);
    const [nr, ng, nb] = hsv2rgb(h + dH, clamp01(s + dS), clamp01(v + dV));
    out[p] = Math.round(nr);
    out[p + 1] = Math.round(ng);
    out[p + 2] = Math.round(nb);
  }

  await sharp(out, { raw: { width, height, channels } })
    .resize({ width: SIZE, height: SIZE, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 84, alphaQuality: 92 })
    .toFile(dest);
  return "productos/" + path.basename(destRel);
}

(async () => {
  const { html, s, e } = readBlock(INDEX, "const productsData = [", "let currentPage");
  const products = JSON.parse(html.slice(s + "const productsData = ".length, e).trim().replace(/;\s*$/, ""));

  let prods = 0, imgs = 0;
  for (const p of products) {
    const colors = p.colors || [];
    if (colors.length < 2) continue;
    const distinct = new Set(colors.map((c) => c.image));
    if (distinct.size > 1) continue;

    const base = colors[0].image;
    prods++;
    for (let i = 0; i < colors.length; i++) {
      const c = colors[i];
      if (/multicolor|est[áa]ndar/i.test(c.name) || c.hex === "#777777" || c.hex === "#3a3a3a") {
        c.image = base;
        continue;
      }
      const rel = "productos/syn-" + p.id + "-" + String(i + 1).padStart(2, "0") + ".webp";
      try {
        c.image = await recolorToFile(base, c.hex, rel);
        imgs++;
      } catch (err) {
        console.log("  FALLO", p.id, c.name, err.message);
      }
    }
  }

  console.log("Productos recoloreados:", prods, "| imagenes generadas:", imgs);

  const dataJs = "const productsData = " + JSON.stringify(products, null, 2) + ";";
  const newIndex = html.slice(0, s) + dataJs + "\n\n      " + html.slice(e);
  fs.writeFileSync(INDEX, newIndex, "utf8");
  console.log("index.html actualizado:", newIndex.length, "bytes");

  if (fs.existsSync(ADMIN)) {
    try {
      const a = readBlock(ADMIN, "let adminProducts = [", "document.addEventListener(\"DOMContentLoaded\"");
      const adminProducts = JSON.parse(a.html.slice(a.s + "let adminProducts = ".length, a.e).trim().replace(/;\s*$/, ""));
      adminProducts.forEach((ap) => {
        const src = products.find((p) => p.id === ap.id);
        if (src) ap.colors = src.colors;
      });
      const adminJs = "let adminProducts = " + JSON.stringify(adminProducts, null, 10).replace(/\n/g, "\n      ") + ";";
      fs.writeFileSync(ADMIN, a.html.slice(0, a.s) + adminJs + a.html.slice(a.e), "utf8");
      console.log("admin.html actualizado");
    } catch (err) {
      console.log("admin.html no actualizado:", err.message);
    }
  }
})();
