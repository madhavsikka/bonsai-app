import './App.css';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LeafPage } from './pages/LeafPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { useZoom } from './hooks/useZoom';

export const App = () => {
  const {} = useZoom();
  return (
    <main className="w-full h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leafs/:name" element={<LeafPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Routes>
    </main>
  );
};

export default App;
