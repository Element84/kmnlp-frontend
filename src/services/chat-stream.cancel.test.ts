import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatStreamHandler } from './chat-stream';
import type { ChatResponse } from '../types/api';

describe('ChatStreamHandler - Stream Cancellation', () => {
  let handler: ChatStreamHandler;

  beforeEach(() => {
    handler = new ChatStreamHandler();
    vi.clearAllMocks();
  });

  it('Test 1: should track current reader when processing stream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        setTimeout(() => controller.close(), 100);
      },
    });

    const handlerAny = handler as any;

    // Start processing in background
    const processPromise = handler.processStream(stream, {});

    // Wait a bit to ensure processing has started
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Reader should be active
    expect(handlerAny.currentReader).not.toBeNull();

    // Wait for completion
    await processPromise;

    // Reader should be null after completion
    expect(handlerAny.currentReader).toBeNull();
  });

  it('Test 2: should cancel active stream and call onComplete for AbortError', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const stream = new ReadableStream({
      start(controller) {
        controller.error(abortError);
      },
    });

    const onMessage = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    await handler.processStream(stream, {
      onMessage,
      onComplete,
      onError,
    });

    // AbortError should be treated as successful completion, not error
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(onMessage).not.toHaveBeenCalled();
  });

  it('Test 3: should release reader lock when cancelStream is called', async () => {
    let streamController: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream({
      start(controller) {
        streamController = controller;
        // Keep stream open
      },
    });

    const handlerAny = handler as any;

    // Start processing in background
    const processPromise = handler.processStream(stream, {});

    // Wait for processing to start
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify reader is active
    expect(handlerAny.currentReader).not.toBeNull();

    // Cancel the stream
    handler.cancelStream();

    // Reader should be null after cancellation
    expect(handlerAny.currentReader).toBeNull();

    // Close the controller to allow promise to resolve
    streamController!.close();
    await processPromise;
  });

  it('Test 4: should handle errors during cancellation gracefully', async () => {
    const stream = new ReadableStream({
      start(_controller) {
        // Keep stream open
      },
    });

    const handlerAny = handler as any;

    // Start processing
    handler.processStream(stream, {});
    
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mock the reader to throw an error on cancel
    const originalReader = handlerAny.currentReader;
    if (originalReader) {
      const originalCancel = originalReader.cancel.bind(originalReader);
      originalReader.cancel = vi.fn().mockImplementation(() => {
        originalCancel();
        throw new Error('Cancel error');
      });
    }

    // Should not throw when cancelling
    expect(() => handler.cancelStream()).not.toThrow();
    
    // Reader should still be set to null despite the error
    expect(handlerAny.currentReader).toBeNull();
  });

  it('Test 5: should process stream successfully and handle cancellation on next request', async () => {
    // First stream - complete successfully
    const mockResponse1: ChatResponse = {
      content: {
        content_type: 'TextDelta',
        content_delta: 'Hello World',
      },
      timestamp: new Date().toISOString(),
    };

    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(mockResponse1) + '\n')
        );
        controller.close();
      },
    });

    const messages: ChatResponse[] = [];
    const onMessage = vi.fn((response: ChatResponse) => {
      messages.push(response);
    });
    const onComplete = vi.fn();

    // Process first stream
    await handler.processStream(stream1, { onMessage, onComplete });

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toEqual(mockResponse1.content);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Start second stream
    let streamController2: ReadableStreamDefaultController<Uint8Array>;
    const stream2 = new ReadableStream({
      start(controller) {
        streamController2 = controller;
        // Keep open
      },
    });

    // Start processing second stream
    const process2Promise = handler.processStream(stream2, {
      onMessage: vi.fn(),
      onComplete: vi.fn(),
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Cancel the second stream
    handler.cancelStream();

    // Should be able to close without issues
    streamController2!.close();
    await process2Promise;

    // Handler should be ready for next stream
    const handlerAny = handler as any;
    expect(handlerAny.currentReader).toBeNull();
  });
});
