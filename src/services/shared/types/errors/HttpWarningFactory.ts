import { HttpWarning } from './HttpWarning'

export class HttpWarningFactory {
 private static create(statusCode: number, message: string, code?: string): HttpWarning {
   return new HttpWarning(statusCode, message, code);
 }

 static UnknownHttpWarning(statusCode: number, message: string, code?: string): HttpWarning {
    return this.create(statusCode, message, code);
  }

 static checkResponse(response: Response, context: string = ''): HttpWarning | null {
    if (response.ok) return null;

    const prefix = context ? `${context}: ` : '';

    switch (response.status) {
      case 400:
        return this.BadRequest(`${prefix}Invalid request`);
      case 401:
        return this.Unauthorized(`${prefix}Invalid API key`);
      case 403:
        return this.Forbidden(`${prefix}Access denied`);
      case 404:
        return this.NotFound(`${prefix}Resource not found`);
      case 429:
        return this.RateLimitExceeded(`${prefix}Rate limit exceeded`);
      case 500:
        return this.InternalServer(`${prefix}Server error`);
      case 502:
        return this.BadGateway(`${prefix}Gateway error`);
      case 503:
        return this.ServiceUnavailable(`${prefix}Service unavailable`);
      default:
        return this.create(response.status, `${prefix}HTTP error ${response.status}`);
    }
  }


 // Client Errors (4xx)
 static BadRequest(message = 'Bad Request', code?: string): HttpWarning {
   return this.create(400, message, code);
 }

 static Unauthorized(message = 'Unauthorized', code?: string): HttpWarning {
   return this.create(401, message, code);
 }

 static Forbidden(message = 'Forbidden', code?: string): HttpWarning {
   return this.create(403, message, code);
 }

 static NotFound(message = 'Not Found', code?: string): HttpWarning {
   return this.create(404, message, code);
 }

 static RateLimitExceeded(message = 'Too Many Requests', code?: string): HttpWarning {
   return this.create(429, message, code);
 }

 // Server Errors (5xx)
 static InternalServer(message = 'Internal Server Error', code?: string): HttpWarning {
   return this.create(500, message, code);
 }

 static BadGateway(message = 'Bad Gateway', code?: string): HttpWarning {
   return this.create(502, message, code);
 }

 static ServiceUnavailable(message = 'Service Unavailable', code?: string): HttpWarning {
   return this.create(503, message, code);
 }
}