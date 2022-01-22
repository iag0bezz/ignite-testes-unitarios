import request from 'supertest';
import { hash } from 'bcryptjs';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
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

  it('should be able to get deposit statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    const { token } = responseToken.body;

    const statement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Deposit test $ 100,0',
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get(`/api/v1/statements/${statement.body.id}`).send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(20);
    expect(response.body.id).toBe(statement.body.id);
  });

  it('should be not able to get non-existent statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    const { token } = responseToken.body;

    const id = 'invalid-id';

    const response = await request(app).get(`/api/v1/statements/${id}`).send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
  });
});