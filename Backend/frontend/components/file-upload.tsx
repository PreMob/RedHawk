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
      <CardContent className="p-6">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-900/50 p-6 transition-all",
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
              <div className="mb-4 rounded-full bg-red-950/30 p-3">
                <Upload className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-white">Upload Log Files</h3>
              <p className="mb-4 text-center text-sm text-gray-400">
                Drag and drop your CSV log files here, or click to browse
              </p>
              <Button
                variant="outline"
                className="border-red-900/50 text-red-500 hover:bg-red-950 hover:text-white"
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                <FileText className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </>
          )}

          {isUploading && (
            <div className="w-full space-y-4 text-center">
              <div className="flex items-center justify-center">
                <FileText className="h-8 w-8 text-red-500 animate-pulse" />
              </div>
              <p className="text-sm text-gray-400">Uploading {fileName}...</p>
              <Progress value={uploadProgress} className="h-2 bg-red-950/30 bg-red-500" />
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          )}

          {uploadSuccess && !isUploading && (
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium text-white">{fileName} uploaded successfully</p>
              <p className="text-xs text-gray-400">Log data is being analyzed</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-900/50 text-red-500 hover:bg-red-950 hover:text-white"
                onClick={handleButtonClick}
              >
                Upload Another File
              </Button>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 flex items-center rounded-md bg-red-950/20 p-2 text-sm text-red-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              {uploadError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
