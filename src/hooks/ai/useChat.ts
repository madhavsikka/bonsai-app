import { useCallback, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'bonsai' | 'user';
  content: string;
}
export interface useChatProps {}

export const useChat = ({}: useChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
