import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ChatPage from './pages/ChatPage';
import WorkspacesPage from './pages/WorkspacesPage';
import BrowserPage from './pages/BrowserPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <index element={<ChatPage />} />
          <Route index element={<ChatPage />} />
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="browser" element={<BrowserPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
