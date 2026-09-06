"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, Star, GripVertical, ImageIcon, Loader2 } from "lucide-react";

export interface UploadedImage {
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number; // 0–100
  error?: string;
  done: boolean;
  previewUrl: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  productName?: string;
  /** Called with true when any upload is in-flight, false when all complete */
  onUploadingChange?: (isUploading: boolean) => void;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Signed Cloudinary upload:
 * 1. Fetch signature + credentials from our protected server route
 * 2. Upload directly to Cloudinary using those signed credentials
 * API Secret is NEVER in the browser — all signing happens server-side
 */
async function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  // ── Step 1: Get a signed token from our server ─────────────────────────
  const sigRes = await fetch("/api/admin/upload-signature", {
    method: "POST",
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get upload signature");
  }

  const { signature, timestamp, apiKey, folder, uploadPreset, cloudName } =
    await sigRes.json();

  // ── Step 2: Upload directly to Cloudinary with the signature ───────────
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName || CLOUD_NAME}/image/upload`
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 90));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        onProgress(100);
        resolve(data.secure_url);
      } else {
        const errData = JSON.parse(xhr.responseText || "{}");
        reject(new Error(errData?.error?.message || "Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}


export default function ImageUploader({
  images,
  onChange,
  productName = "",
  onUploadingChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      // Create uploading placeholders
      const placeholders: UploadingFile[] = imageFiles.map((f) => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        progress: 0,
        done: false,
        previewUrl: URL.createObjectURL(f),
      }));

      setUploading((prev) => [...prev, ...placeholders]);
      onUploadingChange?.(true); // ← tell parent: uploads in flight

      // Track how many have finished (success or error)
      let finishedCount = 0;
      const totalCount = imageFiles.length;

      // Upload each file
      await Promise.all(
        imageFiles.map(async (file, idx) => {
          const placeholder = placeholders[idx];
          try {
            const url = await uploadToCloudinary(file, (pct) => {
              setUploading((prev) =>
                prev.map((u) =>
                  u.id === placeholder.id ? { ...u, progress: pct } : u
                )
              );
            });

            // Add to confirmed images list
            const isFirst = images.length === 0 && idx === 0;
            const newImage: UploadedImage = {
              url,
              altText: productName || file.name.replace(/\.[^.]+$/, ""),
              isPrimary: isFirst,
            };
            onChange([...images, newImage]);

            // Mark done in progress list
            setUploading((prev) =>
              prev.map((u) =>
                u.id === placeholder.id ? { ...u, done: true, progress: 100 } : u
              )
            );

            // Remove from uploading queue after a brief delay
            setTimeout(() => {
              setUploading((prev) => prev.filter((u) => u.id !== placeholder.id));
            }, 800);
          } catch (err) {
            setUploading((prev) =>
              prev.map((u) =>
                u.id === placeholder.id
                  ? { ...u, error: err instanceof Error ? err.message : "Upload failed", done: true }
                  : u
              )
            );
          } finally {
            finishedCount++;
            // When all files are done, tell parent uploading is complete
            if (finishedCount === totalCount) {
              onUploadingChange?.(false);
            }
          }
        })
      );

      setUploading((prev) => prev.filter((u) => u.error));
    },
    [images, onChange, productName, onUploadingChange]
  );

  const handleFiles = (files: FileList | File[]) => {
    processFiles(Array.from(files));
  };

  // ── Drag zone events ──────────────────────────────────────────────────────
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // ── Reorder drag ──────────────────────────────────────────────────────────
  const onThumbDragStart = (e: React.DragEvent, i: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIndex(i);
  };
  const onThumbDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };
  const onThumbDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(i, 0, moved);
    // First image is always primary
    const withPrimary = reordered.map((img, idx) => ({
      ...img,
      isPrimary: idx === 0,
    }));
    onChange(withPrimary);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ── Image actions ─────────────────────────────────────────────────────────
  const setPrimary = (i: number) => {
    const updated = images.map((img, idx) => ({ ...img, isPrimary: idx === i }));
    // Swap primary to front for better UX
    const primary = updated.splice(i, 1)[0];
    onChange([primary, ...updated]);
  };

  const removeImage = (i: number) => {
    const filtered = images.filter((_, idx) => idx !== i);
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered);
  };


  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 py-6 sm:py-10 px-4 cursor-pointer transition-all select-none ${
          dragging
            ? "border-yellow-500 bg-yellow-50 scale-[1.01]"
            : "border-gray-200 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50/50"
        }`}
      >
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors ${
            dragging ? "bg-yellow-100" : "bg-white border border-gray-100"
          }`}
        >
          <Upload size={22} className={dragging ? "text-yellow-600" : "text-gray-400"} />
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            {dragging ? "Drop images here" : "Drag & drop images here"}
          </p>
          <p className="text-[0.7rem] sm:text-xs text-gray-400 mt-1">
            or tap to browse — JPG, PNG, WebP (multiple allowed)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <img src={u.previewUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{u.name}</p>
                {u.error ? (
                  <p className="text-xs text-red-500">{u.error}</p>
                ) : (
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${u.progress}%`,
                        background: u.done
                          ? "#22c55e"
                          : "var(--color-gold-dark, #b8860b)",
                      }}
                    />
                  </div>
                )}
              </div>
              {u.done && !u.error ? (
                <span className="text-green-500 text-xs font-semibold shrink-0">✓</span>
              ) : !u.done ? (
                <Loader2 size={14} className="animate-spin text-gray-400 shrink-0" />
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-[0.7rem] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            {images.length} image{images.length !== 1 ? "s" : ""} — drag to reorder · first image is primary
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {images.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                draggable
                onDragStart={(e) => onThumbDragStart(e, i)}
                onDragOver={(e) => onThumbDragOver(e, i)}
                onDrop={(e) => onThumbDrop(e, i)}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                  dragOverIndex === i ? "scale-105 opacity-80" : ""
                } ${dragIndex === i ? "opacity-40" : ""}`}
              >
                {/* Thumbnail */}
                <div
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    img.isPrimary
                      ? "border-yellow-500 shadow-md shadow-yellow-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* Primary badge */}
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-yellow-500 text-white text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-xs">
                    PRIMARY
                  </span>
                )}

                {/* Drag handle (visible on hover for desktop) */}
                <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/40 rounded-md p-0.5">
                    <GripVertical size={10} className="text-white" />
                  </div>
                </div>

                {/* Action buttons (always visible on touch/mobile, hover on desktop) */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                  {/* Set primary */}
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors shadow-sm"
                      title="Set as primary"
                    >
                      <Star size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add more placeholder */}
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all"
            >
              <ImageIcon size={18} className="text-gray-300" />
              <span className="text-[0.65rem] text-gray-400 font-medium">Add more</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
