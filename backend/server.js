// require('dotenv').config();
// require('reflect-metadata');
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const dataSource = require('./src/config/datasource');
// const authRoutes = require('./src/routes/authRoutes');
// const userRoutes = require('./src/routes/userRoutes');
// const membershipRoutes = require('./src/routes/membershipRoutes');
// const workoutRoutes = require('./src/routes/workoutRoutes');
// const attendanceRoutes = require('./src/routes/attendanceRoutes');
// const dashboardRoutes = require('./src/routes/dashboardRoutes');
// const memberRoutes = require('./src/routes/memberRoutes');
// const trainerRoutes = require('./src/routes/trainerRoutes');
// const adminRoutes = require('./src/routes/adminRoutes');
// const { errorHandler } = require('./src/middlewares/errorMiddleware');

// const PORT = process.env.PORT || 5000;
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/memberships', membershipRoutes);
// app.use('/api/workouts', workoutRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/member', memberRoutes);
// app.use('/api/trainer', trainerRoutes);
// app.use('/api/admin', adminRoutes);

// app.use(errorHandler);

// dataSource.initialize()
//   .then(() => {
//     console.log('Database connected');
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Failed to initialize database connection:', error);
//   });

// require('./src/seed/adminSeeder');

require('dotenv').config();
require('reflect-metadata');

const express = require('express');
const cors = require('cors');
const path = require('path');

const dataSource = require('./src/config/datasource');
app.use(express.json());
// Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const membershipRoutes = require('./src/routes/membershipRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const memberRoutes = require('./src/routes/memberRoutes');
const trainerRoutes = require('./src/routes/trainerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Middleware
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'))
);

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/admin', adminRoutes);

// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
  res.send('API is running ✔');
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= DATABASE + SERVER START =================
dataSource.initialize()
  .then(async () => {
    console.log('Database connected ✔');

    // Run migrations automatically
    await dataSource.runMigrations();
    console.log('Migrations executed ✔');

    // OPTIONAL SEED (sirf first deploy pe use karo)
    // await require('./src/seed/adminSeeder')();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed ❌', error);
    process.exit(1);
  });