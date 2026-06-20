# 🧮 Calculadora de Postres — Chamberí Brothers

Calculadora de producción de tartas en tarro (cheesecakes), gemela de la
[calculadora de salsas](https://tweakeo.github.io/calculadora-salsas/).
Escala cantidades por nº de tarros, calcula costes/márgenes/food cost y genera
nº de lote `TT-AAAAMMDD-NNN` con trazabilidad para la DB **PRODUCCIONES**.

- **Unidad base:** 1 tarro (370 ml)
- **Packaging:** +0,82 € por tarro
- **Fuente de datos:** Notion (workspace Chamberí) → DBs **RECETAS** + **INGREDIENTES**

## ✅ Qué recetas aparecen en la web

Solo aparecen las recetas de la DB **RECETAS** que cumplen **las dos** condiciones:

1. `Tipo = 🍰 Postre`
2. `ESTADO = DESARROLLADA`

Las recetas en `SIN DESARROLLO` o `DESARROLLANDO` **no se sincronizan** y no se
ven en la calculadora. Para publicar una receta nueva basta con ponerle
`ESTADO = DESARROLLADA` en Notion (y que tenga sus ingredientes en INGREDIENTES).

## 📂 Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La calculadora (HTML+CSS+JS autocontenido). Lee `data.js`. |
| `data.js` | Datos **generados desde Notion**. No editar a mano. |
| `sync-notion.mjs` | Script que regenera `data.js` desde Notion. |
| `.github/workflows/sync-notion.yml` | Sincroniza solo en GitHub (programado + manual). |
| `.env` | Tu `NOTION_TOKEN` para correr el sync en local (no se sube a git). |

## 🔄 Cómo se actualiza la web (arquitectura)

> **La web NO consulta Notion en vivo.** GitHub Pages es estático: no puede
> guardar el token de forma segura ni saltarse el CORS de Notion. El patrón es:
> Notion es la fuente de verdad → `sync-notion.mjs` "hornea" un `data.js` →
> la web carga ese `data.js`. **Actualizar = volver a sincronizar + push.**

Hay **3 maneras** de lanzar esa sincronización. No hay que elegir una: conviven.

### 1) Automático cada 30 min (ya activo, sin hacer nada)
El workflow `sync-notion.yml` corre en GitHub cada 30 minutos: lee Notion y, si
algo cambió, actualiza `data.js` y republica. Marca una receta como
`DESARROLLADA` y en ≤30 min estará en la web. **Es el modo por defecto.**

### 2) Manual desde GitHub (instantáneo)
GitHub → pestaña **Actions** → workflow **“Sync desde Notion”** → **Run workflow**.
Tarda ~30 s. Útil si no quieres esperar al ciclo automático.

### 3) Manual desde tu ordenador
```bash
cp .env.example .env        # solo la primera vez; pega tu NOTION_TOKEN
node sync-notion.mjs        # regenera data.js desde Notion
git add data.js && git commit -m "sync postres" && git push
```
Requiere **Node 18+**. El token sale de la integración de Notion con acceso a
RECETAS e INGREDIENTES (el secret `NOTION_TOKEN` ya está configurado en GitHub
para los modos 1 y 2).

## 🟢 Botón “Sincronizar” desde Notion (opcional, instantáneo)

Para disparar la sincronización con un botón dentro de Notion necesitas un
pequeño “relay” que llame a la API de GitHub con autenticación (Notion por sí
solo no puede mandar la cabecera `Authorization` de GitHub). El endpoint a llamar
es:

```
POST https://api.github.com/repos/tweakeo/calculadora-postres/dispatches
Headers: Authorization: Bearer <PAT>   ·   Accept: application/vnd.github+json
Body:    { "event_type": "sync-notion" }
```

Eso dispara el modo (3) `repository_dispatch` del workflow. Dos formas de montarlo:

### Opción A — Make.com / Zapier / Pipedream (no-code, recomendada)
1. Crea un escenario con disparador **Webhook** → copia su URL.
2. En Notion: añade un **botón** (o una **automatización de base de datos**:
   *Cuando ESTADO → DESARROLLADA → Enviar webhook*) que llame a esa URL.
3. En Make/Zapier, paso siguiente: **HTTP → POST** al endpoint de arriba con la
   cabecera `Authorization: Bearer <PAT>` y el body `{"event_type":"sync-notion"}`.
4. El PAT es un **fine-grained token** de GitHub con permiso *Contents: Read/Write*
   limitado a este repo. Guárdalo en el relay, **nunca en Notion**.

### Opción B — Cloudflare Worker (gratis, self-hosted)
Despliega este worker y pon su URL en un botón de Notion (“Abrir enlace”):
```js
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.searchParams.get("key") !== env.SECRET) return new Response("no", { status: 403 });
    const repo = url.pathname.includes("salsas") ? "calculadora-salsas" : "calculadora-postres";
    await fetch(`https://api.github.com/repos/tweakeo/${repo}/dispatches`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GH_PAT}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "notion-sync",
      },
      body: JSON.stringify({ event_type: "sync-notion" }),
    });
    return new Response("Sync lanzado ✅");
  },
};
```
Secrets del worker: `GH_PAT` (fine-grained, Contents R/W sobre los 2 repos) y
`SECRET` (cadena aleatoria). El botón de Notion abre
`https://<worker>.workers.dev/postres?key=<SECRET>`.

> **¿Hace falta el botón?** No es imprescindible: con el modo (1) la web ya se
> mantiene sola cada 30 min. El botón solo sirve para que el cambio sea inmediato.

## ⚠️ Costes de ejemplo
Los ingredientes cuyo coste falta en Notion (porque falta **CANT. PACK** en
INVENTARIO) reciben un coste **de ejemplo** y se marcan con `coste ej.` en la
interfaz. En cuanto rellenes las fichas técnicas y vuelvas a sincronizar, los
costes pasan a ser reales automáticamente.
