import fs from "fs";
import { createRequire } from 'module';
import Tesseract from 'tesseract.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

class FileProcessor {
  // Procesar PDF para extraer texto y datos
  static async processPDF(filePath) {
    try {
      console.log("Procesando PDF:", filePath);

      // Leer el PDF como buffer
      const fileBuffer = fs.readFileSync(filePath);

      // Intentar extraer texto usando pdf-parse (para PDFs digitales)
      const pdfData = await pdfParse(fileBuffer);
      let text = pdfData.text;
      
      console.log("Texto extraído del PDF (longitud):", text.length);

      // Si el texto está vacío o muy corto, probablemente es un PDF escaneado
      if (!text || text.trim().length < 50) {
        console.log("⚠️ PDF parece estar escaneado (poco o ningún texto). Intentando OCR...");
        text = await this.processScannedPDF(filePath);
      }

      console.log("Texto extraído del PDF:", text.substring(0, 500) + "...");

      // Extraer datos del remito del texto
      const receiptData = this.extractReceiptDataFromText(text);

      // Si no se encontraron productos, crear un producto por defecto
      if (receiptData.products.length === 0) {
        receiptData.products = [
          {
            name: "Producto extraído de PDF",
            description: "Extraído automáticamente del PDF",
            quantity: 1,
            unit_price: 0,
          },
        ];
      }

      return {
        success: true,
        text,
        data: receiptData,
      };
    } catch (error) {
      console.error("Error procesando PDF:", error);
      throw new Error("Error al procesar el archivo PDF: " + error.message);
    }
  }

  // Procesar PDF escaneado usando OCR con Tesseract
  static async processScannedPDF(filePath) {
    try {
      console.log("🔍 Iniciando OCR en PDF escaneado...");
      
      // Por ahora, retornar un mensaje indicando que es un PDF escaneado
      // En una implementación completa, necesitarías:
      // 1. Convertir PDF a imágenes (usando pdf-poppler o similar)
      // 2. Aplicar OCR a cada imagen con Tesseract
      
      console.log("⚠️ Detección de PDF escaneado: se requiere conversión PDF->imagen");
      console.log("💡 Sugerencia: Para PDFs escaneados, convierte primero a imágenes");
      
      return "PDF escaneado detectado - requiere procesamiento OCR adicional";
      
    } catch (error) {
      console.error("Error en OCR:", error);
      return "";
    }
  }

  // Procesar imagen directamente con OCR (para imágenes JPG, PNG, etc.)
  static async processImageWithOCR(filePath) {
    try {
      console.log("🔍 Procesando imagen con OCR:", filePath);

      const result = await Tesseract.recognize(filePath, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR progreso: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      console.log("✅ OCR completado");
      return result.data.text;

    } catch (error) {
      console.error("Error en OCR de imagen:", error);
      throw new Error("Error al procesar imagen con OCR: " + error.message);
    }
  }

  // Extraer datos del remito del texto
  static extractReceiptDataFromText(text) {
    const data = {
      warehouse_id: 1, // Por defecto
      entry_date: new Date().toISOString().split("T")[0],
      order_id: null,
      status: "Pending",
      products: [],
    };

    // Buscar fecha en el texto (múltiples formatos)
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

    // Buscar número de orden (múltiples patrones)
    const orderRegexes = [
      /(?:orden|order|pedido|pedido\s+no\.?|n[úu]mero|remito|remito\s+no\.?)\s*:?\s*([A-Z0-9\-]+)/i,
      /(?:ref|referencia|ref\.?)\s*:?\s*([A-Z0-9\-]+)/i,
      /(?:cod|codigo|código)\s*:?\s*([A-Z0-9\-]+)/i,
    ];
    for (const regex of orderRegexes) {
      const orderMatch = text.match(regex);
      if (orderMatch) {
        data.order_id = orderMatch[1];
        break;
      }
    }

    // Buscar productos con patrones de cantidad, nombre y precio
    // Limitar cantidades a máximo 6 dígitos para evitar confusión con teléfonos
    const productPatterns = [
      /(\d{1,6})\s+([A-Za-z0-9\s\-\.]+?)\s+(\d+(?:\.\d+)?)/gm, // cantidad + nombre + precio
      /(\d{1,6})\s+([A-Za-z0-9\s\-\.]+)/gm, // cantidad + nombre
      /([A-Za-z0-9\s\-\.]+?)\s+(\d{1,6})\s+(\d+(?:\.\d+)?)/gm, // nombre + cantidad + precio
      /([A-Za-z0-9\s\-\.]+?)\s+(\d{1,6})/gm, // nombre + cantidad
    ];
    for (const pattern of productPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let quantity, name, price;
        if (pattern === productPatterns[0] || pattern === productPatterns[1]) {
          quantity = parseInt(match[1]);
          name = match[2].trim();
          price = match[3] ? parseFloat(match[3]) : 0;
        } else {
          name = match[1].trim();
          quantity = parseInt(match[2]);
          price = match[3] ? parseFloat(match[3]) : 0;
        }
        
        // Validar cantidad razonable (evitar teléfonos y números muy grandes)
        const isReasonableQuantity = quantity > 0 && quantity <= 999999;
        const isValidName = name.length > 2 && !this.isCommonWord(name);
        const isNotPhoneNumber = !this.looksLikePhoneNumber(name + " " + quantity);
        
        if (isReasonableQuantity && isValidName && isNotPhoneNumber) {
          data.products.push({
            name,
            description: "",
            quantity,
            unit_price: price || 0,
          });
        }
      }
    }

    // Filtrar productos duplicados
    data.products = this.removeDuplicateProducts(data.products);

    return data;
  }

  static isCommonWord(word) {
    const commonWords = [
      "total","subtotal","iva","impuesto","descuento","precio","cantidad",
      "producto","item","articulo","unidad","pieza","metro","kg","litro",
      "fecha","hora","cliente","proveedor","empresa","direccion","telefono",
      "email","web","pagina","numero","codigo","referencia","orden","pedido",
      "remito","factura","nota","recibo","comprobante",
    ];
    return commonWords.includes(word.toLowerCase());
  }

  static looksLikePhoneNumber(text) {
    // Detectar patrones de teléfono comunes
    const phonePatterns = [
      /\b\d{10}\b/,           // 2995954318
      /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/,  // 299-595-4318 o 299 595 4318
      /\b\d{2}[-\s]?\d{4}[-\s]?\d{4}\b/,  // 29-9595-4318
      /\b15[-\s]?\d{4}[-\s]?\d{4}\b/,     // 15-1234-5678
      /\btel[eé]fono|phone|cel|contacto/i, // Palabras relacionadas
    ];
    
    return phonePatterns.some(pattern => pattern.test(text));
  }

  static removeDuplicateProducts(products) {
    const seen = new Set();
    return products.filter(p => {
      const key = p.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

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
