import { useGetConfig } from '@/hooks/config/useGetConfig';
import { CONFIG_KEYS } from '@/types/config';
import React from 'react';

export interface AppConfig {
  openAIAPIKey?: string;
}

const AppConfigContext = React.createContext<AppConfig>({});

export const useAppConfig = (): AppConfig => {
  return React.useContext(AppConfigContext);
};

export const AppConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [config, setConfig] = React.useState<AppConfig>({});

  const { config: openAIAPIKey } = useGetConfig(CONFIG_KEYS.OPENAI_API_KEY);

  React.useEffect(() => {
    setConfig({ openAIAPIKey });
  }, [openAIAPIKey]);

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};
