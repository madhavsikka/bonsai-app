import { WorkerAIBlock, WorkerAIResponseBlock } from '@/extensions/Reflect';
import { ChatOllama } from '@langchain/ollama';
import { END, START, StateGraph } from '@langchain/langgraph/web';

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

// Define the state interface
interface GraphState {
  blocks: WorkerAIBlock[];
  name: string;
  prompt: string;
  response: WorkerAIResponseBlock[];
}

// Define state channels
const graphState = {
  blocks: {
    value: (x: WorkerAIBlock[], y?: WorkerAIBlock[]) => y ?? x,
    default: () => [],
  },
  name: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  prompt: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  response: {
    value: (x: WorkerAIResponseBlock[], y?: WorkerAIResponseBlock[]) => y ?? x,
    default: () => [],
  },
};

const generateNode = async (state: GraphState) => {
  const model = new ChatOllama({
    model: 'llama3.2:3b',
    temperature: 0,
  });

  const modelWithTools = model.bind({});

  const processedBlocks = await Promise.all(
    state.blocks.map(async (block) => {
      const { blockId, text } = block;

      const messages = [
        { role: 'system', content: `You are a helpful assistant that enhances content. Here are the guidelines: ${state.prompt}. Only respond with the enhanced content and nothing else.` },
        { role: 'user', content: `Here is the content to enhance: ${text}` },
      ];

      try {
        const chainResponse = await modelWithTools.invoke(messages);
        return {
          blockId,
          text: chainResponse.content,
        };
      } catch (e) {
        console.error('Failed to invoke model:', e);
        return {
          blockId,
          text: '',
        };
      }
    })
  );

  return {
    response: processedBlocks.flat(),
  };
};

// Create and compile the graph
const workflow = new StateGraph<GraphState>({
  channels: graphState,
})
  .addNode("generate", generateNode)
  .addEdge(START, "generate")
  .addEdge("generate", END);

const graph = workflow.compile();

// Message handler
self.onmessage = async (event: WorkerAIMessage) => {
  const { name, blocks, prompt } = event.data;

  const result = await graph.invoke({
    blocks,
    name,
    prompt,
    response: [],
  });

  self.postMessage({
    name,
    response: result.response
  });
};
