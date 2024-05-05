import './App.css';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LeafPage } from './pages/LeafPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { AppConfigProvider } from './providers/AppConfigProvider';

export const App = () => {
  return (
    <main className="w-full h-full">
      <AppConfigProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leafs/:name" element={<LeafPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
        </Routes>
      </AppConfigProvider>
    </main>
  );
};

export default App;
