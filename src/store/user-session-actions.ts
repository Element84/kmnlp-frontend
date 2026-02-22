

import { atom } from 'jotai';
import { apiClient } from '../services/api-client';
import { userIdAtom, userSessionStateAtom, generatePersistentUserId, getUserIdWithFallback } from './atoms';
import type { ChatHeader } from '../types/api';


export const initializeUserSessionAtom = atom(
  null,
  async (get, set) => {
    set(userSessionStateAtom, {
      currentUserId: null,
      isInitializing: true,
      initializationError: null,
    });

    try {
      // CRITICAL: Read directly from localStorage to avoid atomWithStorage async hydration race condition
      // atomWithStorage may not have hydrated yet when this runs, so we bypass it
      const storedUserId = localStorage.getItem("noaa-nlp-user-id");
      let userId: string;
      
      // Debug logging for production troubleshooting
      console.log('[User Session] Initializing session:', {
        storedUserId,
        storedType: typeof storedUserId,
        storedIsNull: storedUserId === null,
      });
      
      if (storedUserId !== null && storedUserId !== '' && storedUserId !== 'null') {
        // Parse the JSON-stringified value that atomWithStorage stores
        try {
          const parsed = JSON.parse(storedUserId);
          console.log('[User Session] Parsed stored userId:', { parsed, type: typeof parsed });
          // Ensure parsed value is a non-empty string
          if (typeof parsed === 'string' && parsed !== '' && parsed !== 'null') {
            userId = parsed;
            console.log('[User Session] Using existing userId:', userId);
          } else {
            // Parsed value is invalid, generate new one
            userId = getUserIdWithFallback();
            console.log('[User Session] Invalid parsed value, generated new userId:', userId);
          }
        } catch (error) {
          // If not JSON, check if raw value is valid
          console.log('[User Session] JSON parse failed:', error);
          if (storedUserId !== '' && storedUserId !== 'null') {
            userId = storedUserId;
            console.log('[User Session] Using raw stored userId:', userId);
          } else {
            userId = getUserIdWithFallback();
            console.log('[User Session] Invalid raw value, generated new userId:', userId);
          }
        }
      } else {
        // No stored user ID, generate a new one
        userId = getUserIdWithFallback();
        console.log('[User Session] No stored userId found, generated new:', userId);
      }
      
      // Update the atom (this will also persist to localStorage)
      set(userIdAtom, userId);

      // Set the user ID and create the user
      apiClient.setUserId(userId);

      // The API will return the same user ID we sent
      const createdUserId = await apiClient.createUser(userId);

      // Update session state with successful initialization
      set(userSessionStateAtom, {
        currentUserId: createdUserId,
        isInitializing: false,
        initializationError: null,
      });

      return createdUserId;
    } catch (error) {
      console.error("Failed to create user:", error);
      
      // Use the generated user ID as fallback
      const fallbackUserId = get(userIdAtom) || generatePersistentUserId();
      
      set(userSessionStateAtom, {
        currentUserId: fallbackUserId,
        isInitializing: false,
        initializationError: error instanceof Error ? error.message : String(error),
      });

      return fallbackUserId;
    }
  }
);

/**
 * Get user chats atom
 */
export const getUserChatsAtom = atom(
  null,
  async (get, set): Promise<ChatHeader[]> => {
    const sessionState = get(userSessionStateAtom);
    
    if (!sessionState.currentUserId) {
      throw new Error('User session not initialized');
    }
    
    return apiClient.getUserChats();
  }
);

/**
 * Clear user session atom
 */
export const clearUserSessionAtom = atom(
  null,
  (get, set) => {
    set(userSessionStateAtom, {
      currentUserId: null,
      isInitializing: true,
      initializationError: null,
    });
    set(userIdAtom, "");
  }
);

/**
 * Regenerate user ID atom
 * Force regenerate a new user ID and store it
 * Useful for testing or if user wants to reset their session
 */
export const regenerateUserIdAtom = atom(
  null,
  async (get, set) => {
    const newUserId = generatePersistentUserId();
    set(userIdAtom, newUserId);
    
    set(userSessionStateAtom, {
      currentUserId: null,
      isInitializing: true,
      initializationError: null,
    });

    try {
      apiClient.setUserId(newUserId);
      const createdUserId = await apiClient.createUser(newUserId);
      
      set(userSessionStateAtom, {
        currentUserId: createdUserId,
        isInitializing: false,
        initializationError: null,
      });

      return createdUserId;
    } catch (error) {
      console.error("Failed to create user with new ID:", error);
      
      set(userSessionStateAtom, {
        currentUserId: newUserId,
        isInitializing: false,
        initializationError: error instanceof Error ? error.message : String(error),
      });

      return newUserId;
    }
  }
);

/**
 * Get current user ID atom (read-only convenience atom)
 */
export const getCurrentUserIdAtom = atom((get) => {
  const sessionState = get(userSessionStateAtom);
  return sessionState.currentUserId;
});