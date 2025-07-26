"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import type { Question } from "@/data/hairlossquestions"

interface QuestionCardProps {
  question: Question
  value: any
  onChange: (value: any) => void
  error?: string
}

export function QuestionCard({ question, value, onChange, error }: QuestionCardProps) {
  console.log("Question name:", question);
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    onChange(fileArray)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    const newFiles = [...(value || [])]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  const renderInput = () => {
    switch (question.question_type) {
      case "radio":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 rounded-xl border-2 border-neutral-200 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-all duration-200 group"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 text-orange-500 border-2 border-neutral-300 focus:ring-orange-500 focus:ring-2"
                />
                <span className="ml-4 text-neutral-700 font-medium group-hover:text-neutral-900">{option}</span>
              </label>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 rounded-xl border-2 border-neutral-200 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-all duration-200 group"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      onChange([...currentValues, option])
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option))
                    }
                  }}
                  className="w-5 h-5 text-orange-500 border-2 border-neutral-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="ml-4 text-neutral-700 font-medium group-hover:text-neutral-900">{option}</span>
              </label>
            ))}
          </div>
        )

      case "select":
        console.log("select from gender or some");
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 rounded-xl border-2 border-neutral-200 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-all duration-200 group"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 text-orange-500 border-2 border-neutral-300 focus:ring-orange-500 focus:ring-2"
                />
                <span className="ml-4 text-neutral-700 font-medium group-hover:text-neutral-900">{option}</span>
              </label>
            ))}
          </div>
        )

      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 text-lg border-2 border-neutral-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-200 bg-white text-neutral-800 placeholder-neutral-500"
            placeholder="Enter your answer..."
          />
        )

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full p-4 text-lg border-2 border-neutral-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-200 bg-white text-neutral-800 placeholder-neutral-500"
            placeholder="Enter a number..."
          />
        )

      case "scale":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-neutral-500">Not Important</span>
              <span className="text-sm text-neutral-500">Very Important</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {question.options?.map((option) => (
                <label key={option} className="flex flex-col items-center cursor-pointer group">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                      value === option
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-neutral-300 text-neutral-600 group-hover:border-orange-300 group-hover:bg-orange-50"
                    }`}
                  >
                    {option}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case "file":
        return (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-orange-400 bg-orange-50"
                  : "border-neutral-300 hover:border-orange-300 hover:bg-orange-50/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">
                Drag and drop your photos here, or{" "}
                <label className="text-orange-500 hover:text-orange-600 cursor-pointer font-medium">
                  browse
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-sm text-neutral-500">Upload 2 photos (front and back views)</p>
            </div>

            {value && value.length > 0 && (
              <div className="space-y-2">
                {value.map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-800 leading-relaxed mb-2">{question.label}</h2>
      </div>

      {renderInput()}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
