import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User UseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepository
    );
  });

  it('should be able to create a user', async () => {
    const response = await createUserUseCase.execute({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password',
    });

    expect(response).toHaveProperty('id');
  });

  it('should not be able to create a user with existent email', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'User Test 1',
        email: 'user@test.com',
        password: 'password',
      });

      await createUserUseCase.execute({
        name: 'User Test 2',
        email: 'user@test.com',
        password: 'password_123'
      })
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});