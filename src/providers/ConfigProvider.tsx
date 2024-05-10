import { useGetConfig } from '@/hooks/config/useGetConfig';
import { useSetConfig } from '@/hooks/config/useSetConfig';
import { Config } from '@/types/config';
import React, { createContext, useContext, useEffect, useState } from 'react';

const DEFAULT_CONFIG: Config = {
  openaiApiKey: '',
  theme: 'dark',
};

type ConfigContextType = {
  config: Config;
  setConfig: (config: Partial<Config>) => void;
};

const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  setConfig: () => {},
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const { config: appConfig } = useGetConfig();
  const setAppConfig = useSetConfig();

  useEffect(() => {
    if (appConfig) {
      setConfig(appConfig);
    }
  }, [appConfig]);

  const updateConfig = (newConfig: Partial<Config>) => {
    setConfig((prevConfig) => {
      const updatedConfig = { ...prevConfig, ...newConfig };
      setAppConfig(updatedConfig);
      return updatedConfig;
    });
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig: updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
