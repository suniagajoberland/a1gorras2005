// Procesa colores.json (generado por a1-colores.user.js en el navegador).
// Descarga la imagen de cada color desde el CDN de MercadoLibre (no bloqueado),
// le quita el fondo blanco, la recorta, la normaliza a 600x600 webp y actualiza
// las rutas locales dentro de assets/js/data.js y admin.html.
//
// Uso:  node aplicar-colores.js
//
// Requiere: colores.json en la carpeta del proyecto + modulo sharp.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const PROJECT = __dirname;
const DATA = path.join(PROJECT, "assets", "js", "data.js");
const ADMIN = path.join(PROJECT, "admin.html");
const OUTDIR = path.join(PROJECT, "productos");
const SIZE = 600;

fs.mkdirSync(OUTDIR, { recursive: true });

const HEX = {
  aguamarina: "#7FFFD4", aguamarine: "#7FFFD4",
  amarillo: "#FFED00", "amarillo (bandera)": "#FFD100",
  "amarillo caterpila": "#FFC72C", "amarillo caterpilla": "#FFC72C",
  "amarillo neón": "#FFF01F", "amarillo neon": "#FFF01F",
  "azul bebé": "#A8D8FF", "azul bebe": "#A8D8FF",
  "azul turquesa": "#30C0C0", "azul marino": "#0F5299", "azul rey": "#1E3FBF",
  beige: "#F5F3DC", "beige claro": "#F7F4E3", "beige oscuro": "#D9CFA5",
  blanco: "#FFFFFF", celeste: "#87CEEB", fucsia: "#FF00EC",
  gris: "#9E9E9E", "gris oscuro": "#555555", ladrillo: "#B03A2E",
  lila: "#CC87FF", marrón: "#A0522D", marron: "#A0522D",
  "marrón oscuro": "#6B4226", "marron oscuro": "#6B4226",
  morado: "#9F00FF", mostaza: "#D4A017", naranja: "#FF8C00",
  "naranja ladrillo": "#CC5500", "naranja neón": "#FF5F1F", "naranja neon": "#FF5F1F",
  negro: "#111111", rojo: "#FF0000", "rojo claro": "#FF6B6B",
  rosa: "#FCB1BE", turquesa: "#40E0D0", verde: "#0DA600",
  "verde brasil": "#009739", "verde claro": "#7CFC00", "verde limón": "#BFFF00",
  "verde limon": "#BFFF00", "verde manzana": "#8DB600", "verde neón": "#39FF14",
  "verde neon": "#39FF14", "verde oliva": "#6B8E23", "verde oscuro": "#003D00",
  "vino tinto": "#722F37", violeta: "#7F00FF",
};

