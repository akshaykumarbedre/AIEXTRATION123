'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ProcessPage() {
  // State management
  const [schema, setSchema] = useState([
    ["name", "str", "name of the person"],
    ["price", "int", "price for a service"],
    ["gender", "bool", "return true if he is male"],
    ["list_of_suggest", "List[str]", "list of subject names"]
  ]);
  const [className, setClassName] = useState('SingleData');
  const [inputText, setInputText] = useState('');
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState({
    schema: false,
    process: false,
    export: false
  });
  const [schemaCreated, setSchemaCreated] = useState(false);
  const [modelCode, setModelCode] = useState('');

  // Handle schema field updates
  const updateSchemaField = (index, fieldIndex, value) => {
    const newSchema = [...schema];
    newSchema[index][fieldIndex] = value;
    setSchema(newSchema);
  };

  // Add a new field to schema
  const addSchemaField = () => {
    setSchema([...schema, ["", "str", ""]]);
  };

  // Remove a field from schema
  const removeSchemaField = (index) => {
    const newSchema = schema.filter((_, i) => i !== index);
    setSchema(newSchema);
  };

  // Create schema
  const createSchema = async () => {
    try {
      setLoading({ ...loading, schema: true });
      
      const response = await fetch('http://localhost:5000/api/create-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field_definitions: schema,
          class_name: className
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schema');
      }
      
      toast.success('Schema created successfully');
      setSchemaCreated(true);
      setModelCode(data.model_code);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading({ ...loading, schema: false });
    }
  };

  // Process data
  const processData = async () => {
    try {
      if (!schemaCreated) {
        toast.error('Please create schema first');
        return;
      }
      
      if (!inputText.trim()) {
        toast.error('Please enter text to process');
        return;
      }
      
      setLoading({ ...loading, process: true });
      
      const response = await fetch('http://localhost:5000/api/process-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          chunk_size: chunkSize,
          chunk_overlap: chunkOverlap
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process data');
      }
      
      setResults(data.results);
      toast.success(`Processed ${data.total_items} items successfully`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading({ ...loading, process: false });
    }
  };

  // Export results to CSV
  const exportToCsv = async () => {
    try {
      if (results.length === 0) {
        toast.error('No results to export');
        return;
      }
      
      setLoading({ ...loading, export: true });
      
      const response = await fetch('http://localhost:5000/api/export-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: results
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }
      
      // Create blob from response and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'results.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading({ ...loading, export: false });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Data Processing Pipeline</h1>
      
      {/* Step 1: Schema Creation */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Step 1: Create Schema</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
            disabled={schemaCreated}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Definitions
          </label>
          
          {schema.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={field[0]}
                onChange={(e) => updateSchemaField(index, 0, e.target.value)}
                placeholder="Field name"
                className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                disabled={schemaCreated}
              />
              <select
                value={field[1]}
                onChange={(e) => updateSchemaField(index, 1, e.target.value)}
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
                onChange={(e) => updateSchemaField(index, 2, e.target.value)}
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
            <h3 className="text-lg font-medium mb-2">Generated Model Code</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              {modelCode}
            </pre>
          </div>
        )}
      </div>
      
      {/* Step 2: Process Data */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Step 2: Process Text Data</h2>
        
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
      </div>
      
      {/* Step 3: Results */}
      {results.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Step 3: Results</h2>
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
                      <td key={key} className="px-6 py-4 whitespace-nowrap">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}