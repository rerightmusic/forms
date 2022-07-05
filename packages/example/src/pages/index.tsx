import { Box } from '@mui/material';
import { ReactEditRecordInputBlock, ReactViewRecordInput } from 'forms';
import { right } from 'fp-ts/lib/Either';
import { Form } from '../form';
import { ThemeProvider, createTheme } from '@mui/material';

const EditForm_ = Form.interpret(ReactEditRecordInputBlock);
const ViewForm_ = Form.interpret(ReactViewRecordInput);

const Example = () => {
  return (
    <ThemeProvider theme={createTheme({})}>
      <div suppressHydrationWarning>
        <Box sx={{ p: '20px' }}>
          <EditForm_
            onChange={s => console.info(s)}
            client="client"
            value={{
              name: 'a',
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
              mulitselect: ['optionA', 'optionB'],
              tags: [
                { id: '1', tag: 'abc' },
                { id: '2', tag: 'def' },
                { id: '3', tag: 'ghi' },
              ],
              record2: { record_field: 'b' },
            }}
            onSubmit={v => {
              return Promise.resolve(right(console.info(JSON.stringify(v))));
            }}
          />
          <Box sx={{ mt: '20px' }}></Box>
          <ViewForm_
            client="client"
            value={{
              name: 'a',
              age: 11,
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
              mulitselect: ['optionA', 'optionB'],
              tags: [
                { id: '1', tag: 'abc' },
                { id: '2', tag: 'def' },
                { id: '3', tag: 'ghi' },
              ],
              record2: { record_field: 'b' },
            }}
          />
        </Box>
      </div>
    </ThemeProvider>
  );
};
export default Example;
