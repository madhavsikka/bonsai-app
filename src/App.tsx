import './App.css';
import ThemeSwitcher from './components/theme-switcher';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LeafPage } from './pages/LeafPage';

export const App = () => {
  return (
    <main className="w-full h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leafs/:id" element={<LeafPage />} />
      </Routes>
      <ThemeSwitcher />
    </main>
  );
};

export default App;
