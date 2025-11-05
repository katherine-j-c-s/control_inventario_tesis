import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'WorkOrderItem',
  tableName: 'work_order_items',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    nombre_producto: {
      type: 'varchar',
      length: 255,
    },
    descripcion: {
      type: 'text',
      nullable: true,
    },
    cantidad: {
      type: 'int',
    },
    estado_item: {
      type: 'varchar',
      length: 20,
      default: 'pendiente',
    },
  },
  relations: {
    work_order: {
      type: 'many-to-one',
      target: 'WorkOrder',
      joinColumn: { name: 'work_order_id' },
      onDelete: 'CASCADE',
    },
  },
});
