import type {
  Chat,
  ChatHeader,
  ChatRequest,
  UserCreateRequest,
  ApiError,
  HTTPValidationError,
  AOI,
  AOISummary,
  SystemModel,
} from "../types/api";
import { API_CONFIG } from "../config/api";

export class ApiClient {
  private baseUrl: string;
  private userId: string;
  private currentAbortController: AbortController | null = null;

  constructor(baseUrl: string = API_CONFIG.baseUrl, userId: string = "") {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "x-user-id": this.userId,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let details: HTTPValidationError | undefined;

      try {
        const errorData = await response.json();
        if (errorData.detail) {
          details = errorData;
          errorMessage = errorData.detail
            .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
            .join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Keep the default error message if JSON parsing fails
      }

      const apiError: ApiError = {
        status: response.status,
        message: errorMessage,
        details,
      };

      throw apiError;
    }

    return response.json();
  }

  async createUser(userId: string): Promise<string> {
    const body: UserCreateRequest = { user_id: userId };

    const response = await fetch(`${this.baseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Don't include x-user-id header for user creation
      },
      body: JSON.stringify(body),
    });
    // Handle 409 (user already exists) as success
    if (response.status === 409) {
      this.setUserId(userId);
      return userId; // Return the user ID as success
    }

    const result = await this.handleResponse<string>(response);

    // Set the user ID after successful creation
    this.setUserId(userId);

    return result;
  }

  async getUserChats(offset: number = 0): Promise<ChatHeader[]> {
    const params = new URLSearchParams({ offset: String(offset) });
    const response = await fetch(`${this.baseUrl}/chats?${params.toString()}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<ChatHeader[]>(response);
  }

  async startChat(): Promise<Chat> {
    const response = await fetch(`${this.baseUrl}/chats`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse<Chat>(response);
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<Chat>(response);
  }

  async postToChat(
    chatId: string,
    request: ChatRequest,
    stubImage?: boolean,
  ): Promise<ReadableStream<Uint8Array> | null> {
    console.log("Posting to chat:", chatId, request, stubImage);
    // Cancel any existing request
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }

    // Create new abort controller for this request
    this.currentAbortController = new AbortController();

    const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": this.userId,
      },
      body: JSON.stringify(request),
      signal: this.currentAbortController.signal,
    });

    if (!response.ok) {
      await this.handleResponse(response);
    }

    return response.body;
  }

  cancelCurrentRequest(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  async postAOI(aoiData: { name: string; geojson: any }): Promise<AOI> {
    const payload = { name: aoiData.name, geometry: aoiData.geojson };
    console.log("Posting AOI to backend:", payload);

    const response = await fetch(`${this.baseUrl}/aois`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await this.handleResponse<AOI>(response);
    console.log("AOI POST response:", result);
    return result;
  }

  async getAOIs(): Promise<AOISummary[]> {
    const response = await fetch(`${this.baseUrl}/aois`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{
      aois: AOISummary[];
      pagination_info: any;
    }>(response);
    return data.aois;
  }

  async getAOI(uuid: string): Promise<AOI> {
    const response = await fetch(`${this.baseUrl}/aois/${uuid}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getSystemModels(): Promise<SystemModel[]> {
    const response = await fetch(`${this.baseUrl}/system/models`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<SystemModel[]>(response);
  }

  /**
   * Check if a URL points to this API (requires auth headers).
   */
  isApiUrl(url: string): boolean {
    return url.startsWith(this.baseUrl);
  }

  /**
   * Call an API data URL that returns a pre-signed S3 URL.
   * Sends the x-user-id header, parses the DataDownloadURL response,
   * and returns the S3 URL string.
   */
  async resolveDataUrl(url: string): Promise<string> {
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{ url: string }>(response);
    return data.url;
  }
}

export const apiClient = new ApiClient();
