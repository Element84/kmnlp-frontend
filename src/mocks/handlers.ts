import { http, HttpResponse, delay } from 'msw';
import type {
  Chat,
  ChatHeader,
  ChatRequest,
  ChatResponse,
  Plan,
  Step,
} from '../types/api';

const mockUserId = 'mock-user-123';

// Mock chat storage
const mockChats = new Map<string, Chat>();
let chatCounter = 1;

// Helper to generate mock chat IDs
const generateChatId = () => `chat-${chatCounter++}`;

// Helper to create mock plans with steps
const createMockPlan = (request: ChatRequest): Plan => {
  const steps: Step[] = [
    {
      id: 'step-1',
      title: 'Analyzing your query',
      status: 'success',
      outcome_summary: 'Query successfully analyzed',
    },
    {
      id: 'step-2',
      title: 'Searching NOAA databases',
      status: 'in_progress',
    },
    {
      id: 'step-3',
      title: 'Processing oceanographic data',
      status: 'pending',
    },
  ];

  return {
    content_type: 'Plan',
    id: `plan-${Date.now()}`,
    title: 'Processing your NOAA data request',
    steps,
  };
};

// Helper to simulate streaming responses
const simulateStreamingResponse = async function* (request: ChatRequest) {
  // Initial plan
  const plan = createMockPlan(request);
  yield {
    content: plan,
    timestamp: new Date().toISOString(),
  } as ChatResponse;

  await delay(1000);

  // Update plan - step 2 completes, step 3 starts
  const updatedPlan: Plan = {
    ...plan,
    steps: plan.steps.map(step =>
      step.id === 'step-2'
        ? { ...step, status: 'success' as const, outcome_summary: 'Found relevant data in Gulf of Mexico region' }
        : step.id === 'step-3'
        ? { ...step, status: 'in_progress' as const }
        : step
    ),
  };

  yield {
    content: updatedPlan,
    timestamp: new Date().toISOString(),
  } as ChatResponse;

  await delay(1500);

  // Final plan - all steps complete
  const finalPlan: Plan = {
    ...plan,
    steps: plan.steps.map(step =>
      step.id === 'step-3'
        ? { ...step, status: 'success' as const, outcome_summary: 'Analysis complete' }
        : step
    ),
  };

  yield {
    content: finalPlan,
    timestamp: new Date().toISOString(),
  } as ChatResponse;

  await delay(500);

  // Text response
  yield {
    content: {
      content_type: 'Text',
      text: `Based on your query "${request.content}", I found comprehensive oceanographic data for the Gulf of Mexico region. The data shows interesting temperature and salinity patterns, particularly in the northern Gulf where freshwater from the Mississippi River creates distinct layered water masses.

Key findings:
• Surface temperatures range from 26-29°C during summer months
• Salinity gradients show significant variation (20-36 ppt)
• Current patterns indicate strong Loop Current influence
• Biological productivity peaks occur in spring and fall

${request.ui_state?.aoi ? 'Your selected area of interest has been incorporated into this analysis.' : 'Consider selecting an area of interest on the map for more targeted analysis.'}`,
    },
    timestamp: new Date().toISOString(),
  } as ChatResponse;

  await delay(200);

  // End of turn
  yield {
    content: {
      content_type: 'EndOfTurn',
    },
    timestamp: new Date().toISOString(),
  } as ChatResponse;
};

export const handlers = [
  // Create user
  http.post('http://localhost:8000/users', async ({ request }) => {
    try {
      const body = await request.json() as { user_id: string };
      if (!body.user_id) {
        return HttpResponse.json(
          { detail: [{ loc: ['body', 'user_id'], msg: 'field required', type: 'missing' }] },
          { status: 422 }
        );
      }
      return HttpResponse.json(body.user_id);
    } catch (error) {
      return HttpResponse.json(
        { detail: [{ loc: ['body'], msg: 'Invalid JSON', type: 'json_invalid' }] },
        { status: 422 }
      );
    }
  }),

  // Get user chats
  http.get('http://localhost:8000/chats', async ({ request }) => {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return HttpResponse.json(
        { detail: [{ loc: ['header', 'x-user-id'], msg: 'field required', type: 'missing' }] },
        { status: 422 }
      );
    }

    // Return list of ChatHeader objects for this user
    const mockChatHeaders: ChatHeader[] = [
      {
        id: 'chat-1',
        title: 'Sea surface temperature analysis',
        date_created: '2024-10-29T10:30:00Z'
      },
      {
        id: 'chat-2', 
        title: 'Hurricane tracking data',
        date_created: '2024-10-28T14:15:00Z'
      },
      {
        id: 'chat-3',
        title: 'Ocean current patterns',
        date_created: '2024-10-27T09:45:00Z'
      }
    ];

    return HttpResponse.json(mockChatHeaders);
  }),

  // Start new chat
  http.post('http://localhost:8000/chats', async ({ request }) => {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return HttpResponse.json(
        { detail: [{ loc: ['header', 'x-user-id'], msg: 'field required', type: 'missing' }] },
        { status: 422 }
      );
    }

    const chatId = generateChatId();
    const newChat: Chat = {
      id: chatId,
      title: 'New Chat',
      messages: [],
      date_created: new Date().toISOString(),
    };

    mockChats.set(chatId, newChat);
    return HttpResponse.json(newChat);
  }),

  // Get specific chat
  http.get('http://localhost:8000/chats/:chatId', async ({ request, params }) => {
    const userId = request.headers.get('x-user-id');
    const { chatId } = params;

    if (!userId) {
      return HttpResponse.json(
        { detail: [{ loc: ['header', 'x-user-id'], msg: 'field required', type: 'missing' }] },
        { status: 422 }
      );
    }

    const chat = mockChats.get(chatId as string);
    if (!chat) {
      return HttpResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(chat);
  }),

  // Post to chat (streaming)
  http.post('http://localhost:8000/chats/:chatId', async ({ request, params }) => {
    const userId = request.headers.get('x-user-id');
    const { chatId } = params;

    if (!userId) {
      return HttpResponse.json(
        { detail: [{ loc: ['header', 'x-user-id'], msg: 'field required', type: 'missing' }] },
        { status: 422 }
      );
    }

    const chat = mockChats.get(chatId as string);
    if (!chat) {
      return HttpResponse.json(
        { message: 'Chat not found' },
        { status: 404 }
      );
    }

    const chatRequest = await request.json() as ChatRequest;

    // Add user message to chat
    chat.messages = chat.messages || [];
    chat.messages.push(chatRequest);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const response of simulateStreamingResponse(chatRequest)) {
            const line = JSON.stringify(response) + '\n';
            controller.enqueue(encoder.encode(line));

            // Add response to chat history
            chat.messages!.push(response);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
      },
    });
  }),
];
