import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'WorkOrder',
  tableName: 'work_orders',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    project_id: {
      type: 'int',
    },
    descripcion: {
      type: 'text',
      nullable: true,
    },
    fecha_solicitud: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    usuario_id: {
      type: 'int',
    },
    estado: {
      type: 'varchar',
      length: 20,
      default: 'pendiente',
    },
  },
  relations: {
    items: {
      type: 'one-to-many',
      target: 'WorkOrderItem',
      inverseSide: 'work_order',
      cascade: true,
    },
  },
});
