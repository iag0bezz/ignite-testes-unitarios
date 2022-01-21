import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User UseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    );
  });

  it('should be able to authenticate user', async () => {
    const password = await hash('password', 8);
    
    await usersRepository.create({
      email: 'user@test.com',
      name: 'User Test',
      password
    });

    const response = await authenticateUserUseCase.execute({
      email: 'user@test.com',
      password: 'password',
    });

    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('user');
  });

  it('should not be able to authenticate with non-existent user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'invalid@test.com',
        password: 'invalid-password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate with a wrong email', async () => {
    expect(async () => {
      const password = await hash('password', 8);
    
      await usersRepository.create({
        email: 'user@test.com',
        name: 'User Test',
        password
      });

      await authenticateUserUseCase.execute({
        email: 'invalid@test.com',
        password: 'password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it('should not be able to authenticate with a wrong password', async () => {
    expect(async () => {
      const password = await hash('password', 8);
    
      await usersRepository.create({
        email: 'user@test.com',
        name: 'User Test',
        password
      });

      await authenticateUserUseCase.execute({
        email: 'user@test.com',
        password: 'invalid-password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});