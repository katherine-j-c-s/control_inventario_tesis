import fs from "fs";
import { createRequire } from "module";
import Tesseract from "tesseract.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

class FileProcessor {
  // Procesar PDF
  static async processPDF(filePath) {
    try {
      console.log("📄 Procesando PDF:", filePath);

      const fileBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(fileBuffer);
      let text = pdfData.text || "";

      console.log("🧾 Texto extraído (longitud):", text.length);

      // Si el PDF no tiene texto (escaneado)
      if (!text || text.trim().length < 50) {
        console.log("⚠️ PDF parece escaneado. Intentando OCR...");
        text = await this.processScannedPDF(filePath);
      }

      // Extraer datos
      const receiptData = this.extractReceiptDataFromText(text);

      if (!receiptData.products || receiptData.products.length === 0) {
        console.warn("⚠️ No se detectaron productos, creando uno por defecto.");
        receiptData.products = [
          {
            name: "Producto extraído de PDF",
            description: "Extraído automáticamente del PDF",
            quantity: 1,
            unit_price: 0,
          },
        ];
      }

      return { success: true, text, data: receiptData };
    } catch (error) {
      console.error("❌ Error procesando PDF:", error);
      throw new Error("Error al procesar el archivo PDF: " + error.message);
    }
  }

  // Procesar PDF escaneado (OCR)
  static async processScannedPDF(filePath) {
    try {
      console.log("🔍 Iniciando OCR...");
      const result = await Tesseract.recognize(filePath, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`🧠 OCR progreso: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      console.log("✅ OCR completado");
      return result.data.text;
    } catch (error) {
      console.error("❌ Error en OCR:", error);
      return "";
    }
  }

  // Procesar imagen directamente
  static async processImageWithOCR(filePath) {
    try {
      console.log("🖼️ Procesando imagen con OCR:", filePath);
      const result = await Tesseract.recognize(filePath, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`📊 OCR progreso: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      console.log("✅ OCR completado");
      return result.data.text;
    } catch (error) {
      console.error("❌ Error en OCR de imagen:", error);
      throw new Error("Error al procesar imagen con OCR: " + error.message);
    }
  }

  // 🔹 Extraer datos del remito del texto
  static extractReceiptDataFromText(text) {
    const data = {
      warehouse_id: 1,
      entry_date: new Date().toISOString().split("T")[0],
      order_id: null,
      status: "Pending",
      products: [],
    };

    if (!text || typeof text !== "string") return data;

    // Normalizar texto
    text = text
      .replace(/\u00A0/g, " ")
      .replace(/\r\n?/g, "\n")
      .replace(/\t/g, " ")
      .replace(/ +/g, " ")
      .trim();

    // 🔹 Buscar fecha
    const dateRegexes = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
      /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi,
      /(\d{1,2}\s+\w+\s+\d{4})/gi,
    ];
    for (const regex of dateRegexes) {
      const dateMatch = text.match(regex);
      if (dateMatch) {
        data.entry_date = this.formatDate(dateMatch[0]);
        break;
      }
    }

    // 🔹 Buscar número de remito / orden
    const orderRegex =
      /(remito|orden|n[°º]\s*|pedido)\s*:?\s*(\d{1,6})/i;
    const orderMatch = text.match(orderRegex);
    if (orderMatch) {
      data.order_id = orderMatch[2];
    } else {
      // Generar uno único si no lo encuentra
      data.order_id = "ORD-" + Date.now().toString().slice(-6);
    }

    // 🔹 Buscar productos (nombre $precio cantidad descripción)
    const productRegex =
      /^([A-Za-zÁÉÍÓÚÜÑ0-9\s\.\-]+?)\s+\$?([\d\.,]+)\s+(\d{1,6})\s+([A-Za-zÁÉÍÓÚÜÑ0-9\s\.\-]+)/gm;

    let match;
    while ((match = productRegex.exec(text)) !== null) {
      const name = match[1].trim();
      const price = parseFloat(match[2].replace(/[^\d,\.]/g, "").replace(",", ".")) || 0;
      const quantity = parseInt(match[3]);
      const description = match[4].trim();

      if (
        name &&
        price > 0 &&
        quantity > 0 &&
        !this.isCommonWord(name) &&
        !isNaN(quantity) &&
        this.isLikelyProductName(name)
      ) {
        data.products.push({
          name,
          description,
          quantity,
          unit_price: price,
        });
      }
    }

    // Fallback (por si falla el regex principal)
    if (data.products.length === 0) {
      const fallbackRegex = /^([A-Za-zÁÉÍÓÚÜÑ0-9\s\.\-]+?)\s+\$?([\d\.,]+)/gm;
      while ((match = fallbackRegex.exec(text)) !== null) {
        const name = match[1].trim();
        const price = parseFloat(match[2].replace(/[^\d,\.]/g, "").replace(",", ".")) || 0;
        if (name && price > 0 && !this.isCommonWord(name) && this.isLikelyProductName(name)) {
          data.products.push({
            name,
            description: "",
            quantity: 1,
            unit_price: price,
          });
        }
      }
    }

    // 🔹 Eliminar duplicados
    data.products = this.removeDuplicateProducts(data.products);

    return data;
  }

  // Validar si un nombre es probablemente un producto real
  static isLikelyProductName(name) {
    if (!name || typeof name !== "string") return false;

    // Descartar si contiene patrones numéricos tipo teléfono o código: 15-1234-5678, 11/2345/6789
    if (/\d{2,}[-\/]\d+/.test(name)) return false;

    // Descartar si contiene palabras típicas de direcciones
    if (/\b(calle|av|avenida|ruta|barrio|provincia|ciudad|localidad|piso|dpto)\b/i.test(name)) return false;

    // Descartar si parece una fecha con mes en texto: "15 de Octubre de", "20 de enero"
    if (/\b\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i.test(name)) return false;

    // Debe tener al menos una palabra alfabética con mínimo 2 letras consecutivas
    if (!/[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(name)) return false;

    return true;
  }

  // Palabras comunes que no deben considerarse productos
  static isCommonWord(word) {
    const commonWords = [
      "total","subtotal","iva","impuesto","descuento","precio","cantidad",
      "producto","unidad","fecha","hora","cliente","empresa","direccion",
      "telefono","contacto","pago","remito","presupuesto","informacion","envio"
    ];
    return commonWords.includes(word.toLowerCase());
  }

  // Evitar duplicados por nombre
  static removeDuplicateProducts(products) {
    const seen = new Set();
    return products.filter((p) => {
      const key = p.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Formato de fecha
  static formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }
}

export default FileProcessor;
