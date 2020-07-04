import { SQL, Transform } from '../types';

export function parseWith(sql: SQL, transform: Transform, reduceToString: Function) {
  if (
    !transform ||
    transform.type !== 'with' ||
    typeof transform.data === 'undefined'
  ) {
    return sql;
  }
  const subQuery = reduceToString(transform.data);
  sql.with = sql.with || [];
  sql.with.push(subQuery ? { as: transform.as, subQuery } : '');
  return sql;
}
