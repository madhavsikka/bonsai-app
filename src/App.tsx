import './App.css';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LeafPage } from './pages/LeafPage';
import { PreferencesPage } from './pages/PreferencesPage';
import useGlobalShortcuts from './hooks/shortcuts/useGlobalShortcuts';
import { useDarkmode } from './hooks/useDarkMode';
import { ConfigProvider } from './providers/ConfigProvider';
import { SagePage } from './pages/SagePage';

const AppContent = () => {
  useDarkmode();
  useGlobalShortcuts();
  return (
    <main className="w-full h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leafs/:name" element={<LeafPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/sages" element={<SagePage />} />
      </Routes>
    </main>
  );
};

export const App = () => {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
};

export default App;
