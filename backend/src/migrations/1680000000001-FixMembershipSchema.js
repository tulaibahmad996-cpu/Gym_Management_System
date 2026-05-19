module.exports = class FixMembershipSchema1680000000001 {
  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "membership_assignments" (
      "id" SERIAL PRIMARY KEY,
      "status" varchar(50) NOT NULL DEFAULT 'active',
      "startDate" date,
      "endDate" date,
      "assignedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "membershipId" integer NOT NULL REFERENCES "memberships"("id") ON DELETE CASCADE,
      "memberId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'memberships' AND column_name = 'duration'
      ) THEN
        ALTER TABLE "memberships" ADD COLUMN "duration" varchar(100);
      END IF;
    END$$;`);

    const legacyColumns = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'memberships'
        AND column_name IN ('status', 'startDate', 'endDate', 'memberId')
    `);

    if (legacyColumns.length > 0) {
      await queryRunner.query(`INSERT INTO "membership_assignments" ("status", "startDate", "endDate", "assignedAt", "updatedAt", "membershipId", "memberId")
        SELECT "status", "startDate", "endDate", now(), now(), "id", "memberId"
        FROM "memberships"
        WHERE "memberId" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "membership_assignments" ma
            WHERE ma."membershipId" = "memberships"."id"
              AND ma."memberId" = "memberships"."memberId"
          )`);
    }

    await queryRunner.query(`ALTER TABLE "memberships"
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "startDate",
      DROP COLUMN IF EXISTS "endDate",
      DROP COLUMN IF EXISTS "memberId";
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "memberships"
      ADD COLUMN IF NOT EXISTS "status" varchar(50) NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "startDate" date,
      ADD COLUMN IF NOT EXISTS "endDate" date,
      ADD COLUMN IF NOT EXISTS "memberId" integer;
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "membership_assignments"`);
  }
};
