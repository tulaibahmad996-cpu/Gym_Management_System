const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'TrainerAssignment',
  tableName: 'trainer_assignments',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    assignedAt: { type: 'timestamp', createDate: true }
  },
  relations: {
    trainer: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'trainerId' },
      nullable: false,
    },
    member: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'memberId' },
      nullable: false,
    }
  }
});