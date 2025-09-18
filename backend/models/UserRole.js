const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'UserRole',
  tableName: 'user_roles',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    user_id: {
      type: 'int',
    },
    role_id: {
      type: 'int',
    },
    asignado_por: {
      type: 'int',
      nullable: true, // ID del admin que asignó el rol
    },
    fecha_asignacion: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    activo: {
      type: 'boolean',
      default: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
    role: {
      type: 'many-to-one',
      target: 'Role',
      joinColumn: { name: 'role_id' },
    },
    asignador: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'asignado_por' },
    },
  },
});
