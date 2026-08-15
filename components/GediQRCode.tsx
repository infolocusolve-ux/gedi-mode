"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface GediQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// Generated locally in the browser — no third-party QR service, no
// network round-trip. High error correction + the library's default
// quiet zone keep it dependable at small print/screen sizes.
export default function GediQRCode({ value, size = 160, className }: GediQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#241a12", light: "#f4efe6" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local data: URI, not a remote/optimizable image
        <img
          src={dataUrl}
          alt={`QR code — scan to join this Gedi at ${value}`}
          width={size}
          height={size}
          className="h-full w-full"
        />
      ) : (
        <div className="h-full w-full animate-pulse rounded bg-black/10" aria-hidden="true" />
      )}
    </div>
  );
}
