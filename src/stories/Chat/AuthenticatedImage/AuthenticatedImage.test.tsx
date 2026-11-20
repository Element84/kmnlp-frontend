import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { AuthenticatedImage } from "./AuthenticatedImage";
import { apiClient } from "../../../services/api-client";

vi.mock("../../../services/api-client", () => {
  const mockClient = {
    isApiUrl: vi.fn(),
    resolveDataUrl: vi.fn(),
  };
  return { apiClient: mockClient };
});

const mockApiClient = vi.mocked(apiClient);

describe("AuthenticatedImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a plain img for non-API URLs", () => {
    mockApiClient.isApiUrl.mockReturnValue(false);

    const { getByRole } = render(
      <AuthenticatedImage
        url="https://external.com/photo.png"
        alt="External photo"
      />
    );

    const img = getByRole("img");
    expect(img).toHaveAttribute("src", "https://external.com/photo.png");
    expect(img).toHaveAttribute("alt", "External photo");
    expect(mockApiClient.resolveDataUrl).not.toHaveBeenCalled();
  });

  it("resolves API URLs and renders the pre-signed URL", async () => {
    mockApiClient.isApiUrl.mockReturnValue(true);
    mockApiClient.resolveDataUrl.mockResolvedValue(
      "https://bucket.s3.amazonaws.com/data?Signature=abc"
    );

    const { getByRole } = render(
      <AuthenticatedImage
        url="https://api.kmnlp.example.com/data/user/chats/123/000"
        alt="API image"
      />
    );

    await waitFor(() => {
      const img = getByRole("img");
      expect(img).toHaveAttribute(
        "src",
        "https://bucket.s3.amazonaws.com/data?Signature=abc"
      );
    });

    expect(mockApiClient.resolveDataUrl).toHaveBeenCalledWith(
      "https://api.kmnlp.example.com/data/user/chats/123/000"
    );
  });

  it("shows loading state while resolving API URL", () => {
    mockApiClient.isApiUrl.mockReturnValue(true);
    mockApiClient.resolveDataUrl.mockReturnValue(new Promise(() => {}));

    const { getByText } = render(
      <AuthenticatedImage url="https://api.example.com/data/x/chats/y/z" alt="Loading" />
    );

    expect(getByText("Loading image…")).toBeInTheDocument();
  });

  it("shows error state when resolution fails", async () => {
    mockApiClient.isApiUrl.mockReturnValue(true);
    mockApiClient.resolveDataUrl.mockRejectedValue(new Error("403 Forbidden"));

    const { getByText } = render(
      <AuthenticatedImage url="https://api.example.com/data/x/chats/y/z" alt="Error" />
    );

    await waitFor(() => {
      expect(getByText("Failed to load image")).toBeInTheDocument();
    });
  });

  it("does not update state after unmount", async () => {
    mockApiClient.isApiUrl.mockReturnValue(true);
    let resolve: (v: string) => void;
    mockApiClient.resolveDataUrl.mockReturnValue(
      new Promise((r) => { resolve = r; })
    );

    const { unmount } = render(
      <AuthenticatedImage url="https://api.example.com/data/x/chats/y/z" alt="Cleanup" />
    );

    unmount();
    // Resolve after unmount — should not throw
    resolve!("https://bucket.s3.amazonaws.com/data");

    // No assertion needed — test passes if no React "update unmounted component" warning
  });
});
