const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Attendance',
  tableName: 'attendance',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    date: { type: 'date' },
    status: { type: 'varchar', length: 100, default: 'Present' },
    note: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true }
  },
  relations: {
    member: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'memberId' },
      nullable: false,
    },
  }
});