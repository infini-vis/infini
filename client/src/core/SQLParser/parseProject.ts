import { SQLParser } from '.';
import { SQL, Transform } from '../types';

export function parseProject(sql: SQL, transform: Transform) {
  if (transform.type !== 'project') {
    return sql;
  }
  sql.select = sql.select || [];
  sql.select.push(
    SQLParser.parseExpression(transform.expr) +
      (transform.as ? ' AS ' + transform.as : '')
  );
  return sql;
}
