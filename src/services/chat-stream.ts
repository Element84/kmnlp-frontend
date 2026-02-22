import type { ChatResponse } from "../types/api";

export interface StreamHandlers {
  onMessage?: (response: ChatResponse) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export class ChatStreamHandler {
  private decoder = new TextDecoder();
  private currentReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  async processStream(
    stream: ReadableStream<Uint8Array>,
    handlers: StreamHandlers
  ): Promise<void> {
    const reader = stream.getReader();
    this.currentReader = reader;
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            this.processLine(buffer, handlers);
          }
          handlers.onComplete?.();
          break;
        }

        buffer += this.decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          this.processLine(line, handlers);
        }
      }
    } catch (error) {
      // Check if this is an abort error (user cancelled)
      if (error instanceof Error && error.name === "AbortError") {
        handlers.onComplete?.(); // Treat cancellation as completion
      } else {
        handlers.onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    } finally {
      reader.releaseLock();
      this.currentReader = null;
    }
  }

  cancelStream(): void {
    if (this.currentReader) {
      try {
        this.currentReader.cancel();
        this.currentReader.releaseLock();
      } catch (error) {
        console.error("Error cancelling stream:", error);
      } finally {
        this.currentReader = null;
      }
    }
  }

  private processLine(line: string, handlers: StreamHandlers): void {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    try {
      const response: ChatResponse = JSON.parse(trimmedLine);
      handlers.onMessage?.(response);
    } catch (error) {
      handlers.onError?.(
        new Error(`Failed to parse JSON line: ${trimmedLine}`)
      );
    }
  }
}

export const chatStreamHandler = new ChatStreamHandler();
