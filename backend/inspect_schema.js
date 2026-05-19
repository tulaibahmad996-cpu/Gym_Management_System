const dataSource = require('./src/config/datasource');
(async () => {
  try {
    await dataSource.initialize();
    console.log('TABLES:');
    const tables = await dataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log(tables.map(r => r.table_name).join(', '));
    console.log('---');
    const columns = await dataSource.query("SELECT column_name FROM information_schema.columns WHERE table_name='memberships' ORDER BY ordinal_position");
    console.log('MEMBERSHIPS COLUMNS:', columns.map(r => r.column_name).join(', '));
    try {
      const rows = await dataSource.query('SELECT * FROM memberships LIMIT 3');
      console.log('MEMBERSHIPS ROWS:', rows.length);
    } catch (err) {
      console.error('SELECT MEMBERSHIPS ERROR:', err.message || err);
    }
  } catch (err) {
    console.error('DB ERROR:', err.message || err);
  } finally {
    process.exit();
  }
})();
