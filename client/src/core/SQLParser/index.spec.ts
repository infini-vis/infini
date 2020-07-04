import { SQLParser } from '.';

test('Parser', () => {
  SQLParser.registerExpression('custom', () => 'TEST');
  SQLParser.registerTransform('custom', () => ({ trans: 1 } as any));

  expect(SQLParser.parseExpression({ type: 'custom' })).toBe('TEST');
  expect(SQLParser.parseTransform({}, { type: 'custom' } as any)).toStrictEqual(
    {
      trans: 1,
    }
  );

  expect(
    SQLParser.parseTransform({}, { type: 'custom2' } as any)
  ).toStrictEqual({});

  expect(SQLParser.parseExpression({ type: '=', left: '1', right: '2' })).toBe(
    `1 = '2'`
  );
  expect(
    SQLParser.parseTransform(
      {},
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
      }
    )
  ).toStrictEqual({
    groupby: ['binColAs'],
    having: [`((binColAs >= 0 AND binColAs < 12) OR binColAs IS NULL)`],
    select: [
      `CASE WHEN binCol >= 3950611.6 THEN 11 else cast((cast(binCol AS float) - -21474830) * 4.719682036909046e-7 AS int) end AS binColAs`,
      `count(*) AS series_1`,
    ],
    where: [
      `((binCol >= -21474830 AND binCol <= 3950611.6) OR (binCol IS NULL))`,
    ],
  });
});
