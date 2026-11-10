const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../../uploads"); // ajusta si tu estructura es distinta

class AlmacenImagenes {
  eliminar(ruta) {
    if (!ruta || !String(ruta).startsWith("/uploads/")) return; // null o URLs de Supabase
    const archivo = path.join(uploadDir, path.basename(ruta));
    fs.unlink(archivo, (err) => {
      if (err) console.log("⚠ No se pudo borrar imagen:", ruta);
    });
  }
}

module.exports = AlmacenImagenes;