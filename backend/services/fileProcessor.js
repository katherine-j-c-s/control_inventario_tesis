const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pdf2pic = require('pdf2pic');

class FileProcessor {
  
  static async processPDF(filePath) {
    try {
      console.log('Procesando PDF:', filePath);
      
      // Convertir PDF a imagen usando pdf2pic
      const convert = pdf2pic.fromPath(filePath, {
        density: 100,
        saveFilename: "converted",
        savePath: path.dirname(filePath),
        format: "png",
        width: 2000,
        height: 2000
      });
      
      // Convertir solo la primera página
      const result = await convert(1, { responseType: "image" });
      
      if (!result || result.length === 0) {
        throw new Error('No se pudo convertir el PDF a imagen');
      }
      
      const imagePath = result[0].path;
      console.log('PDF convertido a imagen:', imagePath);
      
      // Procesar la imagen con OCR
      const { data: { text } } = await Tesseract.recognize(imagePath, 'spa', {
        logger: m => console.log(m)
      });
      
      console.log('Texto extraído del PDF:', text.substring(0, 500) + '...');
      
      // Extraer datos del remito del texto
      const receiptData = this.extractReceiptDataFromText(text);
      
      // Si no se encontraron productos, crear un producto por defecto
      if (receiptData.products.length === 0) {
        receiptData.products = [
          {
            name: 'Producto extraído de PDF',
            description: 'Extraído automáticamente del PDF',
            quantity: 1,
            unit_price: 0
          }
        ];
      }
      
      // Limpiar archivo temporal de imagen
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupError) {
        console.warn('No se pudo limpiar archivo temporal:', cleanupError.message);
      }
      
      return {
        success: true,
        text: text,
        data: receiptData
      };
    } catch (error) {
      console.error('Error procesando PDF:', error);
      throw new Error('Error al procesar el archivo PDF: ' + error.message);
    }
  }
  
  static async processImage(filePath) {
    try {
      console.log('Procesando imagen:', filePath);
      
      // Procesar la imagen con Sharp para mejorar la calidad
      const processedImageBuffer = await sharp(filePath)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .sharpen()
        .normalize()
        .png()
        .toBuffer();
      
      // Guardar la imagen procesada temporalmente
      const processedImagePath = filePath.replace(/\.[^/.]+$/, '_processed.png');
      fs.writeFileSync(processedImagePath, processedImageBuffer);
      
      // Usar Tesseract para extraer texto de la imagen
      const { data: { text } } = await Tesseract.recognize(processedImagePath, 'spa', {
        logger: m => console.log(m)
      });
      
      console.log('Texto extraído de la imagen:', text.substring(0, 500) + '...');
      
      // Extraer datos del remito del texto
      const receiptData = this.extractReceiptDataFromText(text);
      
      // Si no se encontraron productos, crear un producto por defecto
      if (receiptData.products.length === 0) {
        receiptData.products = [
          {
            name: 'Producto extraído de imagen',
            description: 'Extraído automáticamente de la imagen',
            quantity: 1,
            unit_price: 0
          }
        ];
      }
      
      // Limpiar archivo temporal
      fs.unlinkSync(processedImagePath);
      
      return {
        success: true,
        text: text,
        data: receiptData
      };
    } catch (error) {
      console.error('Error procesando imagen:', error);
      throw new Error('Error al procesar la imagen: ' + error.message);
    }
  }
  
  static async processCSV(filePath) {
    try {
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo CSV debe tener al menos una fila de datos');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = ['warehouse_id', 'entry_date', 'order_id', 'status', 'product_name', 'description', 'quantity', 'unit_price'];
      
      // Validar headers
      const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
      if (!hasValidHeaders) {
        throw new Error('El archivo CSV debe contener las columnas: ' + expectedHeaders.join(', '));
      }
      
      // Parsear datos
      const fileData = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          fileData.push(row);
        }
      }
      
      const receiptData = {
        warehouse_id: parseInt(fileData[0].warehouse_id),
        entry_date: fileData[0].entry_date,
        order_id: fileData[0].order_id ? parseInt(fileData[0].order_id) : null,
        status: fileData[0].status || 'Pending',
        products: fileData.map(row => ({
          name: row.product_name,
          description: row.description || '',
          quantity: parseInt(row.quantity),
          unit_price: parseFloat(row.unit_price) || 0
        }))
      };
      
      return {
        success: true,
        data: receiptData
      };
    } catch (error) {
      console.error('Error procesando CSV:', error);
      throw new Error('Error al procesar el archivo CSV: ' + error.message);
    }
  }
  
  // Extraer datos del remito del texto extraído
  static extractReceiptDataFromText(text) {
    const data = {
      warehouse_id: 1, // Por defecto
      entry_date: new Date().toISOString().split('T')[0],
      order_id: null,
      status: 'Pending',
      products: []
    };
    
    // Buscar fecha en el texto (múltiples formatos)
    const dateRegexes = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
      /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi,
      /(\d{1,2}\s+\w+\s+\d{4})/gi
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
      /(?:cod|codigo|código)\s*:?\s*([A-Z0-9\-]+)/i
    ];
    
    for (const regex of orderRegexes) {
      const orderMatch = text.match(regex);
      if (orderMatch) {
        data.order_id = orderMatch[1];
        break;
      }
    }
    
    // Buscar productos con múltiples patrones
    const productPatterns = [
      // Patrón: cantidad + nombre + precio
      /(\d+)\s+([A-Za-z0-9\s\-\.]+?)\s+(\d+(?:\.\d+)?)\s*$/gm,
      // Patrón: cantidad + nombre (sin precio)
      /(\d+)\s+([A-Za-z0-9\s\-\.]+?)(?:\s|$)/gm,
      // Patrón: nombre + cantidad + precio
      /([A-Za-z0-9\s\-\.]+?)\s+(\d+)\s+(\d+(?:\.\d+)?)\s*$/gm,
      // Patrón: nombre + cantidad (sin precio)
      /([A-Za-z0-9\s\-\.]+?)\s+(\d+)(?:\s|$)/gm
    ];
    
    for (const pattern of productPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let quantity, name, price;
        
        if (pattern === productPatterns[0] || pattern === productPatterns[1]) {
          // Patrones que empiezan con cantidad
          quantity = parseInt(match[1]);
          name = match[2].trim();
          price = match[3] ? parseFloat(match[3]) : 0;
        } else {
          // Patrones que empiezan con nombre
          name = match[1].trim();
          quantity = parseInt(match[2]);
          price = match[3] ? parseFloat(match[3]) : 0;
        }
        
        if (quantity > 0 && name.length > 2 && !this.isCommonWord(name)) {
          data.products.push({
            name: name,
            description: '',
            quantity: quantity,
            unit_price: price || 0
          });
        }
      }
    }
    
    // Si no se encontraron productos con los patrones anteriores, buscar líneas que contengan números
    if (data.products.length === 0) {
      const lines = text.split('\n');
      lines.forEach(line => {
        const words = line.trim().split(/\s+/);
        if (words.length >= 2) {
          const firstWord = words[0];
          const lastWord = words[words.length - 1];
          
          // Si el primer elemento es un número y el último también
          if (!isNaN(firstWord) && !isNaN(lastWord) && firstWord > 0) {
            const quantity = parseInt(firstWord);
            const price = parseFloat(lastWord);
            const name = words.slice(1, -1).join(' ').trim();
            
            if (name.length > 2 && !this.isCommonWord(name)) {
              data.products.push({
                name: name,
                description: '',
                quantity: quantity,
                unit_price: price || 0
              });
            }
          }
        }
      });
    }
    
    // Filtrar productos duplicados
    data.products = this.removeDuplicateProducts(data.products);
    
    return data;
  }
  
  // Verificar si una palabra es común (no es un producto)
  static isCommonWord(word) {
    const commonWords = [
      'total', 'subtotal', 'iva', 'impuesto', 'descuento', 'precio', 'cantidad',
      'producto', 'item', 'articulo', 'unidad', 'pieza', 'metro', 'kg', 'litro',
      'fecha', 'hora', 'cliente', 'proveedor', 'empresa', 'direccion', 'telefono',
      'email', 'web', 'pagina', 'numero', 'codigo', 'referencia', 'orden',
      'pedido', 'remito', 'factura', 'nota', 'recibo', 'comprobante'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }
  
  // Remover productos duplicados
  static removeDuplicateProducts(products) {
    const seen = new Set();
    return products.filter(product => {
      const key = product.name.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  // Formatear fecha
  static formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }
}

module.exports = FileProcessor;
