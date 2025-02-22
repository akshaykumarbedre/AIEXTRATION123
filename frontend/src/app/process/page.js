'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function ProcessPage() {
  // State management
  const [activeTab, setActiveTab] = useState('schema')
  const [schema, setSchema] = useState([
    ['name', 'str', 'name of the person'],
    ['price', 'int', 'price for a service'],
    ['gender', 'bool', 'return true if he is male'],
    ['list_of_suggest', 'List[str]', 'list of subject names'],
  ])
  const [className, setClassName] = useState('SingleData')
  const [inputText, setInputText] = useState('')
  const [chunkSize, setChunkSize] = useState(1000)
  const [chunkOverlap, setChunkOverlap] = useState(100)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState({
    schema: false,
    process: false,
    export: false,
  })
  const [schemaCreated, setSchemaCreated] = useState(false)
  const [modelCode, setModelCode] = useState('')

  // Schema management functions
  const updateSchemaField = (index, fieldIndex, value) => {
    const newSchema = [...schema]
    newSchema[index][fieldIndex] = value
    setSchema(newSchema)
  }

  const addSchemaField = () => {
    setSchema([...schema, ['', 'str', '']])
  }

  const removeSchemaField = (index) => {
    const newSchema = schema.filter((_, i) => i !== index)
    setSchema(newSchema)
  }

  // API functions remain the same as in your original code
  const createSchema = async () => {
    try {
      if (!className.trim()) {
        toast.error('Class name is required')
        return
      }

      // Validate schema fields
      const invalidFields = schema.filter(
        field => !field[0].trim() || !field[1].trim() || !field[2].trim()
      )
      if (invalidFields.length > 0) {
        toast.error('All schema fields must be filled')
        return
      }

      setLoading({ ...loading, schema: true })

      const response = await fetch('http://localhost:5000/api/create-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_definitions: schema,
          class_name: className,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schema')
      }

      toast.success('Schema created successfully')
      setSchemaCreated(true)
      setModelCode(data.model_code)
      setActiveTab('process')
    } catch (error) {
      console.error('Schema creation error:', error)
      toast.error(error.message)
    } finally {
      setLoading({ ...loading, schema: false })
    }
  }

  const processData = async () => {
    try {
      if (!schemaCreated) {
        toast.error('Please create schema first')
        return
      }

      if (!inputText.trim()) {
        toast.error('Please enter text to process')
        return
      }

      if (chunkSize <= 0 || chunkOverlap < 0 || chunkOverlap >= chunkSize) {
        toast.error('Invalid chunk size or overlap')
        return
      }

      setLoading({ ...loading, process: true })

      const response = await fetch('http://localhost:5000/api/process-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          chunk_size: chunkSize,
          chunk_overlap: chunkOverlap,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process data')
      }

      setResults(data.results)
      toast.success(`Processed ${data.total_items} items successfully`)
    } catch (error) {
      console.error('Processing error:', error)
      toast.error(error.message)
    } finally {
      setLoading({ ...loading, process: false })
    }
  }

  const exportToCsv = async () => {
    try {
      if (results.length === 0) {
        toast.error('No results to export')
        return
      }

      setLoading({ ...loading, export: true })

      const response = await fetch('http://localhost:5000/api/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: results }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'results.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('CSV exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.message)
    } finally {
      setLoading({ ...loading, export: false })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Data Processing Pipeline</h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'schema'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('schema')}
        >
          Schema Creation
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'process'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('process')}
        >
          Process Data
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'schema' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Definitions
              </label>

              {schema.map((field, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={field[0]}
                    onChange={(e) =>
                      updateSchemaField(index, 0, e.target.value)
                    }
                    placeholder="Field name"
                    className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    disabled={schemaCreated}
                  />
                  <select
                    value={field[1]}
                    onChange={(e) =>
                      updateSchemaField(index, 1, e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md w-32"
                    disabled={schemaCreated}
                  >
                    <option value="str">str</option>
                    <option value="int">int</option>
                    <option value="float">float</option>
                    <option value="bool">bool</option>
                    <option value="List[str]">List[str]</option>
                    <option value="List[int]">List[int]</option>
                    <option value="Dict[str, Any]">Dict[str, Any]</option>
                  </select>
                  <input
                    type="text"
                    value={field[2]}
                    onChange={(e) =>
                      updateSchemaField(index, 2, e.target.value)
                    }
                    placeholder="Description"
                    className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                    disabled={schemaCreated}
                  />
                  <button
                    onClick={() => removeSchemaField(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md"
                    disabled={schema.length <= 1 || schemaCreated}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="mt-2">
                <button
                  onClick={addSchemaField}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
                  disabled={schemaCreated}
                >
                  Add Field
                </button>
                <button
                  onClick={createSchema}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                  disabled={loading.schema || schemaCreated}
                >
                  {loading.schema ? 'Creating...' : 'Create Schema'}
                </button>
              </div>
            </div>

            {schemaCreated && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Generated Model Code
                </h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {modelCode}
                </pre>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md w-full h-32"
                placeholder="Enter text to process..."
                disabled={!schemaCreated}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Size
                </label>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  disabled={!schemaCreated}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chunk Overlap
                </label>
                <input
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  disabled={!schemaCreated}
                />
              </div>
            </div>

            <button
              onClick={processData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={loading.process || !schemaCreated}
            >
              {loading.process ? 'Processing...' : 'Process Data'}
            </button>

            {/* Results Table */}
            {results.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Results</h2>
                  <button
                    onClick={exportToCsv}
                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                    disabled={loading.export}
                  >
                    {loading.export ? 'Exporting...' : 'Export to CSV'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(results[0]).map((key) => (
                          <th
                            key={key}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((item, index) => (
                        <tr key={index}>
                          {Object.entries(item).map(([key, value]) => (
                            <td
                              key={key}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