function hexFor(name) {
  const k = String(name || "").toLowerCase().trim();
  if (HEX[k]) return HEX[k];
  for (const key of Object.keys(HEX)) if (k.includes(key)) return HEX[key];
  return "#888888";
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hiRes(url) {
  return String(url || "")
    .replace("D_Q_NP_2X_", "D_NQ_NP_2X_")
    .replace("D_Q_NP_", "D_NQ_NP_2X_")
    .replace(/-[A-Z]\.webp$/, "-F.webp");
}

async function processUrl(url) {
  const name = "ml-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 12) + ".webp";
  const dest = path.join(OUTDIR, name);
  const rel = "productos/" + name;
  if (fs.existsSync(dest)) return rel;

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const N = width * height;
  const visited = new Uint8Array(N);
  const stack = [];
  const TH = 234;
  const isWhite = (i) => {
    const p = i * channels;
    return data[p] >= TH && data[p + 1] >= TH && data[p + 2] >= TH;
  };
  const seed = (x, y) => {
    const i = y * width + x;
    if (!visited[i] && isWhite(i)) { visited[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < width; x++) { seed(x, 0); seed(x, height - 1); }
  for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    data[i * channels + 3] = 0;
    const x = i % width, y = (i / width) | 0;
    if (x > 0) seed(x - 1, y);
    if (x < width - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < height - 1) seed(x, y + 1);
  }

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let i = 0; i < N; i++) {
    if (data[i * channels + 3] > 8) {
      const x = i % width, y = (i / width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  let pipeline = sharp(data, { raw: { width, height, channels } });
  if (maxX >= minX && maxY >= minY) {
    const pad = Math.round(Math.min(width, height) * 0.02);
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    const w = Math.min(width - left, (maxX - minX + 1) + pad * 2);
    const h = Math.min(height - top, (maxY - minY + 1) + pad * 2);
    pipeline = pipeline.extract({ left, top, width: w, height: h });
  }
  pipeline = pipeline.resize({ width: SIZE, height: SIZE, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await pipeline.webp({ quality: 84, alphaQuality: 92 }).toFile(dest);
  return rel;
}

function readBlock(file, startMarker, endMarker) {
  const html = fs.readFileSync(file, "utf8");
  const s = html.indexOf(startMarker);
  const e = html.indexOf(endMarker, s);
  if (s < 0 || e < 0) throw new Error("No se encontraron marcadores en " + file);
  return { html, s, e };
}

(async () => {
  if (!fs.existsSync(path.join(PROJECT, "colores.json"))) {
    console.log("Falta colores.json. Ejecuta primero el userscript a1-colores.user.js en tu navegador.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(path.join(PROJECT, "colores.json"), "utf8"));
  const entries = Array.isArray(data) ? data : Object.values(data);
  console.log("Entradas en colores.json:", entries.length);

  const byTitle = {};
  const ordered = [];
  entries.forEach((entry, i) => {
    if (!entry) return;
    const colors = (entry.colors || []).filter((c) => c && c.name && c.image);
    ordered[i] = colors;
    if (entry.title) byTitle[norm(entry.title.replace(/\s*\|.*$/, ""))] = colors;
  });

  const { html, s, e } = readBlock(DATA, "const productsData = [", "/* END productsData */");
  const startLen = "const productsData = ".length;
  const products = JSON.parse(html.slice(s + startLen, e).trim().replace(/;\s*$/, ""));

  const urlToLocal = new Map();
  let matchedProducts = 0, totalColors = 0, fail = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const np = norm(p.title);
    let colors = byTitle[np];
    if (!colors) {
      const key = Object.keys(byTitle).find((k) => k === np || k.includes(np) || np.includes(k));
      if (key) colors = byTitle[key];
    }
    if (!colors || !colors.length) colors = ordered[i];
    if (!colors || !colors.length) continue;

    matchedProducts++;
    const mapped = [];
    for (const c of colors) {
      const url = hiRes(c.image);
      try {
        const rel = await processUrl(url);
        urlToLocal.set(url, rel);
        mapped.push({ name: c.name, hex: hexFor(c.name), image: rel });
      } catch (err) {
        fail++;
        console.log("  FALLO", c.name, url, err.message);
      }
    }
    if (mapped.length) {
      p.colors = mapped;
      p.colorCount = mapped.length;
      totalColors += mapped.length;
    }
  }

  console.log("Productos actualizados:", matchedProducts, "| colores:", totalColors, "| fallos:", fail);

  const dataJs = "const productsData = " + JSON.stringify(products, null, 2) + ";";
  const newData = html.slice(0, s) + dataJs + "\n\n" + html.slice(e);
  fs.writeFileSync(DATA, newData, "utf8");
  console.log("assets/js/data.js actualizado:", newData.length, "bytes");

  if (fs.existsSync(ADMIN)) {
    try {
      const a = readBlock(ADMIN, "let adminProducts = [", "document.addEventListener(\"DOMContentLoaded\"");
      const adminProducts = JSON.parse(a.html.slice(a.s + "let adminProducts = ".length, a.e).trim().replace(/;\s*$/, ""));
      adminProducts.forEach((ap) => {
        const src = products.find((p) => p.id === ap.id);
        if (src) { ap.colors = src.colors; }
      });
      const adminJs = "let adminProducts = " + JSON.stringify(adminProducts, null, 10).replace(/\n/g, "\n      ") + ";";
      fs.writeFileSync(ADMIN, a.html.slice(0, a.s) + adminJs + a.html.slice(a.e), "utf8");
      console.log("admin.html actualizado");
    } catch (err) {
      console.log("admin.html no actualizado:", err.message);
    }
  }

  console.log("Listo. Imagenes locales en productos/");
})();
