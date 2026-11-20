import { useState, useEffect, type CSSProperties } from "react";
import { apiClient } from "../../../services/api-client";

export interface AuthenticatedVideoProps {
  url: string;
  className?: string;
  style?: CSSProperties;
}

// Match the image sizing behaviour: natural size, capped to the container.
const DEFAULT_VIDEO_STYLE: CSSProperties = {
  maxWidth: "100%",
  height: "auto",
};

/**
 * Renders a chat video that plays like a GIF: autoplaying, looping, muted and
 * inline. API URLs are resolved to a pre-signed URL first because they require
 * the x-user-id auth header (mirrors AuthenticatedImage).
 */
export const AuthenticatedVideo = ({
  url,
  className,
  style,
}: AuthenticatedVideoProps) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApi = apiClient.isApiUrl(url);

  const videoStyle: CSSProperties = { ...DEFAULT_VIDEO_STYLE, ...style };

  useEffect(() => {
    if (!isApi) return;

    let cancelled = false;

    apiClient
      .resolveDataUrl(url)
      .then((s3Url) => {
        if (!cancelled) setResolvedUrl(s3Url);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load video");
      });

    return () => {
      cancelled = true;
    };
  }, [url, isApi]);

  const src = isApi ? resolvedUrl : url;

  if (error) {
    return (
      <div className="authenticated-video__error">Failed to load video</div>
    );
  }

  if (!src) {
    return <div className="authenticated-video__loading">Loading video…</div>;
  }

  return (
    <video
      src={src}
      className={className}
      style={videoStyle}
      autoPlay
      loop
      muted
      playsInline
    />
  );
};
