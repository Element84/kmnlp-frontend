import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from 'jotai';
import { initializeUserSessionAtom } from './user-session-actions';
import { userSessionStateAtom, userIdAtom } from './atoms';
import { apiClient } from '../services/api-client';

// Mock the API client
vi.mock('../services/api-client', () => ({
  apiClient: {
    setUserId: vi.fn(),
    createUser: vi.fn(),
  },
}));

describe('User Session Initialization - Hydration Race Condition Fix', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock createUser to return the user ID it receives
    vi.mocked(apiClient.createUser).mockImplementation((userId) => Promise.resolve(userId));
  });

  it('should handle null localStorage value (first visit)', async () => {
    // Simulate first visit - localStorage returns null
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    expect(sessionState.currentUserId).toBeTruthy();
    expect(sessionState.currentUserId).toMatch(/^user-\d+-[a-z0-9]+$/);
    expect(userId).toBe(sessionState.currentUserId);
    expect(apiClient.setUserId).toHaveBeenCalledWith(userId);
    expect(apiClient.createUser).toHaveBeenCalledWith(userId);
  });

  it('should handle JSON-stringified user ID from atomWithStorage', async () => {
    // Simulate atomWithStorage storing a JSON-stringified value
    const existingUserId = 'user-1234-abc';
    localStorage.setItem('noaa-nlp-user-id', JSON.stringify(existingUserId));
    
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    expect(sessionState.currentUserId).toBe(existingUserId);
    expect(userId).toBe(existingUserId);
    expect(apiClient.setUserId).toHaveBeenCalledWith(existingUserId);
    expect(apiClient.createUser).toHaveBeenCalledWith(existingUserId);
  });

  it('should handle raw string user ID (legacy format)', async () => {
    // Simulate legacy raw string storage
    const existingUserId = 'user-5678-xyz';
    localStorage.setItem('noaa-nlp-user-id', existingUserId);
    
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    expect(sessionState.currentUserId).toBe(existingUserId);
    expect(userId).toBe(existingUserId);
    expect(apiClient.setUserId).toHaveBeenCalledWith(existingUserId);
    expect(apiClient.createUser).toHaveBeenCalledWith(existingUserId);
  });

  it('should reject empty string as invalid user ID', async () => {
    // Simulate empty string stored (invalid state)
    localStorage.setItem('noaa-nlp-user-id', JSON.stringify(''));
    
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    // Should generate new user ID, not use empty string
    expect(sessionState.currentUserId).toBeTruthy();
    expect(sessionState.currentUserId).toMatch(/^user-\d+-[a-z0-9]+$/);
    expect(sessionState.currentUserId).not.toBe('');
  });

  it('should reject string "null" as invalid user ID', async () => {
    // Simulate string "null" stored (invalid state)
    localStorage.setItem('noaa-nlp-user-id', JSON.stringify('null'));
    
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    // Should generate new user ID, not use "null" string
    expect(sessionState.currentUserId).toBeTruthy();
    expect(sessionState.currentUserId).toMatch(/^user-\d+-[a-z0-9]+$/);
    expect(sessionState.currentUserId).not.toBe('null');
  });

  it('should reject raw string "null" as invalid user ID', async () => {
    // Simulate raw "null" string (another edge case)
    localStorage.setItem('noaa-nlp-user-id', 'null');
    
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    // Should generate new user ID, not use "null" string
    expect(sessionState.currentUserId).toBeTruthy();
    expect(sessionState.currentUserId).toMatch(/^user-\d+-[a-z0-9]+$/);
    expect(sessionState.currentUserId).not.toBe('null');
  });

  it('should handle API failure gracefully', async () => {
    // Mock API failure
    vi.mocked(apiClient.createUser).mockRejectedValue(new Error('API Error'));
    
    const store = createStore();
    
    await store.set(initializeUserSessionAtom);
    
    const sessionState = store.get(userSessionStateAtom);
    const userId = store.get(userIdAtom);
    
    // Should still have a user ID (fallback) even if API fails
    expect(sessionState.currentUserId).toBeTruthy();
    expect(userId).toBeTruthy();
    expect(sessionState.initializationError).toBe('API Error');
  });
});
