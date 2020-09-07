import {
  getTableDetail,
  getAllTables,
  getTableRowCount,
  getAllTablesDetail,
} from "./query";

describe("getTableDetail", () => {
  test("should respond as expected", async () => {
    const client = {
      query: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [
              { column_name: "c1", data_type: "string", udt_name: "string" },
            ],
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [{ countval: 10 }],
          })
        ),
    };
    let response = await getTableDetail(client, "testTablename");
    // {
    //   name: tableName,
    //   rowCount: count,
    //   columnCount: res.length,
    //   columnDefs: res,
    // };
    expect(response.name).toEqual("testTablename");
    expect(response.columnCount).toEqual(1);
    expect(response.rowCount).toEqual(10);
    expect(response.columnDefs).toEqual([
      { colName: "c1", dataType: "string", type: "string" },
    ]);
  });
});

describe("getAllTables", () => {
  test("should respond as expected", async () => {
    const client = {
      query: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          rows: [
            { table_name: "c1" },
            { table_name: "c2" },
            { table_name: "c3" },
          ],
        })
      ),
    };
    let response = await getAllTables(client);
    expect(response).toEqual(["c1", "c2", "c3"]);
  });
});

describe("getTableRowCount", () => {
  test("should respond as expected", async () => {
    const client = {
      query: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          rows: [{ countval: 10 }],
        })
      ),
    };
    let response = await getTableRowCount(client, "table");
    expect(response).toEqual(10);
  });
  test("should respond as expected when no table exists", async () => {
    const client = {
      query: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          rows: [],
        })
      ),
    };
    let response = await getTableRowCount(client, "table");
    expect(response).toEqual(0);
  });
});

describe("getAllTablesDetail", () => {
  test("should respond as expected with source table provided", async () => {
    const client = {
      query: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [
              {
                column_name: "c1",
                data_type: "string",
                udt_name: "string",
              },
            ],
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [{ countval: 10 }],
          })
        ),
    };
    let response = await getAllTablesDetail(client, ["table"]);

    expect(response).toEqual([
      {
        name: "table",
        rowCount: 10,
        columnCount: 1,
        columnDefs: [{ colName: "c1", dataType: "string", type: "string" }],
      },
    ]);
  });

  test("should respond as expected without provided source table", async () => {
    const client = {
      query: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [
              { table_name: "table" },
            ],
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [
              {
                column_name: "c1",
                data_type: "string",
                udt_name: "string",
              },
            ],
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            rows: [{ countval: 10 }],
          })
        ),
    };
    let response = await getAllTablesDetail(client);

    expect(response).toEqual([
      {
        name: "table",
        rowCount: 10,
        columnCount: 1,
        columnDefs: [{ colName: "c1", dataType: "string", type: "string" }],
      },
    ]);
  });
});
