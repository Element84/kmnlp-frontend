
import { atom } from 'jotai';
import {
  chatListAtom,
  chatManagementStateAtom,
  userSessionStateAtom,
} from './atoms';
import { getUserChatsAtom } from './user-session-actions';
import type { ApiError } from '../types/api';

const CHAT_PAGE_SIZE = 25;


export const refreshChatListAtom = atom(
  null,
  async (get, set) => {
    set(chatManagementStateAtom, {
      ...get(chatManagementStateAtom),
      isLoading: true,
      isLoadingMore: false,
      error: null,
    });

    try {
      const chats = await set(getUserChatsAtom, 0);
      set(chatListAtom, chats);
      set(chatManagementStateAtom, {
        isLoading: false,
        isLoadingMore: false,
        error: null,
        hasInitialized: true,
        hasMore: chats.length === CHAT_PAGE_SIZE,
        nextOffset: chats.length,
      });
    } catch (err) {
      const apiError = err as ApiError;
      set(chatManagementStateAtom, {
        isLoading: false,
        isLoadingMore: false,
        error: apiError.message || 'Failed to fetch chat list',
        hasInitialized: true,
        hasMore: false,
        nextOffset: 0,
      });
    }
  }
);

export const loadMoreChatListAtom = atom(
  null,
  async (get, set) => {
    const managementState = get(chatManagementStateAtom);

    if (
      managementState.isLoading ||
      managementState.isLoadingMore ||
      !managementState.hasMore
    ) {
      return;
    }

    set(chatManagementStateAtom, {
      ...managementState,
      isLoadingMore: true,
      error: null,
    });

    try {
      const currentChats = get(chatListAtom);
      const offset = managementState.nextOffset;
      const nextPage = await set(getUserChatsAtom, offset);

      // Prevent accidental duplicates if the API returns overlapping pages.
      const existingIds = new Set(currentChats.map((chat) => chat.id));
      const uniqueNextPage = nextPage.filter((chat) => !existingIds.has(chat.id));
      const mergedChats = [...currentChats, ...uniqueNextPage];

      set(chatListAtom, mergedChats);
      set(chatManagementStateAtom, {
        ...get(chatManagementStateAtom),
        isLoadingMore: false,
        error: null,
        hasMore: nextPage.length === CHAT_PAGE_SIZE,
        nextOffset: offset + nextPage.length,
      });
    } catch (err) {
      const apiError = err as ApiError;
      set(chatManagementStateAtom, {
        ...get(chatManagementStateAtom),
        isLoadingMore: false,
        error: apiError.message || 'Failed to fetch additional chats',
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
