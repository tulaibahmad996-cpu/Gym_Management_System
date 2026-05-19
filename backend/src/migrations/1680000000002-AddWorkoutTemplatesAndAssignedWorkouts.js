module.exports = class AddWorkoutTemplatesAndAssignedWorkouts1680000000002 {
  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "workout_templates" (
      "id" SERIAL PRIMARY KEY,
      "name" varchar(150) NOT NULL,
      "description" text,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "createdById" integer REFERENCES "users"("id") ON DELETE SET NULL
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "assigned_workouts" (
      "id" SERIAL PRIMARY KEY,
      "name" varchar(150),
      "description" text,
      "scheduledAt" TIMESTAMP,
      "status" varchar(50) NOT NULL DEFAULT 'Planned',
      "notes" text,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "templateId" integer REFERENCES "workout_templates"("id") ON DELETE SET NULL,
      "memberId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "trainerId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS "assigned_workouts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_templates"`);
  }
};
