/**
 * BACKEND: server.js
 *
 * INSTRUCCIONES:
 * 1. Crea una carpeta "server" en la raíz de tu proyecto
 * 2. Dentro, copia este archivo como "server.js"
 * 3. Crea package.json (ver abajo)
 * 4. npm install
 * 5. npm start
 *
 * El servidor corre en http://localhost:3000
 * Tu saudade.html debe estar en: ./public/saudade.html
 */
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "..")));

// Directorio donde guardar imágenes
const SD_DIR = path.join(__dirname, "../resources/SD");

// Crear directorio si no existe
if (!fs.existsSync(SD_DIR)) {
  fs.mkdirSync(SD_DIR, { recursive: true });
  console.log(`✓ Directorio creado: ${SD_DIR}`);
}
app.post("/api/upload-sd", (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData)
      return res.status(400).json({ error: "No se envió imageData" });

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const nextNumber = findNextSDNumber();
    const filename = `sd_${nextNumber}.png`;
    const filepath = path.join(SD_DIR, filename);

    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

    return res.json({
      status: "ok",
      filename,
      number: nextNumber,
      path: `/resources/SD/${filename}`,
    });
  } catch (error) {
    console.error("Error en /api/upload-sd:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── HELPER: Siguiente número par (sin padding) ──
function findNextSDNumber() {
  try {
    const files = fs.readdirSync(SD_DIR).filter((f) => /^sd_\d+\.png$/.test(f));

    if (files.length === 0) return 2;

    const numbers = files
      .map((f) => {
        const match = f.match(/sd_(\d+)\.png/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n) => n !== null)
      .sort((a, b) => a - b);

    if (numbers.length === 0) return 2;

    const maxNum = Math.max(...numbers);
    return maxNum % 2 === 0 ? maxNum + 2 : maxNum + 1;
  } catch (error) {
    console.error("Error en findNextSDNumber:", error);
    return 2;
  }
}
// ── HELPER: Encontrar siguiente número par ──
function findNextSDNumber() {
  // Leer archivos existentes
  const files = fs.readdirSync(SD_DIR).filter((f) => f.match(/^sd_\d+\.png$/));

  if (files.length === 0) return 2; // Primero es SD-02

  // Extraer números
  const numbers = files
    .map((f) => parseInt(f.match(/\d+/)[0]))
    .sort((a, b) => a - b);

  // Siguiente par después del máximo
  const maxNum = Math.max(...numbers);
  const nextNum = maxNum % 2 === 0 ? maxNum + 2 : maxNum + 1;

  return nextNum;
}

// ── HEALTH CHECK ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Saudade backend running" });
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`\n════════════════════════════════════════`);
  console.log(`  🌙 Saudade Backend`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  SD directory: ${SD_DIR}`);
  console.log(`════════════════════════════════════════\n`);
});
