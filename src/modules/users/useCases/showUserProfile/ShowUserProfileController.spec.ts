import request from 'supertest';
import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('password', 8);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES('${id}', 'User Test', 'user@test.com', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show the user profile', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    const { token } = responseToken.body;

    const response = await request(app).get('/api/v1/profile').send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('User Test');
    expect(response.body.email).toBe('user@test.com');
  });
});