import {server} from '../index';
import * as request from 'supertest';

// close the server after each test
afterEach(() => {
  server.close();
});

const fakeCorrect = {username: 'zilliz', password: '3595d5ef096da22d69ea8ee23e7c53fa'};
let queryParam = {
  type: 'postgres',
  host: '192.168.1.169',
  username: 'zilliz',
  password: 'zilliz',
  port: 5432,
  database: 'postgres',
};

describe('/config/db', () => {
  test('POST /config/db, should get id of the db', async done => {
    const s = request(server);
    const res = await s.post('/login').send(fakeCorrect);
    const token = `bearer ${res.body.data.token}`;
    const response = await s
      .post('/config/db')
      .set('Authorization', token)
      .send(queryParam);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.body.data).toEqual({id: '4e8f1b22a1d246a6702fe5a93f0e617b'});
    done();
  });

  test('GET /config/db/:id, should get db config', async done => {
    const s = request(server);
    const res = await s.post('/login').send(fakeCorrect);
    const token = `bearer ${res.body.data.token}`;
    await s
      .post('/config/db')
      .set('Authorization', token)
      .send(queryParam);
    const response = await s
      .get('/config/db/4e8f1b22a1d246a6702fe5a93f0e617b')
      .set('Authorization', token)
      .send(queryParam);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.body.data).toEqual({id: '4e8f1b22a1d246a6702fe5a93f0e617b', ...queryParam});
    done();
  });

  test('GET /config/db, should get latest db id and config', async done => {
    const s = request(server);
    const res = await s.post('/login').send(fakeCorrect);
    const token = `bearer ${res.body.data.token}`;
    await s
      .post('/config/db')
      .set('Authorization', token)
      .send(queryParam);
    const response = await s
      .get('/config/db')
      .set('Authorization', token)
      .send(queryParam);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.body.data).toEqual({id: '4e8f1b22a1d246a6702fe5a93f0e617b', ...queryParam});
    done();
  });
});
