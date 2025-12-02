'use client';

import React, { useCallback, useRef, useState } from 'react';

type Props = {
  apiBase?: string;            // e.g. https://your-render.onrender.com
  accept?: string;             // MIME or ext list
  maxSizeMB?: number;          // client-side size limit
};

type UploadState =
  | { status: 'idle' }
  | { status: 'ready'; file: File; preview: string }
  | { status: 'uploading'; file: File; preview: string; progress: number }
  | { status: 'done'; file: File; preview: string; result: any }
  | { status: 'error'; file?: File; preview?: string; message: string };

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp';
const MAX_SIZE_MB = 20;

export default function UploadWidget({
  // 为空 => 同源（/upload）；GH Pages 用 Actions 注入 NEXT_PUBLIC_API_BASE 也行
  apiBase = process.env.NEXT_PUBLIC_API_BASE || '',
  accept = DEFAULT_ACCEPT,
  maxSizeMB = MAX_SIZE_MB,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const reset = () => setState({ status: 'idle' });
  const pickFile = () => inputRef.current?.click();

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      const f = files[0];

      // 类型校验
      const acceptList = accept.split(',').map(s => s.trim());
      const okType = acceptList.some(rule =>
        rule.startsWith('.') ? f.name.toLowerCase().endsWith(rule.toLowerCase()) : f.type === rule
      );
      if (!okType) {
        setState({ status: 'error', message: 'Unsupported file type.' });
        return;
      }

      // 大小校验
      if (f.size > maxSizeMB * 1024 * 1024) {
        setState({ status: 'error', message: `Max file size is ${maxSizeMB} MB.` });
        return;
      }

      const preview = URL.createObjectURL(f);
      setState({ status: 'ready', file: f, preview });
    },
    [accept, maxSizeMB]
  );

  const onDrop: React.DragEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const buildBase = (s: string) => (s ? s.replace(/\/$/, '') : '');
  const buildAbs = (maybeRel: string) =>
    maybeRel.startsWith('http')
      ? maybeRel
      : `${buildBase(apiBase)}${maybeRel.startsWith('/') ? '' : '/'}${maybeRel}`;

  const onUpload = async () => {
    if (state.status !== 'ready' && state.status !== 'error') return;
    const file = state.status === 'ready' ? state.file : (state.file as File);
    const preview = state.status === 'ready' ? state.preview : (state.preview as string);

    // 使用 XHR 以便拿到进度
    setState({ status: 'uploading', file, preview, progress: 0 });

    const form = new FormData();
    form.append('file', file);

    const url = `${buildBase(apiBase)}/upload`;

    await new Promise<void>(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.upload.onprogress = evt => {
        if (evt.lengthComputable) {
          const p = Math.round((evt.loaded / evt.total) * 100);
          setState(s => (s.status === 'uploading' ? { ...s, progress: p } : s));
        }
      };

      xhr.onload = () => {
        try {
          const text = xhr.responseText || '{}';
          const data = JSON.parse(text);

          if (xhr.status >= 200 && xhr.status < 300) {
            // 如果后端返回相对路径的 preview_url，拼成绝对 URL
            if (data?.preview_url && !String(data.preview_url).startsWith('http')) {
              data.preview_url = buildAbs(data.preview_url);
            }
            setState({ status: 'done', file, preview, result: data });
          } else {
            setState({
              status: 'error',
              file,
              preview,
              message: data?.error || `Upload failed (${xhr.status})`,
            });
          }
        } catch {
          setState({
            status: 'error',
            file,
            preview,
            message: `Unexpected server response (${xhr.status}).`,
          });
        }
        resolve();
      };

      xhr.onerror = () => {
        setState({ status: 'error', file, preview, message: 'Network error while uploading.' });
        resolve();
      };

      xhr.send(form);
    });
  };

  const border = 'border border-[color:var(--ring)] rounded-2xl';
  const subtle = 'text-[color:var(--muted)]';
  const btn = 'btn';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-6xl">
        {/* 左侧：拖拽/选择/预览 */}
        <div className={`card p-5 ${border}`}>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            className={`grid gap-3 place-items-center h-[300px] rounded-xl border-2 border-dashed border-[color:var(--ring)]
              bg-[rgba(255,255,255,.02)] hover:bg-[rgba(255,255,255,.04)] transition cursor-pointer`}
            onClick={pickFile}
            role="button"
            aria-label="Upload image"
            title="Click or drop an image"
          >
            {state.status === 'idle' && (
              <>
                <div className={subtle}>Drag & drop an image here, or click to select</div>
                <div className="text-sm">{accept.replace(/image\//g, '')} • up to {maxSizeMB}MB</div>
              </>
            )}

            {(state.status === 'ready' ||
              state.status === 'uploading' ||
              state.status === 'done' ||
              state.status === 'error') && state.preview && (
              <img
                src={state.preview}
                alt="preview"
                className="max-h-[240px] rounded-lg object-contain"
              />
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={e => onFiles(e.target.files)}
          />

          <div className="mt-4 flex items-center gap-3">
            <button className={`${btn}`} onClick={pickFile}>Choose</button>
            <button
              className={`${btn} ghost`}
              onClick={reset}
              disabled={state.status === 'idle'}
            >
              Clear
            </button>
            <button
              className={`${btn}`}
              onClick={onUpload}
              disabled={state.status === 'idle' || state.status === 'uploading'}
            >
              {state.status === 'uploading' ? 'Uploading…' : 'Upload'}
            </button>
          </div>

          {state.status === 'uploading' && (
            <div className="mt-4">
              <div className="h-2 w-full bg-[rgba(255,255,255,.06)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--brand)]"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <div className="mt-2 text-sm">{state.progress}%</div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="mt-3 text-sm text-red-300">{state.message}</div>
          )}
        </div>

        {/* 右侧：结果展示 */}
        <div className={`card p-5 ${border}`}>
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          <p className={subtle}>
            The server response will appear here after upload.
          </p>

          <div className="mt-4 rounded-xl bg-[rgba(255,255,255,.02)] p-4">
            {state.status === 'done' ? (
              <>
                {/* 如果后端给了 preview_url，则显示图片 */}
                {state.result?.preview_url ? (
                  <div className="mb-4">
                    <div className="text-sm mb-2 text-[color:var(--muted)]">Server preview:</div>
                    <img
                      src={state.result.preview_url}
                      alt="server preview"
                      className="max-h-[260px] rounded-lg object-contain"
                    />
                  </div>
                ) : null}

                <pre className="text-sm whitespace-pre-wrap break-words">
                  {JSON.stringify(state.result, null, 2)}
                </pre>
              </>
            ) : (
              <div className={subtle}>No result yet.</div>
            )}
          </div>
        </div>
        The current webage is not the final product, I'm still fixing some issues and will add more components. !!
        Hopefully we will havea really cool webpage eventually

      </div>
    </div>
  );
}

