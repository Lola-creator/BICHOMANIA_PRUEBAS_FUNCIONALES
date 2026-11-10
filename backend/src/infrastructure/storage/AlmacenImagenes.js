const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../../uploads");

class AlmacenImagenes {
  eliminar(ruta) {
    if (!ruta || !String(ruta).startsWith("/uploads/")) return;
    const archivo = path.join(uploadDir, path.basename(ruta));
    fs.unlink(archivo, (err) => {
      if (err) console.log("⚠ No se pudo borrar imagen:", ruta);
    });
  }
}

module.exports = AlmacenImagenes;