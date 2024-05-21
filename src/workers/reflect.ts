import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputToolsParser } from 'langchain/output_parsers';
import { WorkerAIBlock, WorkerAIResponseBlock } from '@/extensions/Reflect';

const properties = {
  enhancedParagraphs: {
    type: 'array',
    description: 'An array of enhanced paragraphs',
    items: {
      type: 'object',
      properties: {
        blockId: {
          type: 'string',
          description: 'The block id of the paragraph',
        },
        updatedText: {
          type: 'string',
          description: 'The updated text of the paragraph',
        },
      },
      required: ['blockId', 'updatedText'],
    },
  },
};

const enhancedContentTool = {
  type: 'function' as const,
  function: {
    name: 'enhanced_content',
    description:
      'Returns an array of enhanced paragraphs with their block ids and updated content.',
    parameters: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Enhanced Content',
      type: 'object',
      properties,
      required: ['enhancedParagraphs'],
    },
  },
};

export interface WorkerAIMessagePayload {
  name: string;
  prompt: string;
  openaiApiKey: string;
  blocks: WorkerAIBlock[];
}

export interface WorkerAIMessage extends MessageEvent {
  data: WorkerAIMessagePayload;
}

export interface WorkerAIResponse {
  name: string;
  response: WorkerAIResponseBlock[];
}

self.onmessage = async (event: WorkerAIMessage) => {
  const { name, openaiApiKey, blocks, prompt } = event.data;
  const model = new ChatOpenAI({ openAIApiKey: openaiApiKey });
  const modelWithTools = model.bind({
    tools: [enhancedContentTool],
    tool_choice: enhancedContentTool,
  });

  blocks.forEach(async (block) => {
    const { blockId, text, aiChatMessages } = block;

    console.log('aichatmessages', aiChatMessages);
    const chatPromptMessages = [
      ['system', prompt],
      ['human', 'Here is my content: {content}'],
      ...(aiChatMessages?.map((message) => [
        message.role === 'user'
          ? 'human'
          : message.role === 'system'
          ? 'system'
          : 'ai',
        message.content,
      ]) ?? []),
    ];

    const chatPrompt = ChatPromptTemplate.fromMessages(chatPromptMessages);

    const outputParser = new JsonOutputToolsParser();
    const chain = chatPrompt.pipe(modelWithTools).pipe(outputParser);
    const chainResponse: any = await chain.invoke({
      content: JSON.stringify({ blockId, text }),
    });
    const response = chainResponse?.[0]?.args
      ?.enhancedParagraphs as WorkerAIResponseBlock[];

    console.log('Received message from worker:', response);
    self.postMessage({ name, response });
  });
};
