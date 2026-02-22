
import { atom } from 'jotai';
import {
  chatListAtom,
  chatManagementStateAtom,
  userSessionStateAtom,
} from './atoms';
import { getUserChatsAtom } from './user-session-actions';
import type { ApiError } from '../types/api';


export const refreshChatListAtom = atom(
  null,
  async (get, set) => {
    set(chatManagementStateAtom, {
      ...get(chatManagementStateAtom),
      isLoading: true,
      error: null,
    });

    try {
      const chats = await set(getUserChatsAtom);
      set(chatListAtom, chats);
      set(chatManagementStateAtom, {
        isLoading: false,
        error: null,
        hasInitialized: true,
      });
    } catch (err) {
      const apiError = err as ApiError;
      set(chatManagementStateAtom, {
        isLoading: false,
        error: apiError.message || 'Failed to fetch chat list',
        hasInitialized: true,
      });
    }
  }
);


export const clearChatManagementErrorAtom = atom(
  null,
  (get, set) => {
    set(chatManagementStateAtom, {
      ...get(chatManagementStateAtom),
      error: null,
    });
  }
);


export const autoInitializeChatListAtom = atom(
  null,
  async (get, set) => {
    const sessionState = get(userSessionStateAtom);
    const managementState = get(chatManagementStateAtom);
    
    if (!sessionState.isInitializing && sessionState.currentUserId && !managementState.hasInitialized) {
      await set(refreshChatListAtom);
    }
  }
);