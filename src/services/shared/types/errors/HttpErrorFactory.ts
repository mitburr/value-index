import {HttpError} from './HttpError'

export class HttpErrorFactory {
  // Client Errors (4xx)
  static BadRequest(message = 'Bad Request') {
    return new HttpError(400, message);
  }

  static Unauthorized(message = 'Unauthorized') {
    return new HttpError(401, message);
  }

  static Forbidden(message = 'Forbidden') {
    return new HttpError(403, message);
  }

  static NotFound(message = 'Not Found') {
    return new HttpError(404, message);
  }

  static RateLimitExceeded(message = 'Too Many Requests') {
    return new HttpError(429, message);
  }

  // Server Errors (5xx)
  static InternalServer(message = 'Internal Server Error') {
    return new HttpError(500, message);
  }

  static BadGateway(message = 'Bad Gateway') {
    return new HttpError(502, message);
  }

  static ServiceUnavailable(message = 'Service Unavailable') {
    return new HttpError(503, message);
  }

  // Custom error factory
  static create(statusCode: number, message: string, code?: string) {
    return new HttpError(statusCode, message, code);
  }
}