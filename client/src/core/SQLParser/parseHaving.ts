import { SQLParser } from '.';
import { SQL, Transform } from '../types';

export function parseHaving(sql: SQL, transform: Transform) {
  if (transform.type !== 'having') {
    return sql;
  }

  sql.having = sql.having || [];
  const expr = SQLParser.parseExpression(transform.expr);
  sql.having.push(expr);

  return sql;
}
