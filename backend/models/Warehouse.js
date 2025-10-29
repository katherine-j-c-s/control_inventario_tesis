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
    name: {
      type: 'varchar',
      length: 100,
    },
    address_sector: {
      type: 'varchar',
      length: 150,
      nullable: true,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    latitude: {
      type: 'decimal',
      precision: 10,
      scale: 8,
      nullable: true,
    },
    longitude: {
      type: 'decimal',
      precision: 11,
      scale: 8,
      nullable: true,
    },
    user_id: {
      type: 'int',
      nullable: true,
    },
    capacity: {
      type: 'int',
      nullable: true,
    },
  },
});

