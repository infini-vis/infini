import {server} from '../index';
import * as request from 'supertest';

// close the server after each test
afterEach(() => {
  server.close();
});

const fakeCorrect = {username: 'zilliz', password: 'zilliz'};
const fakeIncorrect = {username: 'zilliz', password: 'wrong'};

describe('POST /auth', () => {
  test('should respond as expected', async () => {
    const _server = request(server);
    const response = await _server.post('/login').send(fakeCorrect);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual('application/json');
    expect(response.body.data.token).toBeString();
    expect(response.body.data.expiresIn).toBeString();
  });

  test('should response 401 error with wrong pass', async () => {
    const response = await request(server)
      .post('/login')
      .send(fakeIncorrect);

    expect(response.status).toEqual(401);
  });
});

describe('GET /auth', () => {
  test('should respond as expected', async () => {
    const response = await request(server)
      .get('/login')
      .send(fakeCorrect);

    expect(response.status).toEqual(405);
  });
});
