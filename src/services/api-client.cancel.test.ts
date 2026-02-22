import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient } from './api-client';
import type { ChatRequest } from '../types/api';

describe('ApiClient - Request Cancellation', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient('http://test-api.com', 'test-user-id');
    vi.clearAllMocks();
  });

  it('Test 1: should attach AbortController signal to fetch request', async () => {
    const chatId = 'test-chat-123';
    const request: ChatRequest = {
      content: 'Test message',
      timestamp: new Date().toISOString(),
    };

    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"test": "data"}\n'));
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
    });

    await apiClient.postToChat(chatId, request);

    // Verify fetch was called with an AbortSignal
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('Test 2: should abort ongoing request when cancelCurrentRequest is called', async () => {
    const chatId = 'test-chat-123';
    const request: ChatRequest = {
      content: 'Test message',
      timestamp: new Date().toISOString(),
    };

    const mockStream = new ReadableStream({
      start(controller) {
        // Keep stream open to simulate long-running request
        setTimeout(() => {
          controller.enqueue(new TextEncoder().encode('{"test": "data"}\n'));
          controller.close();
        }, 1000);
      },
    });

    let capturedAbortSignal: AbortSignal | undefined;
    global.fetch = vi.fn().mockImplementation((url, options) => {
      capturedAbortSignal = options?.signal;
      return Promise.resolve({
        ok: true,
        body: mockStream,
      });
    });

    // Start the request (don't await)
    const requestPromise = apiClient.postToChat(chatId, request);

    // Wait a bit to ensure request has started
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Cancel the request
    apiClient.cancelCurrentRequest();

    // Verify the signal was aborted
    expect(capturedAbortSignal?.aborted).toBe(true);

    // The request should still resolve
    await requestPromise;
  });

  it('Test 3: should abort previous request when starting a new request', async () => {
    const chatId = 'test-chat-123';
    const request1: ChatRequest = {
      content: 'First message',
      timestamp: new Date().toISOString(),
    };
    const request2: ChatRequest = {
      content: 'Second message',
      timestamp: new Date().toISOString(),
    };

    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    let firstAbortSignal: AbortSignal | undefined;
    let secondAbortSignal: AbortSignal | undefined;

    global.fetch = vi.fn()
      .mockImplementationOnce((url, options) => {
        firstAbortSignal = options?.signal;
        return Promise.resolve({
          ok: true,
          body: mockStream,
        });
      })
      .mockImplementationOnce((url, options) => {
        secondAbortSignal = options?.signal;
        return Promise.resolve({
          ok: true,
          body: mockStream,
        });
      });

    // Start first request
    await apiClient.postToChat(chatId, request1);

    // Start second request - should automatically abort the first
    await apiClient.postToChat(chatId, request2);

    // First signal should be aborted
    expect(firstAbortSignal?.aborted).toBe(true);
    
    // Second signal should not be aborted
    expect(secondAbortSignal?.aborted).toBe(false);
  });

  it('Test 4: should handle multiple cancellation calls gracefully', () => {
    // Should not throw error when cancelling with no active controller
    expect(() => apiClient.cancelCurrentRequest()).not.toThrow();
    expect(() => apiClient.cancelCurrentRequest()).not.toThrow();
    
    // Multiple cancellations should be idempotent
    apiClient.cancelCurrentRequest();
    apiClient.cancelCurrentRequest();
  });

  it('Test 5: should handle AbortError when request is cancelled', async () => {
    const chatId = 'test-chat-123';
    const request: ChatRequest = {
      content: 'Test message',
      timestamp: new Date().toISOString(),
    };

    // Mock fetch to reject with AbortError
    const abortError = new Error('The user aborted a request.');
    abortError.name = 'AbortError';
    
    global.fetch = vi.fn().mockRejectedValue(abortError);

    // Should throw the AbortError
    await expect(apiClient.postToChat(chatId, request)).rejects.toThrow('AbortError');
  });
});
