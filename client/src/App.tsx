import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import InstagramFeed from './components/InstagramFeed';
import ProfilePage from './components/ProfilePage';
import UserProfilePage from './components/UserProfilePage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes wrapped in Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<InstagramFeed />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:address" element={<UserProfilePage />} />
                    <Route path="/explore" element={<InstagramFeed />} />
                    <Route path="/activity" element={<InstagramFeed />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
