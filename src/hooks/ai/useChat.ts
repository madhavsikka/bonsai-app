import { useCallback, useEffect, useState } from 'react';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { v4 as uuid } from 'uuid';
import { useGetConfig } from '../config/useGetConfig';

export enum ChatMessageRole {
  User = 'user',
  Bonsai = 'bonsai',
  System = 'system',
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  artifacts?: ChatArtifact[];
}

export interface ChatArtifact {
  id: string;
  content: string;
}

export interface useChatProps {
  initialMessages?: ChatMessage[];
}

const chatMessageToLangchainMessage = (message: ChatMessage): HumanMessage => {
  switch (message.role) {
    case ChatMessageRole.User:
      return new HumanMessage({ content: `\`\`\`${message.artifacts?.map(artifact => artifact.content).join('\n')}\`\`\`\n\n${message.content}` });
    case ChatMessageRole.System:
      return new SystemMessage({ content: message.content });
    default:
      return new AIMessage({ content: message.content });
  }
};

export const useChat = ({ initialMessages = [] }: useChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [inputArtifacts, setInputArtifacts] = useState<ChatArtifact[]>([]);
  const [chatModel, setChatModel] =
    useState<ChatOpenAI<ChatOpenAICallOptions> | ChatOllama>();
  const { config, isLoading } = useGetConfig();

  useEffect(() => {
    const initChat = async () => {
      // const openaiApiKey = config?.openaiApiKey ?? '';
      try {
        // const newChat = new ChatOpenAI({
        //   maxTokens: 250,
        //   streaming: true,
        //   openAIApiKey: openaiApiKey,
        // });
        const newChat = new ChatOllama({
          model: 'llama3.2:3b',
          temperature: 0,
        });
        setChatModel(newChat);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };
    if (config && !isLoading) {
      initChat();
    }
  }, [config, isLoading]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const updatedMessages = [
      ...messages,
      {
        id: uuid(),
        role: ChatMessageRole.User,
        content: input,
        artifacts: inputArtifacts,
      },
      {
        id: uuid(),
        role: ChatMessageRole.Bonsai,
        content: '',
        artifacts: [],
      },
    ];
    setMessages(updatedMessages);
    setInput('');
    setInputArtifacts([]);

    // @ts-ignore
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
  }, [messages, input, inputArtifacts]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    setInputArtifacts,
    inputArtifacts,
  };
};
