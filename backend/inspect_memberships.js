const dataSource = require('./src/config/datasource');
(async () => {
  try {
    await dataSource.initialize();
    const rows = await dataSource.query('SELECT * FROM memberships LIMIT 10');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err.message || err);
  } finally {
    process.exit();
  }
})();
