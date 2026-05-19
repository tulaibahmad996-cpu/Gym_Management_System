const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    firstName: { type: 'varchar', length: 100 },
    lastName: { type: 'varchar', length: 100 },
    email: { type: 'varchar', length: 150, unique: true },
    password: { type: 'varchar', length: 255 },

    // ✅ FIXED ROLE SYSTEM
    role: {
      type: 'varchar',
      length: 50,
      default: 'member',
    },

    profileImage: { type: 'varchar', length: 255, nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },

  relations: {
    workouts: {
      type: 'one-to-many',
      target: 'Workout',
      inverseSide: 'member',
    },

    workoutsAsTrainer: {
      type: 'one-to-many',
      target: 'Workout',
      inverseSide: 'trainer',
    },

    attendance: {
      type: 'one-to-many',
      target: 'Attendance',
      inverseSide: 'member',
    },

    membershipAssignments: {
      type: 'one-to-many',
      target: 'MembershipAssignment',
      inverseSide: 'member',
    },

    assignedMembers: {
      type: 'one-to-many',
      target: 'TrainerAssignment',
      inverseSide: 'trainer',
    },

    trainerAssignment: {
      type: 'one-to-many',
      target: 'TrainerAssignment',
      inverseSide: 'member',
    },
  },
});