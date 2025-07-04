import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './theme';
import Layout from './components/Layout';
import InstagramFeed from './components/InstagramFeed';
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<InstagramFeed />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/explore" element={<InstagramFeed />} />
            <Route path="/activity" element={<InstagramFeed />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
