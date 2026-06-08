/* ============================================================================
 * data.js — DATOS DE LA CALCULADORA DE POSTRES
 * ----------------------------------------------------------------------------
 * ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE por sync-notion.mjs — NO EDITAR A MANO.
 * Fuente de verdad: Notion · workspace Chamberí · DBs RECETAS + INGREDIENTES.
 * Para regenerar: `node sync-notion.mjs` (ver README.md).
 *
 * Los ingredientes cuyo coste está vacío en Notion (falta CANT. PACK) reciben
 * un coste de EJEMPLO desde la tabla de respaldo del sync (campo "ejemplo": true).
 * En cuanto se rellenen las fichas técnicas en Notion, el sync los sustituye
 * por los costes reales automáticamente.
 * ========================================================================== */
window.POSTRES_DATA = {
  _meta: {
    fuente: "Notion — DESARROLLO DE POSTRES (Chamberí)",
    generado: "2026-06-08",
    baseUnidad: "1 tarro (370 ml)",
    packagingPorTarro: 0.82,
    lotePrefix: "TT",
    marca: "Chamberí Brothers",
    nota: "Costes con ejemplo:true son provisionales (faltan en Notion). Sustituir rellenando CANT. PACK en INVENTARIO."
  },
  tartas: [
    {
      id: "cheesecake-oreo",
      emoji: "🍪",
      nombre: "Cheesecake Oreo",
      categoria: "🍰 Cheesecake",
      estado: "DESARROLLADA",
      tarrosBatch: 10,
      pvpLocal: null,
      pvpDelivery: 7.97,
      cad: 4,
      alergenos: ["🥛 Lácteos", "🌾 Gluten"],
      sensorial: { Dulzor: 4, Cremosidad: 5, "Intensidad galleta": 6, Frescura: 2 },
      notas: "Cheesecake sin horno, textura mousse ultracremosa con triple capa de Oreo: base crujiente, mezcla interior y topping. La más pedida. Sabor intenso a galleta con equilibrio lácteo.",
      metodo: [
        "Triturar Oreos (base) hasta polvo — mezclar con mantequilla fundida",
        "Repartir en tarros y compactar — refrigerar 15 min",
        "Hidratar gelatina en agua fría",
        "Calentar nata sin hervir — disolver gelatina",
        "Batir queso crema + azúcar glacé hasta suave",
        "Incorporar nata templada a la mezcla de queso",
        "Trocear Oreos (mezcla) en trozos irregulares — incorporar con espátula",
        "Verter sobre bases — dar unos golpecitos al tarro para nivelar",
        "Refrigerar mínimo 4 horas",
        "Colocar Oreo entera de topping — sellar con tapa + pegatina"
      ],
      ingredientes: [
        { nombre: "Oreo — base triturada",            cantidad: 40,   unidad: "g",  costePorUnidad: 0.0057, ejemplo: true },
        { nombre: "Mantequilla",                       cantidad: 17.5, unidad: "g",  costePorUnidad: 0.0080, ejemplo: true },
        { nombre: "Queso crema",                       cantidad: 100,  unidad: "g",  costePorUnidad: 0.0060, ejemplo: true },
        { nombre: "Azúcar glacé",                      cantidad: 20,   unidad: "g",  costePorUnidad: 0.0020, ejemplo: true },
        { nombre: "Nata 35%",                          cantidad: 40,   unidad: "ml", costePorUnidad: 0.0030, ejemplo: true },
        { nombre: "Oreo troceada — mezcla interior",   cantidad: 15.4, unidad: "g",  costePorUnidad: 0.0057, ejemplo: true },
        { nombre: "Extracto de vainilla",              cantidad: 0.3,  unidad: "ml", costePorUnidad: 0.0500, ejemplo: true },
        { nombre: "Oreo — topping entera",             cantidad: 11,   unidad: "g",  costePorUnidad: 0.0057, ejemplo: true }
      ]
    },
    {
      id: "cheesecake-coco",
      emoji: "🥥",
      nombre: "Cheesecake Coco",
      categoria: "🍰 Cheesecake",
      estado: "DESARROLLADA",
      tarrosBatch: 10,
      pvpLocal: null,
      pvpDelivery: 7.97,
      cad: 4,
      alergenos: ["🥛 Lácteos", "🌾 Gluten"],
      sensorial: { Dulzor: 3, Cremosidad: 5, Frescura: 4, Intensidad: 2 },
      notas: "Cheesecake sin horno, textura mousse cremosa con base de galleta María y mantequilla. Sabor a coco auténtico con coco rallado en la mezcla y trozos en el topping. Ligera y fresca.",
      metodo: [
        "Triturar galleta María hasta polvo fino",
        "Mezclar con mantequilla fundida — consistencia de arena húmeda",
        "Repartir en tarros y compactar bien la base — refrigerar 15 min",
        "Hidratar gelatina en agua fría",
        "Calentar nata sin hervir — disolver gelatina hidratada",
        "Batir queso crema + azúcar glacé + vainilla hasta homogéneo",
        "Incorporar nata con gelatina templada a la mezcla de queso",
        "Añadir coco rallado — mezclar con espátula suavemente",
        "Verter sobre bases en tarros — dejar espacio para topping",
        "Refrigerar mínimo 4 horas (idealmente noche)",
        "Decorar con trozos de coco y sellar con tapa + pegatina"
      ],
      ingredientes: [
        { nombre: "Galleta María — base",          cantidad: 40,   unidad: "g",  costePorUnidad: 0.0024, ejemplo: true },
        { nombre: "Mantequilla",                   cantidad: 17.5, unidad: "g",  costePorUnidad: 0.0080, ejemplo: true },
        { nombre: "Queso crema",                   cantidad: 100,  unidad: "g",  costePorUnidad: 0.0060, ejemplo: true },
        { nombre: "Azúcar glacé",                  cantidad: 20,   unidad: "g",  costePorUnidad: 0.0020, ejemplo: true },
        { nombre: "Nata 35%",                      cantidad: 40,   unidad: "ml", costePorUnidad: 0.0030, ejemplo: true },
        { nombre: "Coco rallado",                  cantidad: 8,    unidad: "g",  costePorUnidad: 0.0075, ejemplo: true },
        { nombre: "Extracto de vainilla",          cantidad: 0.3,  unidad: "ml", costePorUnidad: 0.0500, ejemplo: true },
        { nombre: "Trozos coco deshidratado",      cantidad: 3,    unidad: "g",  costePorUnidad: 0.0130, ejemplo: true }
      ]
    }
  ]
};
