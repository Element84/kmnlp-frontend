import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { currentChatIdAtom, userSessionStateAtom } from "../store/atoms";
import { loadChatAtom, resetToNewChatAtom } from "../store/chat-actions";

/**
 * Maps the active chat id to its address-bar path.
 */
const chatPathFor = (chatId: string | null): string =>
  chatId ? `/chats/${encodeURIComponent(chatId)}` : "/";

/**
 * Extracts a chat id from a `/chats/<id>` path, or null for any other path.
 */
const chatIdFromPath = (pathname: string): string | null => {
  const match = pathname.match(/^\/chats\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Lightweight, router-free URL synchronization for the active chat.
 *
 * `currentChatIdAtom` is the single source of truth. This hook keeps the
 * browser address bar in sync with it using the History API and, conversely,
 * loads the appropriate chat when the URL changes (deep links, back/forward).
 *
 * Note: for refresh / deep links to resolve on a static host, the host must
 * serve `index.html` for unknown paths (SPA fallback). Vite's dev server does
 * this automatically.
 */
export const useChatUrlSync = (): void => {
  const currentChatId = useAtomValue(currentChatIdAtom);
  const { isInitializing } = useAtomValue(userSessionStateAtom);
  const loadChat = useSetAtom(loadChatAtom);
  const resetToNewChat = useSetAtom(resetToNewChatAtom);

  // Latest chat id, readable from within the stable popstate handler.
  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  // Whether the initial URL (deep link) has been resolved into state yet.
  const initialUrlHandled = useRef(false);

  // 1. Deep link: once the session is ready, load whatever chat the URL
  //    points to. Runs once.
  useEffect(() => {
    if (isInitializing || initialUrlHandled.current) return;
    initialUrlHandled.current = true;

    const urlChatId = chatIdFromPath(window.location.pathname);
    if (urlChatId && urlChatId !== currentChatIdRef.current) {
      loadChat(urlChatId);
    }
  }, [isInitializing, loadChat]);

  // 2. Reflect the active chat in the address bar. Covers explicit selection,
  //    starting a new chat, and chats auto-created on the first message.
  useEffect(() => {
    if (!initialUrlHandled.current) return;

    const desiredPath = chatPathFor(currentChatId);
    if (window.location.pathname !== desiredPath) {
      window.history.pushState({}, "", desiredPath);
    }
  }, [currentChatId]);

  // 3. Back/forward navigation: drive state from the URL.
  useEffect(() => {
    const handlePopState = () => {
      const urlChatId = chatIdFromPath(window.location.pathname);
      if (urlChatId) {
        if (urlChatId !== currentChatIdRef.current) loadChat(urlChatId);
      } else if (currentChatIdRef.current) {
        resetToNewChat();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [loadChat, resetToNewChat]);
};
