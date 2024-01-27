import { useEffect } from 'react';
import './App.css';
import ThemeSwitcher from './components/theme-switcher';
import { Button } from './components/ui/button';
import useDB from './hooks/useDB';
import { BlockEditor } from './components/editor';

export const App = () => {
  // const { db } = useDB();

  // useEffect(() => {
  //   if (!db) return;
  //   (async () => {
  //     await db.execute(
  //       'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)'
  //     );
  //     await db.execute('INSERT INTO users (name) VALUES (?)', ['John']);
  //     const res = await db.select('SELECT * FROM users');
  //     console.log(res);
  //   })();
  // }, [db]);

  return (
    <main className="w-full h-full">
      <BlockEditor />
      <ThemeSwitcher />
    </main>
  );
};

export default App;
