import { EntitySchema } from 'typeorm';


export default new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    order_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    supplier: {
      type: 'varchar',
      length: 100,
    },  
    status: {
      type: 'boolean',
    },
    project_id: {
      type: 'int',
      references: 'projects',
    },
    issue_date: {
      type: 'date',
    },
    delivery_date: {
      type: 'date',
    },
    amount: {
      type: 'decimal',
      precision: 10,
      scale: 2,
    },
    total: {
      type: 'decimal',
      precision: 10,
      scale: 2,
    },
    responsible_person: {
      type: 'varchar',
      length: 100,
    },
    delivery_status: {
      type: 'varchar',
      length: 50,
    },
    contact: {
      type: 'varchar',
      length: 100,
    },
    item_quantity: {
      type: 'int',
    },
    company_name: {
      type: 'varchar',
      length: 150,
    },
    company_address: {
      type: 'varchar',
      length: 200,
    },
  },
});