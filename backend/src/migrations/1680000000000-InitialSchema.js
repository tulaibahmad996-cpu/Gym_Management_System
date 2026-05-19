module.exports = class InitialSchema1680000000000 {
  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE "users" (
      "id" SERIAL PRIMARY KEY,
      "firstName" varchar(100) NOT NULL,
      "lastName" varchar(100) NOT NULL,
      "email" varchar(150) NOT NULL UNIQUE,
      "password" varchar(255) NOT NULL,
      "role" varchar(50) NOT NULL DEFAULT 'Member',
      "profileImage" varchar(255),
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE "memberships" (
      "id" SERIAL PRIMARY KEY,
      "title" varchar(150) NOT NULL,
      "description" text,
      "price" decimal(10,2) NOT NULL DEFAULT 0,
      "duration" varchar(100),
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE "workouts" (
      "id" SERIAL PRIMARY KEY,
      "name" varchar(150) NOT NULL,
      "description" text,
      "date" TIMESTAMP NOT NULL,
      "status" varchar(100) NOT NULL DEFAULT 'Planned',
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "memberId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "trainerId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await queryRunner.query(`CREATE TABLE "membership_assignments" (
      "id" SERIAL PRIMARY KEY,
      "status" varchar(50) NOT NULL DEFAULT 'active',
      "startDate" date,
      "endDate" date,
      "assignedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "membershipId" integer NOT NULL REFERENCES "memberships"("id") ON DELETE CASCADE,
      "memberId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await queryRunner.query(`CREATE TABLE "attendance" (
      "id" SERIAL PRIMARY KEY,
      "date" date NOT NULL,
      "status" varchar(100) NOT NULL DEFAULT 'Present',
      "note" text,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "memberId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await queryRunner.query(`CREATE TABLE "trainer_assignments" (
      "id" SERIAL PRIMARY KEY,
      "assignedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "trainerId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "memberId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS "trainer_assignments"');
    await queryRunner.query('DROP TABLE IF EXISTS "attendance"');
    await queryRunner.query('DROP TABLE IF EXISTS "membership_assignments"');
    await queryRunner.query('DROP TABLE IF EXISTS "workouts"');
    await queryRunner.query('DROP TABLE IF EXISTS "memberships"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
};
