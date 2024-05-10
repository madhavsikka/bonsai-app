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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetConfig } from '@/hooks/config/useGetConfig';
import { useSetConfig } from '@/hooks/config/useSetConfig';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PreferencesPage = () => {
  const navigate = useNavigate();
  const { config, isLoading } = useGetConfig();
  const setConfig = useSetConfig();
  const [openAiApiKey, setOpenAiApiKey] = useState('');

  useEffect(() => {
    if (config && config.openaiApiKey) {
      setOpenAiApiKey(config.openaiApiKey);
    }
  }, [config]);

  const handleOpenAiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAiApiKey(e.target.value);
  };

  const handleSaveClick = () => {
    setConfig({ openaiApiKey: openAiApiKey });
    navigate(-1);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground" />
                <Input
                  type="search"
                  placeholder="Search"
                  className="w-full appearance-none bg-background pl-8 shadow-none"
                />
              </div>
            </form>
          </div>
          <CommandK />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col h-full justify-start items-center">
            {!isLoading ? (
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
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="key">OPENAI API Key</Label>
                        <Input
                          id="key"
                          placeholder="Key"
                          value={openAiApiKey}
                          onChange={handleOpenAiApiKeyChange}
                          type="password"
                        />
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
