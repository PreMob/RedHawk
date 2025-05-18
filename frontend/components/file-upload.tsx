"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileUpload: (data: any[]) => void
  className?: string
}

export function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const parseCSV = (text: string) => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((header) => header.trim())

    const data = lines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const values = line.split(",").map((value) => value.trim())
        return headers.reduce(
          (obj, header, index) => {
            obj[header] = values[index]
            return obj
          },
          {} as Record<string, string>,
        )
      })

    return data
  }

  const processFile = (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)
    setFileName(file.name)

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      setUploadError("Only CSV files are supported")
      setIsUploading(false)
      return
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = parseCSV(text)

        // Simulate processing delay
        setTimeout(() => {
          clearInterval(progressInterval)
          setUploadProgress(100)
          setIsUploading(false)
          setUploadSuccess(true)
          onFileUpload(data)
        }, 1000)
      } catch (error) {
        clearInterval(progressInterval)
        setUploadError("Failed to parse CSV file. Please check the format.")
        setIsUploading(false)
      }
    }

    reader.onerror = () => {
      clearInterval(progressInterval)
      setUploadError("Failed to read file")
      setIsUploading(false)
    }

    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={cn("border-red-900/30 bg-black", className)}>
      <CardContent className="p-5">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-900/50 p-3 transition-all",
            isDragging ? "border-red-500 bg-red-950/20" : "hover:border-red-800/70",
            isUploading ? "opacity-80" : "",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {!isUploading && !uploadSuccess && (
            <>
              <div className="mb-2 rounded-full bg-red-950/30 p-2">
                <Upload className="h-4 w-4 text-red-500" />
              </div>
              <h3 className="mb-0.5 text-sm font-semibold text-white">Upload Log Files</h3>
              <p className="mb-2 text-center text-xs text-gray-400">
                Drop CSV files or click to browse
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-red-900/50 text-red-500 hover:bg-red-950 hover:text-white text-xs"
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                <FileText className="mr-1 h-3 w-3" />
                Browse
              </Button>
            </>
          )}

          {isUploading && (
            <div className="w-full space-y-2 text-center">
              <FileText className="h-5 w-5 text-red-500 animate-pulse mx-auto" />
              <p className="text-xs text-gray-400">Uploading {fileName}...</p>
              <Progress value={uploadProgress} className="h-1.5 bg-red-950/30 bg-red-500" />
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          )}

          {uploadSuccess && !isUploading && (
            <div className="flex flex-col items-center justify-center space-y-1 text-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-xs font-medium text-white">{fileName} uploaded successfully</p>
              <p className="text-xs text-gray-400">Log data is being analyzed</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 border-red-900/50 text-red-500 hover:bg-red-950 hover:text-white text-xs"
                onClick={handleButtonClick}
              >
                Upload Another
              </Button>
            </div>
          )}

          {uploadError && (
            <div className="mt-2 flex items-center rounded-md bg-red-950/20 p-1.5 text-xs text-red-500">
              <AlertCircle className="mr-1 h-3 w-3" />
              {uploadError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
