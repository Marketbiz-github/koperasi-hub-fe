"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { validateImage } from "@/utils/image-validation"
import { toast } from "sonner"

export function MultiImageUpload() {
  const [images, setImages] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files);

    // Validate
    const validFiles: File[] = [];
    newFiles.forEach(file => {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles])
    }
  }

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles: File[] = [];

      newFiles.forEach(file => {
        const validation = validateImage(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          toast.error(`${file.name}: ${validation.error}`);
        }
      });

      if (validFiles.length > 0) {
        setImages((prev) => [...prev, ...validFiles])
      }
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors ${dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
      >
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p className="font-semibold text-gray-700">Drag and drop gambar di sini</p>
            <p className="text-sm text-gray-500">atau</p>
          </div>
          <label htmlFor="file-upload">
            <span className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
              klik untuk memilih
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF hingga 1MB
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            {images.length} gambar dipilih
          </p>
          <div className="grid grid-cols-4 gap-3">
            {images.map((file, index) => (
              <div
                key={index}
                className="relative aspect-square rounded border bg-gray-100 overflow-hidden group"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`preview ${index}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-1">
                  <p className="text-xs text-white truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
