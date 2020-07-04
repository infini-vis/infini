import { SQLParser } from '.';
import { SQL, Transform } from '../types';
import { InfiniNode } from '../core';

export function reducer<T = Transform>(
  data: InfiniNode<T>,
  acc: SQL = {},
  reduceToString: any
) {
  let transform: Array<T> = [...data.transform];
  if (typeof data.source !== 'undefined') {
    let source = data.source;
    while (typeof source !== 'string') {
      source = source.source;
    }
    transform.push({ source: source, type: 'source' } as any);
  }
  return transform.reduce(
    (acc: any, currentTransform: any) =>
      SQLParser.parseTransform(acc, currentTransform, reduceToString),
    acc
  );
}

export function reduceToString<T>(data: InfiniNode<T>, acc: SQL = {}) {
  return toSQL(reducer(data, acc, reduceToString));
}

export function toSQL(sql: SQL): string {
  return (
    writeWith(sql.with || []) +
    writeSelect(sql.select) +
    writeFrom(sql.from) +
    writeWhere(sql.where) +
    writeGroupby(sql.groupby) +
    writeHaving(sql.having) +
    writeOrderBy(sql.orderby) +
    writeLimit(sql.limit) +
    writeOffset(sql.offset)
  );
}

function writeSelect(select: Array<string> = []): string {
  return select.length ? 'SELECT ' + select.join(', ') : 'SELECT *';
}
function writeFrom(from: string = ''): string {
  return ' FROM ' + from;
}
function writeWhere(where: Array<string> = []): string {
  return where.length ? ' WHERE ' + where.join(' AND ') : '';
}
function writeGroupby(groupby: Array<string> = []): string {
  return groupby.length ? ' GROUP BY ' + groupby.join(', ') : '';
}
function writeHaving(having: Array<string> = []): string {
  return having.length ? ' HAVING ' + having.join(' AND ') : '';
}
function writeOrderBy(orderby: Array<string> = []): string {
  return orderby.length ? ' ORDER BY ' + orderby.join(', ') : '';
}
function writeLimit(limit: number = 0): string {
  return limit > 0 ? ' LIMIT ' + limit : '';
}
function writeOffset(offset: number = 0): string {
  return offset > 0 ? ' OFFSET ' + offset : '';
}
function writeWith(With: Array<any> = []): string {
  return With && With.length
    ? 'WITH ' + With[0].name + ' AS (' + With[0].subQuery + ') '
    : '';
}
