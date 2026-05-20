require("dotenv").config();
const bcrypt = require("bcrypt");
const AppDataSource = require("../config/datasource");

async function seedAdmin() {
    try {
        // DB init
        await AppDataSource.initialize();
        console.log("Database connected for seeder");

        const userRepo = AppDataSource.getRepository("User");

        // check if admin already exists
        const existingAdmin = await userRepo.findOne({
            where: { email: "admin@gmail.com" }
        });

        if (existingAdmin) {
            console.log("Admin already exists, skipping seed");
            process.exit(0);
        }

        // hash password
        const hashedPassword = await bcrypt.hash("123456", 10);

        // create admin (IMPORTANT: match your entity fields)
        const admin = userRepo.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin",
            profileImage: null
        });

        await userRepo.save(admin);

        console.log("✅ Admin created successfully");
        // process.exit(0);

    } catch (error) {
        console.error("❌ Seeder error:", error);
        // process.exit(1);
    }
}

seedAdmin();