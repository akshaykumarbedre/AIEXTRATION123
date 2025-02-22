'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from './components/Navbar'

export default function Home() {
  const [isHoveredSchema, setIsHoveredSchema] = useState(false)
  const [isHoveredExtract, setIsHoveredExtract] = useState(false)
  const [isHoveredApi, setIsHoveredApi] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center min-h-screen p-6">
        {/* Hero Section */}
        <section className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 py-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              AI-Powered Data Extraction
            </h1>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              Transform unstructured text into structured, schema-based data
              using advanced AI models.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/schema"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/extract"
                className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-all"
              >
                Try Demo
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-64 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-xl shadow-lg p-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M2 9h12M2 15h12M17 3v18M22 3v18"></path>
              </svg>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 opacity-70"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-5xl py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Define Schema Card */}
            <div
              className={`rounded-xl p-6 border transition-all duration-300 ${
                isHoveredSchema
                  ? 'border-blue-500 shadow-md shadow-blue-200 dark:shadow-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onMouseEnter={() => setIsHoveredSchema(true)}
              onMouseLeave={() => setIsHoveredSchema(false)}
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Define Schema</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create a structured schema with field names, types, and
                descriptions.
              </p>
              <Link
                href="/schema"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Define Schema
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>

            {/* Extract Data Card */}
            <div
              className={`rounded-xl p-6 border transition-all duration-300 ${
                isHoveredExtract
                  ? 'border-teal-500 shadow-md shadow-teal-200 dark:shadow-teal-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onMouseEnter={() => setIsHoveredExtract(true)}
              onMouseLeave={() => setIsHoveredExtract(false)}
            >
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teal-600"
                >
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="m16 16-4 4-4-4"></path>
                  <path d="M12 12v8"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Extract Data</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Input your unstructured text and let AI convert it to structured
                data.
              </p>
              <Link
                href="/extract"
                className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                Extract Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>

            {/* API Access Card */}
            <div
              className={`rounded-xl p-6 border transition-all duration-300 ${
                isHoveredApi
                  ? 'border-purple-500 shadow-md shadow-purple-200 dark:shadow-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onMouseEnter={() => setIsHoveredApi(true)}
              onMouseLeave={() => setIsHoveredApi(false)}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">API Access</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Integrate with our RESTful API to automate your data workflows.
              </p>
              <Link
                href="/api-docs"
                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
              >
                View API Docs
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="w-full max-w-5xl py-12 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-center mb-8">Powered By</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 mb-2"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              <span className="text-sm font-medium">Google Gemini</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 mb-2"
              >
                <path d="M4 6V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H4"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <circle cx="6" cy="14" r="3"></circle>
                <path d="M10 14h10"></path>
                <path d="M10 20h10"></path>
                <path d="M8 20H4"></path>
                <path d="M8 8H4"></path>
              </svg>
              <span className="text-sm font-medium">Python Flask</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 mb-2"
              >
                <path d="M7 20V4h10l-1 4h-6v12Z"></path>
              </svg>
              <span className="text-sm font-medium">Next.js</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 mb-2"
              >
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path>
              </svg>
              <span className="text-sm font-medium">LangChain</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
