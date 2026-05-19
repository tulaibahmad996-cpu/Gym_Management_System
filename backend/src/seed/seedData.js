require("dotenv").config();
const bcrypt = require("bcrypt");
const AppDataSource = require("../config/datasource");

async function seedDatabase() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connected for seeding");

        const userRepo = AppDataSource.getRepository("User");
        const membershipRepo = AppDataSource.getRepository("Membership");

        // ========== SEED ADMIN ==========
        const existingAdmin = await userRepo.findOne({
            where: { email: "admin@gmail.com" }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("123456", 10);
            const admin = userRepo.create({
                firstName: "Admin",
                lastName: "User",
                email: "admin@gmail.com",
                password: hashedPassword,
                role: "admin",
                profileImage: null
            });
            await userRepo.save(admin);
            console.log("✅ Admin user created");
        } else {
            console.log("⏭️  Admin already exists");
        }

        // ========== SEED TRAINERS ==========
        const trainers = [
            { firstName: "Avery", lastName: "Brooks", email: "avery@gmail.com" },
            { firstName: "Maya", lastName: "Patel", email: "maya@gmail.com" },
            { firstName: "Noah", lastName: "Kim", email: "noah@gmail.com" }
        ];

        for (const trainerData of trainers) {
            const existing = await userRepo.findOne({
                where: { email: trainerData.email }
            });

            if (!existing) {
                const hashedPassword = await bcrypt.hash("123456", 10);
                const trainer = userRepo.create({
                    firstName: trainerData.firstName,
                    lastName: trainerData.lastName,
                    email: trainerData.email,
                    password: hashedPassword,
                    role: "trainer",
                    profileImage: null
                });
                await userRepo.save(trainer);
                console.log(`✅ Trainer ${trainerData.firstName} ${trainerData.lastName} created`);
            }
        }

        // ========== SEED MEMBERSHIPS ==========
        const memberships = [
            {
                title: "Starter Plan",
                description: "Perfect for new members who want guided access to workouts and membership benefits.",
                price: 19,
                duration: "1 month"
            },
            {
                title: "Pro Plan",
                description: "Great for motivated members seeking stronger results with premium coaching support.",
                price: 39,
                duration: "1 month"
            },
            {
                title: "Elite Plan",
                description: "Designed for athletes and achievers who want premium training, analytics, and support.",
                price: 59,
                duration: "1 month"
            }
        ];

        for (const membershipData of memberships) {
            const existing = await membershipRepo.findOne({
                where: { title: membershipData.title }
            });

            if (!existing) {
                const membership = membershipRepo.create({
                    title: membershipData.title,
                    description: membershipData.description,
                    price: membershipData.price,
                    duration: membershipData.duration
                });
                await membershipRepo.save(membership);
                console.log(`✅ Membership plan "${membershipData.title}" created`);
            }
        }

        console.log("\n✅ Database seeding completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeder error:", error.message);
        process.exit(1);
    }
}

seedDatabase();
