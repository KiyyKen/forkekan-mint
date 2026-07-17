import { EventEmitter } from 'node:events';

import { RequestLoggerMiddleware } from './request-logger.middleware';

describe('RequestLoggerMiddleware', () => {
  it('memanggil next() segera tanpa menunggu response selesai', () => {
    const middleware = new RequestLoggerMiddleware();
    const request = { method: 'GET', originalUrl: '/api/v1/health' };
    const response = new EventEmitter() as EventEmitter & { statusCode: number };
    response.statusCode = 200;
    const next = jest.fn();

    middleware.use(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('mencatat log saat event finish response terpicu', () => {
    const middleware = new RequestLoggerMiddleware();
    const logSpy = jest
      .spyOn((middleware as unknown as { logger: { log: (message: string) => void } }).logger, 'log')
      .mockImplementation(() => undefined);

    const request = { method: 'POST', originalUrl: '/api/v1/uploads' };
    const response = new EventEmitter() as EventEmitter & { statusCode: number };
    response.statusCode = 201;

    middleware.use(request as never, response as never, jest.fn());
    response.emit('finish');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('POST /api/v1/uploads 201'));
  });
});
