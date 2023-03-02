import { Box } from '@mui/material';
import { right } from 'fp-ts/lib/Either';
import * as F from '..';
import Form, { TagType } from './form';

const EditForm_ = Form.interpret(F.ReactEditRecordInputBlock);
const ViewForm_ = Form.interpret(F.ReactViewRecordInput);

const Example = () => {
  return (
    <Box sx={{ p: '20px' }}>
      <EditForm_
        onChange={s => console.info(s)}
        client="client"
        value={{
          name: 'a',
          flag: true,
          list: [
            { list_item: 'abc', list_item2: 'def' },
            { list_item: 'abc', list_item2: 'def' },
          ],
          search: {
            title: 'Title',
            subtitle: 'Subtitle',
            value: 'value',
          },
          select: 'optionA',
          mulitselect: [
            {
              value: 'optionA',
              subOptions: [{ value: 'optionA1', subOptions: [{ value: 'optionA11' }] }],
            },
            { value: 'optionB' },
          ],
          mulitselect2: [
            {
              value: 'optionA',
              subOptions: [{ value: 'optionA1', subOptions: [{ value: 'optionA11' }] }],
            },
            { value: 'optionB' },
          ],
          tags: [
            { id: '1', tag: 'abc' },
            { id: '2', tag: 'def' },
            { id: '3', tag: 'ghi' },
          ],
          typedTags: [
            { id: '1', type: TagType.TypeA, tag: 'TagTypeA1' },
            { id: '2', type: TagType.TypeB, tag: 'TagTypeB2' },
            { id: '3', type: TagType.TypeC, tag: 'TagTypeC3' },
          ],
          record2: { record_field: 'b' },
          date: '2022-01-25',
        }}
        submit={{
          footer: false,
          onSubmit: v => {
            return Promise.resolve(right(console.info(JSON.stringify(v))));
          },
        }}
      />
      <Box sx={{ mt: '20px' }}></Box>
      <ViewForm_
        client="client"
        value={{
          name: 'a',
          age: 11,
          flag: true,
          list: [
            { list_item: 'abc', list_item2: 'def' },
            { list_item: 'abc', list_item2: 'def' },
          ],
          search: {
            title: 'Title',
            subtitle: 'Subtitle',
            value: 'value',
          },
          select: 'optionA',
          mulitselect: [
            {
              value: 'optionA',
              subOptions: [{ value: 'optionA1', subOptions: [{ value: 'optionA11' }] }],
            },
            { value: 'optionB' },
          ],
          tags: [
            { id: '1', tag: 'abc' },
            { id: '2', tag: 'def' },
            { id: '3', tag: 'ghi' },
          ],
          typedTags: [
            { id: '1', type: TagType.TypeA, tag: 'abc' },
            { id: '2', type: TagType.TypeB, tag: 'def' },
            { id: '3', type: TagType.TypeC, tag: 'ghi' },
          ],
          record2: { record_field: 'b' },
        }}
      />
    </Box>
  );
};
export default Example;
