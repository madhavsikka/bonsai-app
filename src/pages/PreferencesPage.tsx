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
import { CONFIG_KEYS } from '@/types/config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PreferencesPage = () => {
  const navigate = useNavigate();
  const { config: openAIApiKey } = useGetConfig(CONFIG_KEYS.OPENAI_API_KEY);
  const setConfig = useSetConfig();
  const [openAiApiKey, setOpenAiApiKey] = useState('');

  const handleOpenAiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAiApiKey(e.target.value);
  };

  const handleSaveClick = () => {
    setConfig('openai_api_key', openAIApiKey);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <Card className="max-w-6xl w-full">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Setup your application</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">OPENAI API Key</Label>
                <Input
                  id="key"
                  placeholder="Key"
                  value={openAiApiKey}
                  onChange={handleOpenAiApiKeyChange}
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
    </div>
  );
};
