import { parseWith } from './parseWith';
import { reduceToString } from './reducer';

test('parse project', () => {
  expect(parseWith({}, {} as any, reduceToString)).toStrictEqual({});

  expect(
    parseWith(
      {},
      {
        type: 'with',
        as: 'ass',
        data: {
          type: 'root',
          source: 'test',
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
      },
      reduceToString
    )
  ).toStrictEqual({
    with: [
      {
        subQuery:
          'SELECT dest_city, avg(depdelay) AS val FROM test GROUP BY dest_city',
        as: 'ass',
      },
    ],
  });
});
