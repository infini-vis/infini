export async function getTableDetail(tableName: string, client) {
  const sql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '${tableName}'`;

  let res = await client.query(sql);
  let count = await getTableRowCount(tableName, client);

  res = (res.rows || res).map(r => ({
    colName: r.column_name,
    dataType: r.data_type,
    type: r.udt_name,
  }));

  return {
    name: tableName,
    rowCount: count,
    columnCount: res.length,
    columnDefs: res,
  };
}

export async function getAllTables(client) {
  const sql = `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`;

  let {rows} = await client.query(sql);

  return rows.map(r => r[`table_name`]);
}

export async function getTableRowCount(tableName: string, client) {
  let sql = `SELECT count(*) as countval from ${tableName}`;

  let {rows} = await client.query(sql);

  return Number(rows[0]?.countval) || 0;
}

export async function getAllTablesDetail(sourceTables = [], client) {
  const tables = sourceTables.length > 0 ? sourceTables : await getAllTables(client);

  let sources = [];

  for (let i = 0; i < tables.length; i++) {
    let table = tables[i];
    let source = await this.getTableDetail(table, client);

    sources.push(source);
  }

  return sources;
}
