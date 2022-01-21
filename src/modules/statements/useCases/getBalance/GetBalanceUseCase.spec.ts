import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance UseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it('should be able to get a user balance', async () => {
    const user = await usersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password'
    });

    const statementDeposit = await statementsRepository.create({
      amount: 100,
      description: 'Deposit test $ 100,0',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    });

    const statementWithdraw = await statementsRepository.create({
      amount: 50,
      description: 'Withdraw test $ 50,0',
      type: OperationType.WITHDRAW,
      user_id: user.id as string
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string
    });

    expect(response).toStrictEqual({
      balance: 50,
      statement: [statementDeposit, statementWithdraw]
    });
  });

  it('should not be able to get a user balance with a non-existent user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'invalid-id'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})