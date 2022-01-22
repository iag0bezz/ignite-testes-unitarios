import request from "supertest";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement Controller', () => {
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

  it('should be able to create a deposit statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    const { token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Deposit test $ 100,0'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(100);
  });

  it('should be able to create a withdraw statement', async () =>{
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    const { token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50,
      description: 'Withdraw test $ 50,0',
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(50);
  });

  it('should not be able to create withdraw statement if do not have funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password',
    });

    const { token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 100,
      description: 'Invalid withdraw test $ 100,0',
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
  });
});