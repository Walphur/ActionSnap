"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/ui/cn";

type Props = {
  disabled?: boolean;
  uploading: boolean;
  uploadProgress: { done: number; total: number };
  onUpload: (files: File[]) => void | Promise<void>;
};

const ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPT_RE = /^image\/(jpeg|png|webp)$/;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoUploader({ disabled, uploading, uploadProgress, onUpload }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasUploading = useRef(false);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url);
    };
  }, [previews]);

  useEffect(() => {
    if (wasUploading.current && !uploading && uploadProgress.done === uploadProgress.total && uploadProgress.total > 0) {
      setCompleted(true);
      setFiles([]);
      setError(null);
    }
    wasUploading.current = uploading;
  }, [uploading, uploadProgress.done, uploadProgress.total]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((f) => ACCEPT_RE.test(f.type));
    const rejected = Array.from(incoming).length - valid.length;
    if (valid.length === 0) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (rejected > 0) {
      setError(`${rejected} archivo(s) ignorado(s) — formato no permitido.`);
    } else {
      setError(null);
    }
    setCompleted(false);
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [`${f.name}-${f.size}-${f.lastModified}`, f]));
      for (const f of valid) map.set(`${f.name}-${f.size}-${f.lastModified}`, f);
      return Array.from(map.values());
    });
  }, []);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const progressPct = uploadProgress.total
    ? Math.round((uploadProgress.done / uploadProgress.total) * 100)
    : 0;

  function removeFile(file: File) {
    setFiles((prev) => prev.filter((f) => f !== file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) {
      setError("Elegí un evento activo antes de subir.");
      return;
    }
    if (!files.length) {
      setError("Seleccioná al menos una foto.");
      return;
    }
    setCompleted(false);
    await onUpload(files);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="ds-photo-uploader">
      <div
        className={cn(
          "ds-photo-uploader__dropzone",
          dragOver && "ds-photo-uploader__dropzone--active",
          disabled && "ds-photo-uploader__dropzone--disabled"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !uploading && e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
          }
        }}
      >
        <Upload className="ds-photo-uploader__icon" aria-hidden />
        <p className="ds-body font-medium">Arrastrá tus fotos acá</p>
        <p className="ds-caption mt-1 text-[var(--color-text-secondary)]">
          JPG, PNG o WebP · hasta 4 en paralelo al subir
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          Seleccionar fotos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="ds-photo-uploader__summary">
          <p className="ds-caption">
            <strong>{files.length}</strong> imagen{files.length === 1 ? "" : "es"} ·{" "}
            {formatBytes(totalBytes)} total
          </p>
        </div>
      )}

      {previews.length > 0 && (
        <ul className="ds-photo-uploader__thumbs" aria-label="Vista previa de archivos">
          {previews.map(({ file, url }) => (
            <li key={`${file.name}-${file.size}`} className="ds-photo-uploader__thumb">
              <img src={url} alt={file.name} loading="lazy" />
              <button
                type="button"
                className="ds-photo-uploader__thumb-remove"
                aria-label={`Quitar ${file.name}`}
                disabled={uploading}
                onClick={() => removeFile(file)}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {uploading && (
        <div className="ds-photo-uploader__progress">
          <p className="ds-caption">
            Subiendo {uploadProgress.done}/{uploadProgress.total} fotos…
          </p>
          <div className="ds-dash-progress">
            <div className="ds-dash-progress__bar" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {completed && !uploading && (
        <Alert tone="success" title="Subida completada">
          <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden />
          Las fotos ya están en tu evento con marca de agua.
        </Alert>
      )}

      {error && (
        <Alert tone="danger" title="Revisá la selección">
          {error}
        </Alert>
      )}

      <div className="ds-photo-uploader__actions">
        <Button
          type="submit"
          variant="primary"
          loading={uploading}
          disabled={disabled || files.length === 0}
        >
          {uploading ? `Subiendo ${uploadProgress.done}/${uploadProgress.total}…` : "Subir lote"}
        </Button>
        {files.length > 0 && !uploading && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setFiles([])}>
            <ImageIcon className="h-4 w-4" aria-hidden />
            Limpiar selección
          </Button>
        )}
      </div>
    </form>
  );
}
