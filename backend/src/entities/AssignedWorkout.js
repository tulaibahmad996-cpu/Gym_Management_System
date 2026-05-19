const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'AssignedWorkout',
  tableName: 'assigned_workouts',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    name: { type: 'varchar', length: 150, nullable: true },
    description: { type: 'text', nullable: true },
    scheduledAt: { type: 'timestamp', nullable: true },
    status: { type: 'varchar', length: 50, default: 'Planned' },
    notes: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    template: {
      type: 'many-to-one',
      target: 'WorkoutTemplate',
      joinColumn: { name: 'templateId' },
      nullable: true,
      cascade: false,
    },
    member: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'memberId' },
      nullable: false,
      cascade: false,
    },
    trainer: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'trainerId' },
      nullable: false,
      cascade: false,
    },
  },
});
