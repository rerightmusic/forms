import { createTheme, ThemeProvider } from '@mui/material';
import Component from '../component';

const Example = () => {
  return (
    <ThemeProvider theme={createTheme({})}>
      <div suppressHydrationWarning>
        <Component />
      </div>
    </ThemeProvider>
  );
};
export default Example;
