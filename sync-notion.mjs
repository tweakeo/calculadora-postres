#!/usr/bin/env node
/* ============================================================================
 * sync-notion.mjs — Genera data.js desde Notion (fuente de verdad)
 * ----------------------------------------------------------------------------
 * Lee las DBs RECETAS (Tipo = Postre) e INGREDIENTES del workspace Chamberí y
 * vuelca todo a ./data.js, que es lo que consume index.html en GitHub Pages.
 *
 * Uso:
 *   1) Crea un archivo .env con:  NOTION_TOKEN=ntn_xxx   (token de integración)
 *   2) node sync-notion.mjs
 *   3) git add data.js && git commit -m "sync postres" && git push
 *
 * Costes: usa el campo "Coste €/unidad" de Notion. Si está vacío o a 0
 * (porque falta CANT. PACK en INVENTARIO), aplica el coste de EJEMPLO de la
 * tabla COSTES_EJEMPLO de abajo y marca el ingrediente con ejemplo:true.
 * En cuanto Notion tenga el coste real, este deja de ser de ejemplo solo.
 * ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────
const NOTION_VERSION = "2025-09-03";
const DS_RECETAS     = "92d2b49c-982b-4b55-8bdb-3a92ccbe41e8";
const DS_INGREDIENTES= "19ea5166-9933-43cb-979b-a14902ead83f";
const PACKAGING      = 0.82;   // €/tarro
const LOTE_PREFIX    = "TT";

// Coste de EJEMPLO por ingrediente (€ por g o ml). Respaldo mientras falten
// las fichas técnicas (CANT. PACK) en Notion. Clave = nombre exacto en Notion.
const COSTES_EJEMPLO = {
  "Oreo — base triturada": 0.0057,
  "Oreo troceada — mezcla interior": 0.0057,
  "Oreo — topping entera": 0.0057,
  "Galleta María — base": 0.0024,
  "Mantequilla": 0.0080,
  "Queso crema": 0.0060,
  "Azúcar glacé": 0.0020,
  "Nata 35%": 0.0030,
  "Coco rallado": 0.0075,
  "Trozos coco deshidratado": 0.0130,
  "Extracto de vainilla": 0.0500,
};
const COSTE_EJEMPLO_DEFECTO = 0.005;

// ── Notion fetch helpers ─────────────────────────────────────────────────────
function loadToken() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN;
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const line = fs.readFileSync(envPath, "utf8").split("\n").find(l => l.startsWith("NOTION_TOKEN="));
    if (line) return line.slice("NOTION_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
  }
  console.error("✖ Falta NOTION_TOKEN (ponlo en .env o como variable de entorno).");
  process.exit(1);
}
const TOKEN = loadToken();

async function notion(endpoint, body) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { console.error(`✖ Notion ${endpoint}: ${res.status} ${await res.text()}`); process.exit(1); }
  return res.json();
}

async function queryAll(dsId, filter) {
  let results = [], cursor;
  do {
    const data = await notion(`data_sources/${dsId}/query`, { ...(filter ? { filter } : {}), ...(cursor ? { start_cursor: cursor } : {}), page_size: 100 });
    results = results.concat(data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

async function blocksOf(id) {
  let results = [], cursor;
  do {
    const data = await notion(`blocks/${id}/children${cursor ? `?start_cursor=${cursor}` : ""}`);
    results = results.concat(data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

// ── Property readers ─────────────────────────────────────────────────────────
const plain = rt => (rt || []).map(t => t.plain_text).join("");
const num   = p => (p && (p.type === "number" ? p.number : p.type === "formula" ? p.formula?.number : null)) ?? null;

// Extrae descripción, sensorial y método del cuerpo de la página de la receta.
async function readBody(pageId) {
  const blocks = await blocksOf(pageId);
  let notas = "", metodo = [], sensorial = {};
  let section = "";
  for (const b of blocks) {
    if (b.type === "heading_2") {
      const h = plain(b.heading_2.rich_text).toUpperCase();
      section = h.includes("DESCRIPCIÓN") ? "desc" : h.includes("SENSORIAL") ? "sens" : h.includes("MÉTODO") ? "met" : "";
    } else if (b.type === "paragraph" && section === "desc" && !notas) {
      notas = plain(b.paragraph.rich_text);
    } else if (b.type === "numbered_list_item" && section === "met") {
      metodo.push(plain(b.numbered_list_item.rich_text));
    } else if (b.type === "table" && section === "sens") {
      const rows = await blocksOf(b.id);
      for (const r of rows) {
        if (r.type !== "table_row") continue;
        const k = plain(r.table_row.cells[0]); const barCell = plain(r.table_row.cells[1]);
        if (!k || k === "Perfil") continue;
        sensorial[k] = (barCell.match(/█/g) || []).length;  // nº de bloques llenos (0–8)
      }
    }
  }
  return { notas, metodo, sensorial };
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("→ Leyendo RECETAS (Tipo = Postre)…");
const recetas = await queryAll(DS_RECETAS, { property: "Tipo", select: { equals: "🍰 Postre" } });

console.log("→ Leyendo INGREDIENTES…");
const ingredientes = await queryAll(DS_INGREDIENTES);

// Agrupa ingredientes por id de receta
const ingByReceta = {};
for (const ing of ingredientes) {
  const rel = ing.properties["RECETAS"]?.relation || [];
  if (!rel.length) continue;
  const nombre = plain(ing.properties["INGREDIENTE"]?.title);
  const cantidad = num(ing.properties["CANTIDAD BASE"]);
  const unidad = ing.properties["UNIDAD"]?.select?.name || plain(ing.properties["UNIDAD"]?.rich_text) || "g";
  let costeUd = num(ing.properties["Coste €/unidad"]) || 0;
  let ejemplo = false;
  if (!costeUd) { costeUd = COSTES_EJEMPLO[nombre] ?? COSTE_EJEMPLO_DEFECTO; ejemplo = true; }
  for (const r of rel) {
    (ingByReceta[r.id] ??= []).push({ nombre, cantidad, unidad, costePorUnidad: costeUd, ...(ejemplo ? { ejemplo: true } : {}) });
  }
}

const tartas = [];
for (const r of recetas) {
  const p = r.properties;
  const body = await readBody(r.id);
  tartas.push({
    id: plain(p["RECETA"]?.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    emoji: r.icon?.emoji || "🍰",
    nombre: plain(p["RECETA"]?.title),
    estado: p["ESTADO"]?.status?.name || "",
    tarrosBatch: num(p["Tarros por batch"]) || 10,
    pvpLocal: num(p["PVP Tarro Local (€)"]),
    pvpDelivery: num(p["PVP Tarro Delivery (€)"]),
    cad: 4,
    alergenos: (p["ALÉRGENOS"]?.multi_select || []).map(a => a.name),
    sensorial: body.sensorial,
    notas: body.notas,
    metodo: body.metodo,
    ingredientes: ingByReceta[r.id] || [],
  });
}

const out =
`/* ============================================================================
 * data.js — DATOS DE LA CALCULADORA DE POSTRES
 * ⚠️ GENERADO por sync-notion.mjs — NO EDITAR A MANO.
 * Fuente: Notion · Chamberí · RECETAS + INGREDIENTES.
 * ========================================================================== */
window.POSTRES_DATA = ${JSON.stringify({
  _meta: {
    fuente: "Notion — DESARROLLO DE POSTRES (Chamberí)",
    generado: new Date().toISOString().slice(0, 10),
    baseUnidad: "1 tarro (370 ml)",
    packagingPorTarro: PACKAGING,
    lotePrefix: LOTE_PREFIX,
    marca: "Chamberí Brothers",
    nota: "Costes con ejemplo:true son provisionales (faltan en Notion: CANT. PACK).",
  },
  tartas,
}, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "data.js"), out, "utf8");
console.log(`✔ data.js generado — ${tartas.length} postres, ${ingredientes.length} líneas de ingredientes leídas.`);
const conEjemplo = tartas.flatMap(t => t.ingredientes).filter(i => i.ejemplo).length;
if (conEjemplo) console.log(`  ⚠️ ${conEjemplo} ingredientes con coste de EJEMPLO (rellena CANT. PACK en Notion para costes reales).`);
