import _ from 'lodash';
import { isTag, recurseReduce } from './object';

jest.setTimeout(60000);

describe('Data', () => {
  test('recurseReduce', () => {
    const res: Record<string, { tag: 'tag'; value: any }> = {
      a: {
        tag: 'tag',
        value: 0,
      },
      b: {
        tag: 'tag',
        value: {
          b1: { tag: 'tag', value: 1 },
        },
      },
      c: {
        tag: 'tag',
        value: [
          {
            tag: 'tag',
            value: 1,
          },
        ],
      },
      d: {
        tag: 'tag',
        value: [1],
      },
      e: {
        tag: 'tag',
        value: { x: 1 },
      },
      f: {
        tag: 'tag',
        value: null,
      },
      g: {
        tag: 'tag',
        value: [],
      },
      h: {
        tag: 'tag',
        value: {},
      },
      i: {
        tag: 'tag',
        value: {
          tag: 'tag',
          value: {},
        },
      },
      k: {
        tag: 'tag',
        value: {
          l: { tag: 'tag', value: 1 },
        },
      },
      m: {
        tag: 'tag',
        value: 'ignore',
      },
      n: {
        tag: 'tag',
        value: [
          {
            tag: 'tag',
            value: 1,
          },
        ],
      },
      o: {
        tag: 'tag',
        value: {
          p: { tag: 'tag', value: [] },
        },
      },
      q: {
        tag: 'tag',
        value: [
          {
            tag: 'tag',
            value: { x: { tag: 'tag', value: 'ignore' } },
          },
          {
            tag: 'tag',
            value: { x: { tag: 'tag', value: 'ignore' } },
          },
        ],
      },
    };

    const tags = recurseReduce(
      res,
      { if: isTag<{ tag: 'tag'; value: any }>('tag'), recurse: x => x.value },
      (state, v, keys, ignore) => {
        return {
          value: v._tag,
          state: {
            lefts: state.lefts + (v._tag === 'Left' ? 1 : 0),
            keys: state.keys.concat([keys.map(x => x.toString())]),
          },
        };
      },
      { lefts: 0, keys: [] as string[][] }
    );

    expect(tags).toEqual({
      state: {
        lefts: 5,
        keys: [
          ['a'],
          ['b', 'b1'],
          ['c', '0'],
          ['d'],
          ['e'],
          ['f'],
          ['g'],
          ['h'],
          ['i'],
          ['k', 'l'],
          ['m'],
          ['n', '0'],
          ['o', 'p'],
          ['q', '0', 'x'],
          ['q', '1', 'x'],
        ],
      },
      record: {
        a: 'Right',
        b: { b1: 'Right' },
        c: ['Right'],
        d: 'Right',
        e: 'Right',
        f: 'Left',
        g: 'Left',
        h: 'Left',
        i: 'Left',
        k: { l: 'Right' },
        m: 'Right',
        n: ['Right'],
        o: { p: 'Left' },
        q: [{ x: 'Right' }, { x: 'Right' }],
      },
    });

    const values = recurseReduce(
      res,
      { if: isTag<{ tag: 'tag'; value: any }>('tag'), recurse: x => x.value },
      (state, v, keys, ignore) => {
        return {
          value:
            v._tag === 'Left' ? v.left.value : v.right.value !== 'ignore' ? v.right.value : ignore,
          state: {
            lefts: state.lefts + (v._tag === 'Left' ? 1 : 0),
            keys: state.keys.concat([keys.map(x => x.toString())]),
          },
        };
      },
      { lefts: 0, keys: [] as string[][] }
    );

    expect(values).toEqual({
      state: {
        lefts: 5,
        keys: [
          ['a'],
          ['b', 'b1'],
          ['c', '0'],
          ['d'],
          ['e'],
          ['f'],
          ['g'],
          ['h'],
          ['i'],
          ['k', 'l'],
          ['m'],
          ['n', '0'],
          ['o', 'p'],
          ['q', '0', 'x'],
          ['q', '1', 'x'],
        ],
      },
      record: {
        a: 0,
        b: { b1: 1 },
        c: [1],
        d: [1],
        e: {
          x: 1,
        },
        f: null,
        g: [],
        h: {},
        i: {},
        k: { l: 1 },
        n: [1],
        o: { p: [] },
      },
    });
  });
});
