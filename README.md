# 🧮 Calculadora de Postres — Chamberí Brothers

Calculadora de producción de tartas en tarro (cheesecakes), gemela de la
[calculadora de salsas](https://pacocartones.github.io/calculadora-salsas/).
Escala cantidades por nº de tarros, calcula costes/márgenes/food cost y genera
nº de lote `TT-AAAAMMDD-NNN` con trazabilidad para la DB **PRODUCCIONES**.

- **Unidad base:** 1 tarro (370 ml)
- **Packaging:** +0,82 € por tarro
- **Fuente de datos:** Notion (workspace Chamberí) → DBs **RECETAS** + **INGREDIENTES**

## 📂 Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La calculadora (HTML+CSS+JS autocontenido). Lee `data.js`. |
| `data.js` | Datos **generados desde Notion**. No editar a mano. |
| `sync-notion.mjs` | Script que regenera `data.js` desde Notion. |
| `.env` | Tu `NOTION_TOKEN` (no se sube a git). |

## 🔄 Actualizar los datos desde Notion
Cada vez que cambie una receta o ingrediente en Notion:

```bash
cp .env.example .env        # solo la primera vez; pega tu NOTION_TOKEN
node sync-notion.mjs        # regenera data.js desde Notion
git add data.js && git commit -m "sync postres" && git push
```
Requiere **Node 18+**. El token sale de una integración de Notion con acceso a
las DBs RECETAS e INGREDIENTES (las mismas que ya usa el resto del proyecto).

> ¿Por qué no consulta Notion "en vivo"? GitHub Pages es estático y no puede
> guardar el token de forma segura ni saltarse el CORS de Notion. El patrón
> correcto es este: Notion es la fuente de verdad y `sync-notion.mjs` hornea
> un `data.js` que la web carga. "Republicar" = volver a sincronizar + push.

## 🌐 Publicar en GitHub Pages
1. Sube esta carpeta a un repo (p. ej. `LeonMAG/calculadora-postres`).
2. Settings → Pages → Branch `main` / carpeta raíz.
3. Quedará en `https://<usuario>.github.io/calculadora-postres/`.
4. Pega ese enlace como `embed` en la página de Notion **LABORATORIO DE TARTAS**
   (igual que el embed de la calculadora de salsas en LABORATORIO DE SALSAS).

## ⚠️ Costes de ejemplo
Los ingredientes cuyo coste falta en Notion (porque falta **CANT. PACK** en
INVENTARIO) reciben un coste **de ejemplo** y se marcan con `coste ej.` en la
interfaz. En cuanto rellenes las fichas técnicas y vuelvas a sincronizar, los
costes pasan a ser reales automáticamente.

Ingredientes pendientes de coste real (a fecha del último sync): todos los de
ambas cheesecakes. Además, el método menciona **gelatina** que aún no figura
como línea de ingrediente en Notion — conviene añadirla.
