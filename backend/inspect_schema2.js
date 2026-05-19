const dataSource = require('./src/config/datasource');
(async () => {
  try {
    await dataSource.initialize();
    const cols = await dataSource.query("SELECT column_name FROM information_schema.columns WHERE table_name='membership_assignments' ORDER BY ordinal_position");
    console.log('MEMBERSHIP_ASSIGNMENTS COLUMNS:', cols.map(r => r.column_name).join(', '));
    const rows = await dataSource.query('SELECT COUNT(*) FROM membership_assignments');
    console.log('MEMBERSHIP_ASSIGNMENTS COUNT:', rows[0].count || rows[0].count);
  } catch (err) {
    console.error(err.message || err);
  } finally {
    process.exit();
  }
})();
