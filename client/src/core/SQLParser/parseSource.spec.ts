import { parseSource } from './parseSource';
import { reduceToString } from './reducer';

test('parse Source', () => {
  expect(parseSource({}, {} as any, reduceToString)).toStrictEqual({});

  expect(
    parseSource(
      {},
      {
        type: 'source',
        source: [
          {
            type: 'scan',
            table: 'map',
          },
        ],
      },
      reduceToString
    )
  ).toStrictEqual({ from: 'map' });
  expect(
    parseSource(
      {},
      {
        type: 'source',
        source: [
          {
            type: 'scan',
            table: 'cars',
          },
          {
            type: 'scan',
            table: 'tesla',
          },
          {
            type: 'join',
            as: 'table1',
          },
          {
            type: 'scan',
            table: 'ford',
          },
          {
            type: 'join.right',
            as: 'table2',
          },
          {
            type: 'scan',
            table: 'benz',
          },
          {
            type: 'join.left',
            as: 'table3',
          },
        ],
      },
      reduceToString
    )
  ).toStrictEqual({
    from: `cars JOIN tesla AS table1 RIGHT JOIN ford AS table2 LEFT JOIN benz AS table3`,
  });

  expect(
    parseSource(
      {},
      {
        type: 'source',
        source: [
          {
            type: 'scan',
            table: 'cars',
          },
          {
            type: 'scan',
            table: 'zipcode',
          },
          {
            type: 'join.inner',
            as: 'table1',
          },
          {
            type: 'root',
            source: 'cars',
            transform: [
              {
                type: 'aggregate',
                groupby: ['dest_city'],
                fields: ['depdelay'],
                ops: ['average'],
                as: ['val'],
              },
            ],
          } as any,
          {
            type: 'join.left',
            as: 'table2',
          },
        ],
      },
      reduceToString
    )
  ).toStrictEqual({
    from:
      'cars INNER JOIN zipcode AS table1 LEFT JOIN (SELECT dest_city, avg(depdelay) AS val FROM cars GROUP BY dest_city) AS table2',
  });
});
