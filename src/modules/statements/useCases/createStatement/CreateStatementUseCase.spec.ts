import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Statement UseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository,
    );
  })

  it('should be able to create a deposit statement', async () => {
    const user = await usersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password'
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Deposit test $ 100,0',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    });

    expect(statement).toHaveProperty('id');
    expect(statement.amount).toBe(100);
  });

  it('should be able to create a withdraw statement', async () => {
    const user = await usersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password'
    });

    await createStatementUseCase.execute({
      amount: 150,
      description: 'Deposit test $ 150,0',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Withdraw test $ 100,0',
      type: OperationType.WITHDRAW,
      user_id: user.id as string
    });

    expect(statement).toHaveProperty('id');
    expect(statement.amount).toBe(100);
  });

  it('should not be able to create a withdraw if do not have funds', async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: 'User Test',
        email: 'user@test.com',
        password: 'password'
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: 'Withdraw test $ 100,0',
        type: OperationType.WITHDRAW,
        user_id: user.id as string
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a statement with a non-existent user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: 'Withdraw test $ 100,0',
        type: OperationType.WITHDRAW,
        user_id: 'invalid-id'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })
})