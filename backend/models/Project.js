import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Project',
  tableName: 'projects',
  columns: {
    project_id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    admin_id: {
      type: 'int',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    ubicacion: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
