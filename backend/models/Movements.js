import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Movements',
  tableName: 'movements',
  columns: {
    movement_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    movement_type: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    date: {
      type: 'timestamp',
      nullable: false,
    },
    quantity: {
      type: 'int',
      nullable: false,
    },
    product_id: {
      type: 'int',
      nullable: false,
    },
    status: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    user_id: {
      type: 'int',
      nullable: false,
    },
    ubicacionactual: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    motivo: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    destinatario: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    observaciones: {
      type: 'text',
      nullable: true,
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