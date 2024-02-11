import { useCallback, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'bonsai' | 'user';
  content: string;
}
export interface useChatProps {}

export const useChat = ({}: useChatProps) => {
  // @ts-ignore
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // @ts-ignore
  const [input, setInput] = useState<string>('');

  const handleInputChange = useCallback(() => {}, []);
  const handleSubmit = useCallback(() => {}, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
  };
};
