import { EntitySchema } from 'typeorm';


export default new EntitySchema({
  name: 'Movements',
  tableName: 'movements',
  columns: {
    movement_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      movement_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ubicacionactual: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    
},
});