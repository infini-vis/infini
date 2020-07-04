import { SQLParser } from '.';
import { SQL, Transform } from '../types';

const isExpression = (expr: any) => {
  return Object.prototype.toString.call(expr) === '[object Object]';
};

export function parseFilter(sql: SQL, transform: Transform) {
  if (transform.type !== 'filter') {
    return sql;
  }
  sql.where = sql.where || [];
  sql.where.push(
    `(${
      isExpression(transform.expr)
        ? SQLParser.parseExpression(transform.expr)
        : transform.expr
    })`
  );
  return sql;
}
