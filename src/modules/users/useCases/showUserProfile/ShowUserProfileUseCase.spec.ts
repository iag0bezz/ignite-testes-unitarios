import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile UseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepository
    );
  });

  it('should able to show a user profile', async () => {
    const password = await hash('password', 8);

    const user = await usersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password
    });

    const response = await showUserProfileUseCase.execute(user.id as string);

    expect(response).toHaveProperty('id');
    expect(response).toBe(user);
    expect(response.id).toBe(user.id);
  });

  it('should not be able to show a profile with non-existent user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('invalid-id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})