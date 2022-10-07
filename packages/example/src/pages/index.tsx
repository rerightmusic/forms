import { createTheme, ThemeProvider } from '@mui/material';
import * as F from 'forms';

const Example = () => {
  return (
    <ThemeProvider theme={createTheme({})}>
      <div suppressHydrationWarning>
        <F.Example />
      </div>
    </ThemeProvider>
  );
};
export default Example;
