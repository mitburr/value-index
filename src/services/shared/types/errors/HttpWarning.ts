export class HttpWarning {
  public name: string;
  public message: string;

  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    this.name = 'HttpWarning';
    this.message = message;
  }

  toString() {
    return `${this.statusCode} ${this.message}`;
  }
}