const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class FileProcessor {
  
  static async processPDF(filePath) {
    try {
      console.log('Procesando PDF:', filePath);
      const receiptData = {
        warehouse_id: 1,
        entry_date: new Date().toISOString().split('T')[0],
        order_id: null,
        status: 'Pending',
        products: [
          {
            name: 'Producto del PDF',
            description: 'Extraído de PDF',
            quantity: 1,
            unit_price: 0
          }
        ]
      };
      
      return {
        success: true,
        text: 'PDF procesado - datos de ejemplo',
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
      const receiptData = {
        warehouse_id: 1,
        entry_date: new Date().toISOString().split('T')[0],
        order_id: null,
        status: 'Pending',
        products: [
          {
            name: 'Producto de la imagen',
            description: 'Extraído de imagen',
            quantity: 1,
            unit_price: 0
          }
        ]
      };
      
      return {
        success: true,
        text: 'Imagen procesada - datos de ejemplo',
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
    
    // Buscar fecha en el texto
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      data.entry_date = this.formatDate(dateMatch[0]);
    }
    
    // Buscar número de orden
    const orderRegex = /(?:orden|order|pedido|pedido\s+no\.?|n[úu]mero)\s*:?\s*([A-Z0-9\-]+)/i;
    const orderMatch = text.match(orderRegex);
    if (orderMatch) {
      data.order_id = orderMatch[1];
    }
    
    // Buscar productos (patrones comunes en remitos)
    const productRegex = /(\d+)\s+([A-Za-z0-9\s\-\.]+?)\s+(\d+(?:\.\d+)?)\s*$/gm;
    let match;
    
    while ((match = productRegex.exec(text)) !== null) {
      const quantity = parseInt(match[1]);
      const name = match[2].trim();
      const price = parseFloat(match[3]);
      
      if (quantity > 0 && name.length > 2) {
        data.products.push({
          name: name,
          description: '',
          quantity: quantity,
          unit_price: price || 0
        });
      }
    }
    
    // Si no se encontraron productos con el patrón anterior, buscar líneas que contengan números
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
            
            if (name.length > 2) {
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
    
    return data;
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
