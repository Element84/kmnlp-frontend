import { apiClient } from "./api-client";
import { ENVIRONMENT } from "../config/api";
import type { ChatHeader } from "../types/api";

export class UserSessionManager {
  private currentUserId: string | null = null;
  private readonly USER_ID_KEY = 'noaa-nlp-user-id';

  async initializeSession(): Promise<string> {
    // Try to get existing user ID from localStorage first
    let userId = this.getStoredUserId();
    
    // If no stored user ID, generate a new one
    if (!userId) {
      // Use environment variable user ID if provided (for local development only)
      // Otherwise generate a persistent user ID
      if (ENVIRONMENT.isDevelopment && ENVIRONMENT.userId) {
        userId = ENVIRONMENT.userId;
      } else {
        userId = this.generatePersistentUserId();
      }
      
      // Store the new user ID in localStorage
      this.storeUserId(userId);
    }

    try {
      // Set the user ID and create the user
      apiClient.setUserId(userId);

      // The API will return the same user ID we sent
      const createdUserId = await apiClient.createUser(userId);

      // Use the returned user ID (should be the same as what we sent)
      this.currentUserId = createdUserId;
      return createdUserId;
    } catch (error) {
      console.error("Failed to create user:", error);
      // Use the generated user ID as fallback
      this.currentUserId = userId;
      return userId;
    }
  }

  private generatePersistentUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFallbackUserId(): string {
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStoredUserId(): string | null {
    try {
      return localStorage.getItem(this.USER_ID_KEY);
    } catch (error) {
      console.warn('Failed to read user ID from localStorage:', error);
      return null;
    }
  }

  private storeUserId(userId: string): void {
    try {
      localStorage.setItem(this.USER_ID_KEY, userId);
    } catch (error) {
      console.warn('Failed to store user ID in localStorage:', error);
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  async getUserChats(): Promise<ChatHeader[]> {
    if (!this.currentUserId) {
      throw new Error('User session not initialized');
    }
    return apiClient.getUserChats();
  }

  clearSession(): void {
    this.currentUserId = null;
    try {
      localStorage.removeItem(this.USER_ID_KEY);
    } catch (error) {
      console.warn('Failed to remove user ID from localStorage:', error);
    }
  }

  /**
   * Force regenerate a new user ID and store it
   * Useful for testing or if user wants to reset their session
   */
  async regenerateUserId(): Promise<string> {
    const newUserId = this.generatePersistentUserId();
    this.storeUserId(newUserId);
    this.currentUserId = newUserId;
    
    try {
      apiClient.setUserId(newUserId);
      const createdUserId = await apiClient.createUser(newUserId);
      this.currentUserId = createdUserId;
      return createdUserId;
    } catch (error) {
      console.error("Failed to create user with new ID:", error);
      return newUserId;
    }
  }
}

export const userSessionManager = new UserSessionManager();
