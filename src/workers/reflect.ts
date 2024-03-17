import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputToolsParser } from 'langchain/output_parsers';

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

self.onmessage = async (event: MessageEvent) => {
  const model = new ChatOpenAI({ openAIApiKey: event.data.key });
  const modelWithTools = model.bind({
    tools: [enhancedContentTool],
    tool_choice: enhancedContentTool,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      "You are a helpful writing assistant. Your job is to improve the user's writing by suggesting enhancements in the content. Only suggest enhancements if they are relevant and helpful. If the content is already good, don't suggest any changes.",
    ],
    ['human', 'Here is my content: {content}'],
  ]);

  const outputParser = new JsonOutputToolsParser();
  const chain = prompt.pipe(modelWithTools).pipe(outputParser);
  const response: any = await chain.invoke({
    content: JSON.stringify(event.data.blocks),
  });

  self.postMessage(response?.[0].args.enhancedParagraphs);
};
