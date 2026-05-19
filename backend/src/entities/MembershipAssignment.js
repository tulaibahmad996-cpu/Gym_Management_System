const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'MembershipAssignment',
  tableName: 'membership_assignments',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    status: { type: 'varchar', length: 50, default: 'active' },
    startDate: { type: 'date', nullable: true },
    endDate: { type: 'date', nullable: true },
    assignedAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    membership: {
      type: 'many-to-one',
      target: 'Membership',
      joinColumn: { name: 'membershipId' },
      nullable: false,
      cascade: false,
    },
    member: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'memberId' },
      nullable: false,
      cascade: false,
    },
  },
});
