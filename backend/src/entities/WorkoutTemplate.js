const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'WorkoutTemplate',
  tableName: 'workout_templates',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    name: { type: 'varchar', length: 150 },
    description: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    createdBy: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'createdById' },
      nullable: true,
    },
  },
});
