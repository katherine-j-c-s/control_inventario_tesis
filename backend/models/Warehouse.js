import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Warehouse',
  tableName: 'warehouses',
  columns: {
    warehouse_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    user_id: {
      type: 'int',
      nullable: true,
    },
    name: {
      type: 'varchar',
      length: 100,
    },
    location: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    latitude: {
      type: 'decimal',
      precision: 19,
      scale: 8,
      nullable: true,
    },
    longitude: {
      type: 'decimal',
      precision: 11,
      scale: 8,
      nullable: true,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    capacity: {
      type: 'int',
      nullable: true,
    },
  },
});

