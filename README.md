# Forms

## Install

```bash
yarn
```

## Build

```bash
yarn build
```

### Watch

```bash
yarn dev
```

View example page here <http://localhost:3000/>

## Examples

[Form](./packages/example/src/form.tsx)

```typescript
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
```

[Render](./packages/example/src/pages/index.tsx)

```typescript
const EditForm = Form.interpret(ReactEditRecordInputBlock);
return (
  <EditForm
    onChange={s => console.info(s)}
    client="client"
    value={{
      name: 'a'
    }}
    onSubmit={v => {
      return Promise.resolve(right(console.info(JSON.stringify(v))));
    }}
  />
)
```
