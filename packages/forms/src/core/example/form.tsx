import { left, right } from 'fp-ts/lib/Either';
import * as F from '..';

export enum TagType {
  TypeA = 'TypeA',
  TypeB = 'TypeB',
  TypeC = 'TypeC',
}

const Form = F.create()
  .require<{ client: 'client' }>()
  .expect<{ surname: [string, string] }>()
  .add(
    'name',
    F.dyn(o =>
      F.text(
        F.dyn(me => `Name ${me || ''} ${o.partial.surname || ''}`),
        v => v.required().andThen(v => right({ tag: 'name', value: v }))
      )
    )
  )
  .add(
    'surname',
    F.text(
      F.dyn(v => `Surname ${v || ''}`),
      F.dyn(
        dyn => val =>
          val
            .required()
            .andThen(v =>
              v.length > 2 ? right(v) : left(`Min length 3, current length ${dyn?.length || 0}`)
            )
      )
    )
  )
  .add(
    'record',
    F.dyn(v =>
      F.record(b =>
        b
          .add(
            `abc`,
            F.text(`abc ${v.partial.name}`, v => v.required())
          )
          .build(v => v.map(x => x.abc), {
            visible: v.partial.name === 'name',
          })
      )
    )
  )
  .add(
    'optional',
    F.text('Optional', v => v)
  )
  .add(
    'record2',
    F.record(b =>
      b
        .add(
          'record_field',
          F.text('Record field', v => v)
        )
        .build(v => v)
    )
  )
  .add(
    'list',
    F.list(
      'List',
      F.create()
        .add(
          'list_item',
          F.text('List item', v => v.required())
        )
        .add(
          'list_item2',
          F.text('List item2', v => v)
        ),
      v => v.required(),
      {
        minItems: 1,
      }
    )
  )
  .add(
    'age',
    F.number('Age', v => v.required().andThen(v => (v > 10 ? right(v) : left('Min age 10'))))
  )
  .add(
    'value',
    F.dyn(o =>
      F.value(o.valid.age ? o.valid.age + 1 : null, v => v.required(), {
        visible: {
          label: 'Age + 1 Value',
          edited: o.state?.age.edited || false,
        },
      })
    )
  )
  .add(
    'depends_name',
    F.dyn(o =>
      F.text(`Depends Name ${o.req.client} ${o.partial.name || 'empty'}`, v_ =>
        v_.andThen(d => {
          if (o.partial.name !== 'age') {
            return right(d);
          }
          return left('Dont like age in name');
        })
      )
    )
  )
  .add(
    'number',
    F.number('Number', v => v.required())
  )
  .add(
    'number_opt',
    F.number('Number Optional', v => v)
  )
  .add(
    'percent',
    F.percentage100('Percent', v => v.required())
  )
  .add(
    'search',
    F.search(
      'Search',
      _ =>
        Promise.resolve(
          right(
            [...Array(10).keys()].map(idx => ({
              value: idx.toString(),
              title: `title_${idx}`,
              subtitle: `subtitle_${idx}`,
            }))
          )
        ),
      (v1, v2) => v1 === v2,
      b => b.required()
    )
  )
  .add(
    'tags',
    F.tags(
      'Tags',
      _ =>
        Promise.resolve(
          right(
            [...Array(10).keys()].map(idx => ({
              id: idx.toString(),
              tag: `tag_${idx}`,
            }))
          )
        ),
      b => b.required(),
      {
        minItems: 1,
        selectFrom: {
          tags: [
            { id: '1', tag: 'abc' },
            { id: '2', tag: 'def' },
            { id: '3', tag: 'ghi' },
          ],
          freeForm: false,
        },
      }
    )
  )
  .add(
    'typedTags',
    F.typedTags(
      'Typed Tags',
      Object.keys(TagType)
        .filter(item => {
          return isNaN(Number(item));
        })
        .map(x => ({ value: x as TagType, label: x })),
      ({ type }) =>
        Promise.resolve(
          right(
            [...Array(20).keys()].map(idx => ({
              id: idx.toString(),
              type,
              tag: `Tag${type}_${idx}`,
            }))
          )
        ),
      b => b.required(),
      {
        minItems: 1,
      }
    )
  )
  .add(
    'select',
    F.select(
      'Select',
      [
        { name: 'Option A', value: 'optionA' },
        { name: 'Option B', value: 'optionB' },
      ],
      v => v
    )
  )
  .add(
    'select_chips',
    F.select(
      'Select Chips',
      [
        { name: 'Option A', value: 'optionA' },
        { name: 'Option B', value: 'optionB' },
      ],
      v => v,
      { chips: true }
    )
  )
  .add(
    'mulitselect',
    F.multiSelect(
      'MultiSelect',
      [
        {
          name: 'Option A',
          value: 'optionA',
          subOptions: [
            {
              name: 'Option A 1',
              value: 'optionA1',
              subOptions: [{ name: 'Option A 1 1', value: 'optionA11' }],
            },
            { name: 'Option A 2', value: 'optionA2' },
            { name: 'Option A 3', value: 'optionA3' },
            { name: 'Option A 4', value: 'optionA4' },
          ],
        },
        { name: 'Option B', value: 'optionB' },
        { name: 'Option C', value: 'optionC' },
        { name: 'Option D', value: 'optionD' },
        { name: 'Option E', value: 'optionE' },
        {
          name: 'Option F',
          value: 'optionF',
          subOptions: [
            {
              name: 'Option F 1',
              value: 'optionF1',
            },
          ],
        },
      ],
      v => v,
      {
        dropdown: true,
      }
    )
  )
  .add(
    'mulitselect2',
    F.multiSelect(
      'MultiSelect2',
      [
        {
          name: 'Option A',
          value: 'optionA',
          subOptions: [
            {
              name: 'Option A 1',
              value: 'optionA1',
              subOptions: [{ name: 'Option A 1 1', value: 'optionA11' }],
            },
            { name: 'Option A 2', value: 'optionA2' },
            { name: 'Option A 3', value: 'optionA3' },
            { name: 'Option A 4', value: 'optionA4' },
          ],
        },
        { name: 'Option B', value: 'optionB' },
      ],
      v => v
    )
  )
  .add(
    'optional1',
    F.text('Optional', v => v)
  )
  .add(
    'optional2',
    F.text('Optional', v => v)
  )
  .add(
    'optional3',
    F.text('Optional', v => v)
  )
  .add(
    'optional4',
    F.text('Optional', v => v)
  )
  .add(
    'optional5',
    F.text('Optional', v => v)
  )
  .add(
    'optional6',
    F.text('Optional', v => v)
  )
  .add(
    'optional7',
    F.text('Optional', v => v)
  )
  .add(
    'optional8',
    F.text('Optional', v => v)
  )
  .add(
    'optional9',
    F.text('Optional', v => v)
  )
  .add(
    'optional10',
    F.text('Optional', v => v)
  )
  .add(
    'optional11',
    F.text('Optional', v => v)
  )
  .add(
    'optional12',
    F.text('Optional', v => v)
  )
  .add(
    'optional13',
    F.text('Optional', v => v)
  )
  .add(
    'optional14',
    F.text('Optional', v => v)
  );

type State = F.GetRecordPartialState<typeof Form>;
type Partial = F.GetPartial<typeof Form>;
const s = (p: Partial) => {};
type Valid = F.GetValid<typeof Form>;

export default Form;
