import { HttpWarning } from './HttpWarning'

export class HttpWarningFactory {
 private static create(statusCode: number, message: string, code?: string): HttpWarning {
   return new HttpWarning(statusCode, message, code);
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