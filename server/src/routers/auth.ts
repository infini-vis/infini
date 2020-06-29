import * as jsonwebtoken from 'jsonwebtoken';
import {secret, jwtExpires} from '../configs/server.config';
import {Logger} from '../utils';

interface LoginRequest {
  username: string;
  password: string;
}

const users = [
  {
    userId: 1,
    username: 'zilliz',
    password: 'zilliz', //'3595d5ef096da22d69ea8ee23e7c53fa',
  },
  {
    userId: 414,
    username: 'demo',
    password: 'demo'//'fe01ce2a7fbac8fafaed7c982a04e229',
  },
];

export default function login(router) {
  router.post('/login', async (ctx, next) => {
    const {username, password} = <LoginRequest>ctx.request.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      Logger(`User "${username}" login successful`);

      // delete user password
      const data = JSON.parse(JSON.stringify(user));
      delete data.password;

      // return data;
      ctx.body = {
        token: jsonwebtoken.sign({data}, secret, {expiresIn: jwtExpires}),
        expiresIn: jwtExpires,
        connId: ctx.db.lastClientId
      };
    } else {
      ctx.throw(401);
    }
    await next();
  });

  return router;
}
