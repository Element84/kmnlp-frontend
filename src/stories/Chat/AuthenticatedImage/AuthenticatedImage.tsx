import { useState, useEffect, type CSSProperties } from "react";
import { apiClient } from "../../../services/api-client";

export interface AuthenticatedImageProps {
  url: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

// Render at natural size, only shrinking when wider than the container. Forcing
// `width: 100%` makes Chrome rescale every animated GIF frame, which triggers
// stalled/two-frame playback and tearing while scrolling.
const DEFAULT_IMAGE_STYLE: CSSProperties = {
  maxWidth: "100%",
  height: "auto",
};

export const AuthenticatedImage = ({
  url,
  alt,
  className,
  style,
}: AuthenticatedImageProps) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApi = apiClient.isApiUrl(url);

  const imgStyle: CSSProperties = { ...DEFAULT_IMAGE_STYLE, ...style };

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
          setError(err instanceof Error ? err.message : "Failed to load image");
      });

    return () => {
      cancelled = true;
    };
  }, [url, isApi]);

  if (!isApi) {
    return <img src={url} alt={alt} className={className} style={imgStyle} />;
  }

  if (error) {
    return (
      <div className="authenticated-image__error">Failed to load image</div>
    );
  }

  if (!resolvedUrl) {
    return <div className="authenticated-image__loading">Loading image…</div>;
  }

  return (
    <img src={resolvedUrl} alt={alt} className={className} style={imgStyle} />
  );
};
