// src/components/dream/MediaUploader.tsx

"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface MediaUploaderProps {
  onUpload: (files: File[]) => void;
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
        isDragActive ? "border-indigo-400 bg-indigo-900/10" : "border-slate-700"
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-gray-400 text-center">
        Drag & drop media here, or click to select files.
      </p>
    </div>
  );
}
