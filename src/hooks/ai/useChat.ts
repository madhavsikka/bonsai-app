import { useCallback, useEffect, useState } from 'react';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { v4 as uuid } from 'uuid';
import { useGetConfig } from '../config/useGetConfig';
import { CONFIG_KEYS } from '@/types/config';

export enum ChatMessageRole {
  User = 'user',
  Bonsai = 'bonsai',
  System = 'system',
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
}
export interface useChatProps {
  initialMessages?: ChatMessage[];
}

const chatMessageToLangchainMessage = (message: ChatMessage): HumanMessage => {
  switch (message.role) {
    case ChatMessageRole.Bonsai:
      return new AIMessage({ content: message.content });
    case ChatMessageRole.User:
      return new HumanMessage({ content: message.content });
    case ChatMessageRole.System:
      return new SystemMessage({ content: message.content });
  }
};

export const useChat = ({ initialMessages = [] }: useChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [chatModel, setChatModel] =
    useState<ChatOpenAI<ChatOpenAICallOptions>>();
  const { config: openAIApiKey } = useGetConfig(CONFIG_KEYS.OPENAI_API_KEY);

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = new ChatOpenAI({
          maxTokens: 250,
          streaming: true,
          openAIApiKey,
        });
        setChatModel(newChat);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };
    if (openAIApiKey) {
      initChat();
    }
  }, [openAIApiKey]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const updatedMessages = [
      ...messages,
      { id: uuid(), role: ChatMessageRole.User, content: input },
      { id: uuid(), role: ChatMessageRole.Bonsai, content: '' },
    ];
    console.log('updatedMessages', updatedMessages);
    setMessages(updatedMessages);
    setInput('');

    chatModel?.invoke(updatedMessages.map(chatMessageToLangchainMessage), {
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            lastMessage.content += token;
            setMessages([...updatedMessages]);
          },
        },
      ],
    });
  }, [messages, input]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
  };
};
