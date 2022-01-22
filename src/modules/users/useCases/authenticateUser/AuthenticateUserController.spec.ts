import request from 'supertest';
import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User Controller', () => {
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

  it('should be able to authenticate user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should not be able to authenticate user with invalid password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'invalid-password',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate user with invalid email', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'invalid-user@test.com',
      password: 'password',
    });

    expect(response.status).toBe(401);
  })
});