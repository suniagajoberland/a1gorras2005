const fs = require("fs");

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

function hiRes(url) {
  return String(url || "")
    .replace("D_Q_NP_2X_", "D_NQ_NP_2X_")
    .replace("D_Q_NP_", "D_NQ_NP_2X_")
    .replace(/-[A-Z]\.webp$/, "-F.webp");
}

function hexFor(name) {
  const k = name.toLowerCase().trim();
  if (HEX[k]) return HEX[k];
  for (const key of Object.keys(HEX)) if (k.includes(key)) return HEX[key];
  return "#888888";
}

function decodeQP(str) {
  str = str.replace(/=\r?\n/g, "");
  const b = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "=" && i + 2 < str.length) {
      const hx = str.substr(i + 1, 2);
      if (/^[0-9A-Fa-f]{2}$/.test(hx)) { b.push(parseInt(hx, 16)); i += 2; continue; }
    }
    const c = str.charCodeAt(i);
    if (c < 128) b.push(c);
    else { const e = Buffer.from(str[i], "utf8"); for (const x of e) b.push(x); }
  }
  return Buffer.from(b).toString("utf8");
}

function getHtml(f) {
  const raw = fs.readFileSync(f, "utf8");
  const bm = raw.match(/boundary="([^"]+)"/);
  if (!bm) return raw;
  const parts = raw.split("--" + bm[1]);
  let best = "";
  for (const p of parts) {
    const he = p.indexOf("\r\n\r\n") >= 0 ? p.indexOf("\r\n\r\n") : p.indexOf("\n\n");
    if (he < 0) continue;
    if (/Content-Type:\s*text\/html/i.test(p.slice(0, he))) {
      const d = decodeQP(p.slice(he));
      if (d.length > best.length) best = d;
    }
  }
  return best;
}

function extractFromHtml(h) {
  const map = new Map();
  const re = /(?:dropdown|thumbnails)__item__picture"[^>]*?alt="([^"]*)"[^>]*?src="([^"]+)"|(?:dropdown|thumbnails)__item__picture"[^>]*?src="([^"]+)"[^>]*?alt="([^"]*)"/g;
  let m;
  while ((m = re.exec(h))) {
    const name = (m[1] || m[4] || "").trim();
    const src = m[2] || m[3] || "";
    if (name && src && !map.has(name)) map.set(name, src);
  }
  return [...map.entries()].map(([name, image]) => ({ name, image }));
}

function norm(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const products = JSON.parse(fs.readFileSync("products.json", "utf8"));

const colorByTitle = {};

for (const f of fs.readdirSync(".")) {
  if (!f.toLowerCase().endsWith(".mhtml")) continue;
  if (/^A1GORRAS2005CA/i.test(f)) continue;
  const title = f.replace(/\s*_\s*MercadoLibre\.mhtml$/i, "").trim();
  const colors = extractFromHtml(getHtml(f));
  if (colors.length) colorByTitle[norm(title)] = colors;
}

if (fs.existsSync("colores.json")) {
  try {
    const data = JSON.parse(fs.readFileSync("colores.json", "utf8"));
    const arr = Array.isArray(data) ? data : Object.values(data);
    arr.forEach((entry, i) => {
      if (entry && entry.colors && entry.colors.length) {
        const t = entry.title || products[i]?.title || "";
        colorByTitle[norm(t.replace(/\s*\|.*$/, ""))] = entry.colors;
      }
    });
  } catch (e) {
    console.log("colores.json invalido:", e.message);
  }
}

let matched = 0;
const out = products.map((p, idx) => {
  const id = "G-" + String(idx + 1).padStart(2, "0");
  const price = parseFloat(p.price);
  const mayor = Math.round(price * 0.7 * 100) / 100;
  const np = norm(p.title);

  let found = colorByTitle[np];
  if (!found) {
    const key = Object.keys(colorByTitle).find((k) => k === np || k.includes(np) || np.includes(k));
    if (key) found = colorByTitle[key];
  }

  let colors;
  if (found && found.length) {
    matched++;
    colors = found.map((c) => ({ name: c.name, hex: hexFor(c.name), image: hiRes(c.image) }));
  } else {
    colors = p.colors.map((hex) => ({
      name: colorNameFromHex(hex),
      hex,
      image: hiRes(p.image),
    }));
    if (p.isMulti) colors.push({ name: "Multicolor", hex: "#777777", image: hiRes(p.image) });
    if (colors.length === 0) {
      const n = /negro/i.test(p.title) ? "Negro" : "Estándar";
      colors = [{ name: n, hex: /negro/i.test(p.title) ? "#111111" : "#3a3a3a", image: hiRes(p.image) }];
    }
  }

  return {
    id,
    title: p.title,
    priceDetal: price,
    priceMayor: mayor,
    category: category(p.title),
    colorCount: colors.length,
    url: p.url.split("#")[0],
    colors,
  };
});

function colorNameFromHex(hex) {
  const inv = {};
  Object.keys(HEX).forEach((k) => { if (!inv[HEX[k]]) inv[HEX[k]] = k; });
  const n = inv[hex.toUpperCase()] || inv[hex];
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : "Color";
}

function category(title) {
  const t = title.toLowerCase();
  if (t.includes("visera")) return "Viseras";
  if (t.includes("pasamonta")) return "Pasamontañas";
  if (t.includes("sombrero") || t.includes("gorro")) return "Sombreros";
  if (t.includes("pack")) return "Packs";
  return "Gorras";
}

console.log(`Productos con colores extraidos: ${matched}/${products.length}`);

const dataJs = "const productsData = " + JSON.stringify(out, null, 2) + ";";

function replaceBlock(file, startMarker, dataLiteral, endMarker) {
  let html = fs.readFileSync(file, "utf8");
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start < 0 || end < 0) { console.log("No se pudo actualizar", file, start, end); return; }
  html = html.slice(0, start) + dataLiteral + "\n\n      " + html.slice(end);
  fs.writeFileSync(file, html, "utf8");
  console.log("Actualizado", file);
}

replaceBlock("assets/js/data.js", "const productsData = [", dataJs, "/* END productsData */");

const adminOut = out.map((p) => ({
  id: p.id, title: p.title, sales: 0,
  priceDetal: p.priceDetal, priceMayor: p.priceMayor,
  stock1: 0, stock2: 0, colors: p.colors,
}));
const adminJs = "let adminProducts = " + JSON.stringify(adminOut, null, 10).replace(/\n/g, "\n      ") + ";";
replaceBlock("admin.html", "let adminProducts = [", adminJs, "document.addEventListener(\"DOMContentLoaded\"");
