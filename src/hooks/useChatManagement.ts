import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  chatListAtom,
  chatManagementStateAtom,
} from "../store/atoms";
import {
  refreshChatListAtom,
  loadMoreChatListAtom,
  clearChatManagementErrorAtom,
  autoInitializeChatListAtom,
} from "../store/chat-management-actions";
import type { ChatHeader } from "../types/api";

export interface ChatHistory {
  id: string;
  title: string;
  lastActivity: Date;
}

export interface UseChatManagementReturn {
  chatList: ChatHeader[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refreshChatList: () => Promise<void>;
  loadMoreChats: () => Promise<void>;
  clearError: () => void;
}

export interface UseChatManagementOptions {
  /** Whether the user session has been initialized (from useChat hook) */
  userSessionReady: boolean;
}

export const useChatManagement = (
  options: UseChatManagementOptions
): UseChatManagementReturn => {
  const { userSessionReady } = options;

  // Atom values
  const chatList = useAtomValue(chatListAtom);
  const managementState = useAtomValue(chatManagementStateAtom);

  // Atom actions
  const refreshChatListAction = useSetAtom(refreshChatListAtom);
  const loadMoreChatListAction = useSetAtom(loadMoreChatListAtom);
  const clearErrorAction = useSetAtom(clearChatManagementErrorAtom);
  const autoInitializeChatList = useSetAtom(autoInitializeChatListAtom);

  // Auto-fetch chats when user session becomes ready
  useEffect(() => {
    if (userSessionReady && !managementState.hasInitialized) {
      autoInitializeChatList();
    }
  }, [
    userSessionReady,
    managementState.hasInitialized,
    autoInitializeChatList,
  ]);

  // Wrapper functions to match original hook interface
  const refreshChatList = async () => {
    await refreshChatListAction();
  };

  const loadMoreChats = async () => {
    await loadMoreChatListAction();
  };

  const clearError = () => {
    clearErrorAction();
  };

  return {
    chatList,
    isLoading: managementState.isLoading,
    isLoadingMore: managementState.isLoadingMore,
    hasMore: managementState.hasMore,
    error: managementState.error,
    refreshChatList,
    loadMoreChats,
    clearError,
  };
};
