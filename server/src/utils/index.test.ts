import {Logger} from './index';

describe('Utils/Logger', () => {
  const originalLog = console.log;

  beforeEach(() => {
    console.log = (...args) => args.join(' ');
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
    console.log = originalLog;
  });

  test('should output string', () => {
    process.env.NODE_ENV = 'initial';
    const logString = 'abc';
    const response = Logger(logString);
    expect(response).toInclude(logString);
  });

  test('should output nothing in test env', () => {
    const logString = 'abc';
    const response = Logger(logString);
    expect(response).toBeString();
    expect(response).toBe('');
  });
});
