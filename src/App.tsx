import './App.css';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LeafPage } from './pages/LeafPage';
import { PreferencesPage } from './pages/PreferencesPage';

export const App = () => {
  return (
    <main className="w-full h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leafs/:id" element={<LeafPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Routes>
    </main>
  );
};

export default App;
