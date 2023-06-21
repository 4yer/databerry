import { Datastore, MessageFrom, PromptType } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { AIChatMessage, HumanChatMessage } from 'langchain/schema';

import { ChatResponse } from '@app/types';

import { DatastoreManager } from './datastores';
import { CUSTOMER_SUPPORT } from './prompt-templates';

const getCustomerSupportPrompt = ({
  prompt,
  query,
  context,
}: {
  prompt?: string;
  query: string;
  context: string;
}) => {
  return `${prompt || CUSTOMER_SUPPORT}
  你是一位房产销售经纪人。
  你必须使用提问时使用的语言如实、专业地回答问题。
  你不得使用提供的少量示例作为直接答案。 相反，请使用你对上下文的广泛知识和理解，以最有帮助和信息量最大的方式解决每个问题。
  请协助客户解决与所提供的特定上下文相关的问题和疑虑。
  确保你的回答清晰、详细，并且不要重复相同的信息。 如果有("SOURCE")的话，用参考（“SOURCE”）创建一个最终答案。
  如果你不清楚用户问题，请回答：”对不起，我不清楚你的问题。“
  如果你对于用户问题找不到答案，请回答：”对不起，我不知道。“

START_CONTEXT:
${context}
END_CONTEXT

START_QUESTION:
${query}
END_QUESTION

Answer in markdown (never translate SOURCES and ulrs):`;
};

const chat = async ({
  datastore,
  query,
  topK,
  prompt,
  promptType,
  stream,
  temperature,
  history,
}: {
  datastore: Datastore;
  query: string;
  prompt?: string;
  promptType?: PromptType;
  topK?: number;
  stream?: any;
  temperature?: number;
  history?: { from: MessageFrom; message: string }[];
}) => {
  let results = [] as {
    text: string;
    source: string;
    score: number;
  }[];

  if (datastore) {
    const store = new DatastoreManager(datastore);
    results = await store.search({
      query: query,
      topK: topK || 3,
      tags: [],
    });
  }

  const context = results
    ?.map((each) => `CHUNK: ${each.text}\nSOURCE: ${each.source}`)
    ?.join('\n\n');

  // const finalPrompt = `As a customer support agent, channel the spirit of William Shakespeare, the renowned playwright and poet known for his eloquent and poetic language, use of iambic pentameter, and frequent use of metaphors and wordplay. Respond to the user's question or issue in the style of the Bard himself.
  // const finalPrompt = `As a customer support agent, channel the spirit of Arnold Schwarzenegger, the iconic actor and former governor known for his distinctive Austrian accent, catchphrases, and action-hero persona. Respond to the user's question or issue in the style of Arnold himself.
  // As a customer support agent, please provide a helpful and professional response to the user's question or issue.

  // const instruct = `You are an AI assistant providing helpful advice, given the following extracted parts of a long document and a question.
  // If you don't know the answer, just say that you don't know. Don't try to make up an answer.`;

  let finalPrompt = prompt || '';

  switch (promptType) {
    case PromptType.customer_support:
      finalPrompt = getCustomerSupportPrompt({
        prompt: finalPrompt,
        query,
        context,
      });
      break;
    case PromptType.raw:
      finalPrompt = finalPrompt
        ?.replace('{query}', query)
        ?.replace('{context}', context);
      break;
    default:
      break;
  }

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-0613',
    temperature: temperature || 0,
    streaming: Boolean(stream),
    callbacks: [
      {
        handleLLMNewToken: stream,
      },
    ],
  }, { basePath: process.env.OPENAI_API_BASE });

  // Disable conversation history for now as it conflict with wrapped prompt
  // const messages = (history || [])?.map((each) => {
  //   if (each.from === MessageFrom.human) {
  //     return new HumanChatMessage(each.message);
  //   }
  //   return new AIChatMessage(each.message);
  // });

  const output = await model.call([
    // ...messages,
    // new HumanChatMessage(query),
    new HumanChatMessage(finalPrompt),
  ]);

  // const regex = /SOURCE:\s*(.+)/;
  // const match = output?.trim()?.match(regex);
  // const source = match?.[1]?.replace('N/A', '')?.replace('None', '')?.trim();

  // let answer = output?.trim()?.replace(regex, '')?.trim();
  // answer = source ? `${answer}\n\n${source}` : answer;

  return {
    answer: output?.text?.trim?.(),
  } as ChatResponse;
};

export default chat;
