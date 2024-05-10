import { CommandK } from '@/components/command/commandk';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { UIButton } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '@/providers/ConfigProvider';

export const PreferencesPage = () => {
  const navigate = useNavigate();
  const { config, setConfig } = useConfig();
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [theme, setTheme] = useState('');

  useEffect(() => {
    if (config) {
      console.log({ config });
      setOpenaiApiKey(config.openaiApiKey);
      setTheme(config.theme);
    }
  }, [config]);

  const handleOpenAiApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setOpenaiApiKey(e.target.value);
    },
    []
  );

  const handleThemeChange = useCallback((value: string) => {
    setTheme(value);
  }, []);

  const handleSaveClick = useCallback(() => {
    setConfig({ openaiApiKey, theme });
    navigate(-1);
  }, [openaiApiKey, theme]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 justify-end">
          <CommandK />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col h-full justify-start items-center">
            {config ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl flex justify-between items-center">
                    <span>Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your app preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid w-full items-center gap-6">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="key">OPENAI API Key</Label>
                        <Input
                          id="key"
                          placeholder="Key"
                          className="w-[400px]"
                          value={openaiApiKey}
                          onChange={handleOpenAiApiKeyChange}
                          type="password"
                        />
                      </div>
                      <div>
                        <Select onValueChange={handleThemeChange} value={theme}>
                          <Label htmlFor="theme">Theme</Label>
                          <SelectTrigger className="w-[400px]">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Theme</SelectLabel>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <UIButton variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </UIButton>
                  <UIButton onClick={handleSaveClick}>Save</UIButton>
                </CardFooter>
              </Card>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};
