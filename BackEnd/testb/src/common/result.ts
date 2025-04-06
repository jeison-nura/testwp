export class Result<T, E> {
  private constructor(
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  public static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value);
  }
  public static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error);
  }

  public isOk(): boolean {
    return this.value !== undefined;
  }
  public isErr(): boolean {
    return !this.isOk();
  }
  public getValue(): T {
    if (!this.isOk) {
      throw new Error('Cannot get value from an error result');
    }
    return this.value as T;
  }
  public getError(): E {
    if (!this.isErr) {
      throw new Error('Cannot get error from an ok result');
    }
    return this.error as E;
  }
}
