import { stat } from "fs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation UseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it('should be able to get the statement operation', async () => {
    const user = await usersRepository.create({
      email: 'user@test.com',
      name: 'User Test',
      password: 'password'
    });

    const statement = await statementsRepository.create({
      amount: 100,
      description: 'Deposit test $ 100,0',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string
    });

    expect(statementOperation).toBe(statement);
  });

  it('should not be able to get the statement operation with non-existent user', async () => {
    expect(async () => {
      const statement = await statementsRepository.create({
        amount: 100,
        description: 'Deposit test $ 100,0',
        type: OperationType.DEPOSIT,
        user_id: 'invalid-id',
      });

      await getStatementOperationUseCase.execute({
        statement_id: statement.id as string,
        user_id: 'invalid-id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get the statement operation with non-existent statement', async () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: 'user@test.com',
        name: 'User Test',
        password: 'password'
      });

      await getStatementOperationUseCase.execute({
        statement_id: 'invalid-id',
        user_id: user.id as string
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});