import './App.css';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LeafPage } from './pages/LeafPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { useDarkmode } from './hooks/useDarkMode';
import { ConfigProvider } from './providers/ConfigProvider';
import { SagePage } from './pages/SagePage';

const AppContent = () => {
  useDarkmode();
  return (
    <main className="w-full h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leafs/:id" element={<LeafPage />} />
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
