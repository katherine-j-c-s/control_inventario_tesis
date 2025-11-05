import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    nombre: {
      type: 'varchar',
      length: 100,
    },
    apellido: {
      type: 'varchar',
      length: 100,
    },
    dni: {
      type: 'varchar',
      length: 20,
      unique: true,
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    puesto_laboral: {
      type: 'varchar',
      length: 100,
    },
    edad: {
      type: 'int',
    },
    genero: {
      type: 'varchar',
      length: 20,
    },
    foto: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    password: {
      type: 'varchar',
      length: 255,
    },
    rol: {
      type: 'varchar',
      length: 50,
      default: 'usuario',
    },
    permisos: {
      type: 'json',
      default: () => "'{\"inventory\": true, \"scanQR\": true}'",
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
