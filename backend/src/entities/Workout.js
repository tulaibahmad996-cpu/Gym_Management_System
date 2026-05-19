const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Workout',
  tableName: 'workouts',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    name: { type: 'varchar', length: 150 },
    description: { type: 'text', nullable: true },
    date: { type: 'timestamp' },

    status: {
      type: 'varchar',
      default: 'planned',
    },

    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },

  relations: {
    member: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'memberId' },
      nullable: false,
    },

    trainer: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'trainerId' },
      nullable: false,
    },
  },
});