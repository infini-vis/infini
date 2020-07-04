import { reducer } from './reducer';
import { Transform } from '../types';

test('Parser', () => {
  expect(
    reducer<Transform>({
      type: 'root',
      source: 'taxis',
      transform: [
        {
          type: 'aggregate',
          fields: ['*'],
          ops: ['count'],
          as: ['series_1'],
          groupby: {
            type: 'bin',
            field: 'binCol',
            extent: [-21474830, 3950611.6],
            maxbins: 12,
            as: 'binColAs',
          },
        },
        {
          type: 'filter',
          id: 'test',
          expr:
            'compareCol >= -73.99460014891815 AND compareCol <= -73.78028987584129',
        },
        {
          type: 'filter',
          id: 'test',
          expr: {
            type: 'between',
            field: 'betweenCol',
            left: 40.63646686110235,
            right: 40.81468768513369,
          },
        },
      ],
    } as any)
  ).toStrictEqual({
    select: [
      'CASE WHEN binCol >= 3950611.6 THEN 11 else cast((cast(binCol AS float) - -21474830) * 4.719682036909046e-7 AS int) end AS binColAs',
      'count(*) AS series_1',
    ],
    from: 'taxis',
    where: [
      '((binCol >= -21474830 AND binCol <= 3950611.6) OR (binCol IS NULL))',
      '(compareCol >= -73.99460014891815 AND compareCol <= -73.78028987584129)',
      '(betweenCol BETWEEN 40.63646686110235 AND 40.81468768513369)',
    ],
    groupby: ['binColAs'],
    having: [
      `((binColAs >= 0 AND binColAs < 12) OR binColAs IS NULL)`,
    ],
  });
});
