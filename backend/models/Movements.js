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
      type: 'text',
      nullable: false,
    },
    user_id: {
      type: 'int',
      nullable: false,
    },
    ubicacion_actual: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    estanteria_actual: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
  },
});