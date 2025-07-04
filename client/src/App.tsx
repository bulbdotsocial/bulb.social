import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import InstagramFeed from './components/InstagramFeed';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <InstagramFeed />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
