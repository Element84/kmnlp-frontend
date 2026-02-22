import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  chatListAtom,
  chatManagementStateAtom,
  userSessionStateAtom,
  recentChatsAtom,
} from "../store/atoms";
import {
  refreshChatListAtom,
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
  error: string | null;
  refreshChatList: () => Promise<void>;
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
  const sessionState = useAtomValue(userSessionStateAtom);

  // Atom actions
  const refreshChatListAction = useSetAtom(refreshChatListAtom);
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

  const clearError = () => {
    clearErrorAction();
  };

  return {
    chatList,
    isLoading: managementState.isLoading,
    error: managementState.error,
    refreshChatList,
    clearError,
  };
};
