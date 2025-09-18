const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    nombre: {
      type: 'varchar',
      length: 200,
    },
    codigo: {
      type: 'varchar',
      length: 100,
      unique: true,
    },
    categoria: {
      type: 'varchar',
      length: 100,
    },
    descripcion: {
      type: 'text',
      nullable: true,
    },
    unidad_medida: {
      type: 'varchar',
      length: 50,
    },
    precio_unitario: {
      type: 'decimal',
      precision: 10,
      scale: 2,
    },
    stock_minimo: {
      type: 'int',
      default: 0,
    },
    stock_actual: {
      type: 'int',
      default: 0,
    },
    ubicacion: {
      type: 'varchar',
      length: 100,
    },
    qr_code: {
      type: 'text',
      nullable: true,
    },
    activo: {
      type: 'boolean',
      default: true,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updated_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    },
  },
});
