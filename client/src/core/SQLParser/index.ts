import { parseExpression } from './parseExpression';
import { parseAggregate } from './parseAggregate';
import { parseBin } from './parseBin';
import { parseSort } from './parseSort';
import { parseLimit } from './parseLimit';
import { parseFilter } from './parseFilter';
import { parseResolvefilter } from './parseResolvefilter';
import { parseCrossfilter } from './parseCrossfilter';
import { parseProject } from './parseProject';
import { parseWith } from './parseWith';
import { parseHaving } from './parseHaving';
import { parseSource } from './parseSource';
import { SQL, Transform, Expression } from '../types';
import { reducer, toSQL } from './reducer';

export type TransformParser = (
  sql: SQL,
  acc: Transform,
  reduceToString: Function
) => SQL;
export type ExpressionParser = (expr: string | Expression) => string;
export type expressions = { [key: string]: ExpressionParser };
export type transformers = { [key: string]: TransformParser };

let expressions: expressions = {};
let transformers: transformers = {
  aggregate: parseAggregate,
  bin: parseBin,
  source: parseSource,
  sort: parseSort,
  limit: parseLimit,
  filter: parseFilter,
  having: parseHaving,
  project: parseProject,
  resolvefilter: parseResolvefilter,
  crossfilter: parseCrossfilter,
  with: parseWith,
};

export class SQLParser {
  static registerTransform(type: string, parser: TransformParser) {
    transformers[type] = parser;
  }
  static registerExpression(type: string, parser: ExpressionParser) {
    expressions[type] = parser;
  }

  static parseExpression(expression: any) {
    if (typeof expressions[expression.type] !== 'undefined') {
      return expressions[expression.type](expression);
    }
    return parseExpression(expression);
  }

  static parseTransform(
    sql: SQL,
    transform: Transform,
    reduceToString: Function
  ): SQL {
    if (typeof transformers[transform.type] !== 'undefined') {
      return transformers[transform.type](sql, transform, reduceToString);
    }
    return sql;
  }
}

export {
  parseExpression,
  parseAggregate,
  parseBin,
  parseSort,
  parseLimit,
  parseFilter,
  parseResolvefilter,
  parseCrossfilter,
  parseProject,
  parseWith,
  parseHaving,
  parseSource,
  reducer,
  toSQL,
};
