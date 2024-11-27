import { ChatPromptTemplate } from '@langchain/core/prompts';
import { WorkerAIBlock, WorkerAIResponseBlock } from '@/extensions/Reflect';
import { ChatOllama } from '@langchain/ollama';

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
        text: {
          type: 'string',
          description: 'The updated text of the paragraph',
        },
      },
      required: ['blockId', 'text'],
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
  const { name, blocks, prompt } =
    event.data as WorkerAIMessagePayload;

  // const model = new ChatOpenAI({
  //   openAIApiKey: openaiApiKey,
  //   modelName: 'gpt-4o',
  // });

  const model = new ChatOllama({
    model: 'llama3.2:3b',
    temperature: 0,
  });

  const modelWithTools = model.bind({
    tools: [enhancedContentTool],
  });

  const processBlocks = blocks.map(async (block) => {
    const { blockId, text, aiChatMessages } = block;

    const groupAiChatMessages = aiChatMessages?.[name] ?? [];
    const chatPromptMessages = [
      ['system', prompt],
      ['human', 'Here is my content: {content}'],
      ...(groupAiChatMessages?.map((message) => [
        message.role === 'user'
          ? 'human'
          : message.role === 'system'
            ? 'system'
            : 'ai',
        message.content ?? '',
      ]) ?? []),
    ] as [string, string][];

    const chatPrompt = ChatPromptTemplate.fromMessages(chatPromptMessages);
    const chain = chatPrompt.pipe(modelWithTools);
    const chainResponse: any = await chain.invoke({
      content: JSON.stringify({ blockId, text }),
    });

    let response: WorkerAIResponseBlock[] = [];
    const toolArgs = chainResponse?.tool_calls?.[0]?.args;

    if (!toolArgs) {
      console.warn('No tool arguments received from the model');
      return [];
    }

    if (typeof toolArgs === 'string') {
      try {
        response = JSON.parse(toolArgs).enhancedParagraphs;
      } catch (e) {
        console.error('Failed to parse string tool arguments:', e);
        return [];
      }
    } else if (toolArgs.enhancedParagraphs) {
      if (typeof toolArgs.enhancedParagraphs === 'string') {
        try {
          response = JSON.parse(toolArgs.enhancedParagraphs ?? '[]');
        } catch (e) {
          console.error('Failed to parse enhancedParagraphs string:', e);
          return [];
        }
      } else {
        response = toolArgs.enhancedParagraphs;
      }
    }

    // Ensure response is always an array
    return Array.isArray(response) ? response : [];
  });
  const allResponses = (await Promise.all(processBlocks)).flat();
  self.postMessage({ name, response: allResponses });
};
