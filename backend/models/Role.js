const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Role',
  tableName: 'roles',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    nombre: {
      type: 'varchar',
      length: 50,
      unique: true,
    },
    descripcion: {
      type: 'text',
      nullable: true,
    },
    permisos: {
      type: 'json',
      default: () => "'{}'",
    },
    activo: {
      type: 'boolean',
      default: true,
    },
    es_sistema: {
      type: 'boolean',
      default: false, // Para roles que no se pueden eliminar (admin, usuario)
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
