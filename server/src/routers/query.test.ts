import {server} from '../index';
import * as request from 'supertest';

// close the server after each test
afterEach(() => {
  server.close();
});

const fakeLoginParam = {username: 'zilliz', password: '3595d5ef096da22d69ea8ee23e7c53fa'};
const queryParam = {
  query: [
    {
      id: '1223',
      sql:
        "SELECT mac AS color,CASE WHEN num_id>=3014 THEN 11 ELSE cast((cast(num_id AS float)-1)*0.003982741453700631 AS int)END AS x,COUNT(*)AS y FROM wuxian_wifi WHERE((num_id>=1 AND num_id<=3014)OR(num_id IS NULL))AND(mac IN('94:D9:B3:E6:B2:74','78:D3:8D:D3:C1:61','BC:46:99:9B:F4:72','C0:61:18:0D:73:E0','B0:F1:EC:A1:3F:A0','CE:73:14:20:A9:AD','F4:83:CD:70:2E:28','CC:B8:A8:34:9F:1C','0C:4B:54:97:86:A7','00:E0:4C:3B:B2:CF'))AND(num_id BETWEEN 2009.6666666666667 AND 2762.916666666667)GROUP BY color,x",
      timestamp: 123
    },
  ],
};

const result = [{
  id: '1223',
  sql:
    "SELECT mac AS color,CASE WHEN num_id>=3014 THEN 11 ELSE cast((cast(num_id AS float)-1)*0.003982741453700631 AS int)END AS x,COUNT(*)AS y FROM wuxian_wifi WHERE((num_id>=1 AND num_id<=3014)OR(num_id IS NULL))AND(mac IN('94:D9:B3:E6:B2:74','78:D3:8D:D3:C1:61','BC:46:99:9B:F4:72','C0:61:18:0D:73:E0','B0:F1:EC:A1:3F:A0','CE:73:14:20:A9:AD','F4:83:CD:70:2E:28','CC:B8:A8:34:9F:1C','0C:4B:54:97:86:A7','00:E0:4C:3B:B2:CF'))AND(num_id BETWEEN 2009.6666666666667 AND 2762.916666666667)GROUP BY color,x",
  timestamp: 123,
  result: [
    {
      color: 'CE:73:14:20:A9:AD',
      x: 9,
      y: '371',
    },
    {
      color: 'B0:F1:EC:A1:3F:A0',
      x: 9,
      y: '372',
    },
  ],
  err: false,
}];

let dbParam = {
  type: 'postgres',
  host: '192.168.1.169',
  username: 'zilliz',
  password: 'zilliz',
  port: 5432,
  database: 'postgres',
};

describe('POST /query', () => {
  test('should respond as expected', async () => {
    const s = await request(server);
    const res = await s.post('/login').send(fakeLoginParam);
    const token = `bearer ${res.body.data.token}`;
    await s
      .post('/config/db')
      .set('Authorization', token)
      .send(dbParam);

    const response = await s
      .post('/query')
      .set('Authorization', token)
      .send(queryParam);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.body.data).toEqual(result);
  });
});

describe('GET /query', () => {
  test('should get 401 Error', async () => {
    const response = await request(server).get('/query');

    expect(response.status).toEqual(401);
  });
});
