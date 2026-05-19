const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Membership',
  tableName: 'memberships',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    title: { type: 'varchar', length: 150 },
    description: { type: 'text', nullable: true },
    price: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    duration: { type: 'varchar', length: 100, nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true }
  },
  relations: {
    assignments: {
      type: 'one-to-many',
      target: 'MembershipAssignment',
      inverseSide: 'membership',
    },
  }
});