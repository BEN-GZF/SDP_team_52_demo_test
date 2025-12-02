"use client";

import React, { useCallback, useRef, useState } from "react";

type Props = {
  apiBase?: string; //
  accept?: string; // 
  maxSizeMB?: number; // 
};

const MIN_WIDTH = 256;
const MIN_HEIGHT = 256;

type UploadState =
  | { status: "idle" }
  | { status: "ready"; file: File; preview: string }
  | { status: "uploading"; file: File; preview: string; progress: number }
  | { status: "done"; file: File; preview: string; result: any }
  | {
      status: "error";
      file?: File;
      preview?: string;
      message: string;
    };

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_SIZE_MB = 20;

export default function UploadWidget({
  apiBase = process.env.NEXT_PUBLIC_API_BASE || "",
  accept = DEFAULT_ACCEPT,
  maxSizeMB = MAX_SIZE_MB,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>({ status: "idle" });

  const reset = () => {
    setState({ status: "idle" });
  };

  const pickFile = () => inputRef.current?.click();

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      const f = files[0];

      const acceptList = accept.split(",").map((s) => s.trim());
      const okType = acceptList.some((rule) =>
        rule.startsWith(".")
          ? f.name.toLowerCase().endsWith(rule.toLowerCase())
          : f.type === rule
      );
      if (!okType) {
        setState({
          status: "error",
          message: "Unsupported file type. Please upload JPG / PNG / WEBP.",
        });
        return;
      }


      if (f.size > maxSizeMB * 1024 * 1024) {
        setState({
          status: "error",
          message: `Max file size is ${maxSizeMB} MB.`,
        });
        return;
      }

      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          setState({
            status: "error",
            file: f,
            preview: url,
            message: `Image resolution is too low (${width} × ${height}). Minimum recommended is ${MIN_WIDTH} × ${MIN_HEIGHT}.`,
          });
        } else {
          setState({ status: "ready", file: f, preview: url });
        }
      };
      img.onerror = () => {
        setState({
          status: "error",
          message: "Failed to read image resolution. Please try another image.",
        });
      };
      img.src = url;
    },
    [accept, maxSizeMB]
  );

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const buildBase = (s: string) => (s ? s.replace(/\/$/, "") : "");
  const buildAbs = (maybeRel: string) =>
    maybeRel.startsWith("http")
      ? maybeRel
      : `${buildBase(apiBase)}${
          maybeRel.startsWith("/") ? "" : "/"
        }${maybeRel}`;

  const onUpload = async () => {
    if (!("file" in state) || !state.file) {
      setState({
        status: "error",
        message: "Please upload an image before continuing.",
      });
      return;
    }

    if (state.status === "uploading") return;

    const file = state.file as File;
    const preview = (state as any).preview as string;

    if (!apiBase) {
      setState({
        status: "done",
        file,
        preview,
        result: {
          message:
            "Frontend upload flow works. Backend endpoint is not connected yet.",
        },
      });
      return;
    }

    setState({ status: "uploading", file, preview, progress: 0 });

    const form = new FormData();
    form.append("file", file);

    const url = `${buildBase(apiBase)}/upload`;

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const p = Math.round((evt.loaded / evt.total) * 100);
          setState((s) =>
            s.status === "uploading" ? { ...s, progress: p } : s
          );
        }
      };

      xhr.onload = () => {
        try {
          const text = xhr.responseText || "{}";
          const data = JSON.parse(text);

          if (xhr.status >= 200 && xhr.status < 300) {
            if (
              data?.preview_url &&
              !String(data.preview_url).startsWith("http")
            ) {
              data.preview_url = buildAbs(data.preview_url);
            }
            setState({ status: "done", file, preview, result: data });
          } else {
            setState({
              status: "error",
              file,
              preview,
              message: data?.error || `Upload failed (${xhr.status})`,
            });
          }
        } catch {
          setState({
            status: "error",
            file,
            preview,
            message: `Unexpected server response (${xhr.status}).`,
          });
        }
        resolve();
      };

      xhr.onerror = () => {
        setState({
          status: "error",
          file,
          preview,
          message: "Network error while uploading.",
        });
        resolve();
      };

      xhr.send(form);
    });
  };

  const border = "border border-[color:var(--ring)] rounded-2xl";
  const subtle = "text-[color:var(--muted)]";

  const uploading = state.status === "uploading";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16 md:py-20 gap-8">
      <div className="w-full max-w-5xl mb-2">
        <h1 className="text-[32px] font-semibold mb-2">Generate from image</h1>
        <p className={subtle + " text-[14px] max-w-2xl"}>
          Upload a single object image. We will run basic sanity checks (file
          type, size, resolution) and show a preview before sending it to the
          reconstruction backend.
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-5xl">
        <div className={`card p-6 md:p-7 ${border}`}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`grid gap-3 place-items-center h-[300px] rounded-xl border-2 border-dashed border-[color:var(--ring)]
              bg-[rgba(255,255,255,.02)] hover:bg-[rgba(255,255,255,.04)] transition cursor-pointer`}
            onClick={pickFile}
            role="button"
            aria-label="Upload image"
            title="Click or drop an image"
          >
            {state.status === "idle" && (
              <>
                <div className={subtle}>
                  Drag &amp; drop an image here, or click to select
                </div>
                <div className="text-[14px]">
                  {accept.replace(/image\//g, "")} • up to {maxSizeMB}MB
                </div>
              </>
            )}

            {(state.status === "ready" ||
              state.status === "uploading" ||
              state.status === "done" ||
              state.status === "error") &&
              (state as any).preview && (
                <img
                  src={(state as any).preview}
                  alt="preview"
                  className="max-h-[240px] rounded-lg object-contain"
                />
              )}
          </div>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => onFiles(e.target.files)}
          />

          {/* Buttons row – Clear + Upload */}
          <div className="mt-6 flex gap-4 items-center">
            <button
              type="button"
              onClick={reset}
              className={`
                px-6 py-2 rounded-full text-white text-sm
                border border-white/70 bg-transparent
                hover:bg-white/10 transition
              `}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onUpload}
              disabled={uploading}
              className={`
                px-8 py-2 rounded-full text-white font-semibold text-sm
                border border-white/90 bg-transparent
                hover:bg-white/15 transition
                ${uploading ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              Upload
            </button>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mt-4">
              <div className="h-2 w-full bg-[rgba(255,255,255,.06)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--brand)]"
                  style={{ width: `${(state as any).progress}%` }}
                />
              </div>
              <div className="mt-2 text-xs flex justify-between">
                <span>{(state as any).progress}%</span>
                <span className={subtle}>
                  Estimated generation time: ~10–20s
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {state.status === "error" && (
            <div className="mt-3 text-sm text-red-300 font-medium">
              {(state as any).message}
            </div>
          )}

          {/* Done / server response */}
          {state.status === "done" && (
            <div className="mt-4 text-sm">
              <div className="font-medium mb-1">Server response:</div>
              <pre className="text-xs whitespace-pre-wrap break-words bg-black/30 rounded-lg p-3">
                {JSON.stringify((state as any).result, null, 2)}
              </pre>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 text-[14px] text-[color:var(--muted)] leading-relaxed">
            <div className="font-medium mb-1 text-white">
              Tips for best results:
            </div>
            <p>
              Use a clear, front-facing single-object image with minimal
              background clutter. Avoid low resolution or heavy motion blur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
