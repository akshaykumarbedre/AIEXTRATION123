// app/page.js
'use client';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// API Base URL - change this to match your Flask backend
const API_BASE_URL = 'http://localhost:5000';

export default function Home() {
  // State management
  const [activeTab, setActiveTab] = useState('schema');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');
  
  // Schema creation state
  const [className, setClassName] = useState('DataEntry');
  const [fields, setFields] = useState([
    { name: '', type: 'str', description: '' }
  ]);
  const [schemaResponse, setSchemaResponse] = useState(null);
  
  // Text processing state
  const [textData, setTextData] = useState('');
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [processedResults, setProcessedResults] = useState([]);
  
  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          setApiStatus('connected');
          toast.success(`Connected to ${data.model} model`);
        } else {
          setApiStatus('error');
          toast.error('Failed to connect to API');
        }
      } catch (error) {
        setApiStatus('error');
        toast.error('API connection failed: ' + error.message);
      }
    };
    
    checkApiHealth();
  }, []);

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        toast.success(`Connected to API: ${JSON.stringify(data)}`);
        return true;
      } else {
        console.error('API responded with error:', response.status);
        toast.error(`API error: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error(`Connection failed: ${error.message}`);
      return false;
    }
  };

  // Add new field to schema
  const addField = () => {
    setFields([...fields, { name: '', type: 'str', description: '' }]);
  };

  // Update field values
  const updateField = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  // Remove field from schema
  const removeField = (index) => {
    if (fields.length > 1) {
      const updatedFields = fields.filter((_, i) => i !== index);
      setFields(updatedFields);
    }
  };

  // Handle schema creation
  const handleCreateSchema = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate fields
    const invalidFields = fields.filter(f => !f.name || !f.description);
    if (invalidFields.length > 0) {
      toast.error('All fields must have a name and description');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Sending request to:', `${API_BASE_URL}/api/create-schema`);
      
      // Convert fields to the expected format
      const fieldDefinitions = fields.map(field => [
        field.name,
        field.type,
        field.description
      ]);
      
      const requestBody = {
        field_definitions: fieldDefinitions,
        class_name: className
      };
      
      console.log('Request payload:', JSON.stringify(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/api/create-schema`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Schema creation successful:', data);
        setSchemaResponse(data);
        toast.success('Schema created successfully');
        setActiveTab('process'); // Automatically switch to process tab
      } else {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP Error: ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP Error: ${response.status}`;
        }
        console.error('Schema creation failed:', errorMessage);
        toast.error(`Schema creation failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Schema creation error:', error);
      toast.error(`Error creating schema: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text processing
  const handleProcessText = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!textData.trim()) {
      toast.error('Please enter text to process');
      setIsLoading(false);
      return;
    }
    
    if (!schemaResponse) {
      toast.error('Please create a schema first');
      setActiveTab('schema');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/process-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textData,
          chunk_size: parseInt(chunkSize),
          chunk_overlap: parseInt(chunkOverlap)
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProcessedResults(data.results);
        toast.success(`Processed ${data.total_items} items successfully`);
        setActiveTab('results');
      } else {
        toast.error(`Processing failed: ${data.error}`);
      }
    } catch (error) {
      toast.error('Error processing text: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    if (processedResults.length === 0) {
      toast.error('No results to export');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/export-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: processedResults
        }),
      });
      
      if (response.ok) {
        // Create blob from response and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('CSV exported successfully');
      } else {
        const errorData = await response.json();
        toast.error(`Export failed: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('Error exporting CSV: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: {
            style: {
              background: '#f0fff4',
              border: '1px solid #38a169',
              color: '#2f855a',
            },
          },
          error: {
            style: {
              background: '#fff5f5',
              border: '1px solid #e53e3e',
              color: '#c53030',
            },
          },
        }}
      />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Gradient Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Text Processing App
        </h1>
        
        {/* API Status Card */}
        <div className="mb-8 flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <span className="text-lg text-gray-600 mr-2">API Status:</span>
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            <span className="text-gray-700 font-medium">
              {apiStatus === 'connected' ? 'Connected' : 
              apiStatus === 'error' ? 'Error Connecting' : 'Checking...'}
            </span>
          </div>
          <button 
            onClick={testApiConnection}
            className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            Test Connection
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 bg-gray-100 p-1 rounded-lg shadow-md">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all ${
                activeTab === 'schema' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              1. Create Schema
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all ${
                activeTab === 'process' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
              disabled={!schemaResponse}
            >
              2. Process Text
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all ${
                activeTab === 'results' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
              disabled={processedResults.length === 0}
            >
              3. View Results
            </button>
          </nav>
        </div>
        
        {/* Main Content Container */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Schema Creation Tab */}
          {activeTab === 'schema' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Define Schema</h2>
              <form onSubmit={handleCreateSchema}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter class name"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Field Definitions
                    </label>
                    <button
                      type="button"
                      onClick={addField}
                      className="flex items-center text-sm px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Field
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Field Name</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Field name"
                            required
                          />
                        </div>
                        <div className="w-40">
                          <label className="block text-xs text-gray-500 mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(index, 'type', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white"
                          >
                            <option value="str">str</option>
                            <option value="int">int</option>
                            <option value="float">float</option>
                            <option value="bool">bool</option>
                            <option value="List[str]">List[str]</option>
                            <option value="Dict[str, Any]">Dict[str, Any]</option>
                            <option value="Optional[str]">Optional[str]</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Description</label>
                          <input
                            type="text"
                            value={field.description}
                            onChange={(e) => updateField(index, 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Description"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={fields.length <= 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Schema...
                    </span>
                  ) : 'Create Schema'}
                </button>
              </form>
              
              {schemaResponse && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Schema Created Successfully</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm font-mono">
                      {schemaResponse.model_code}
                      {'\n\n'}
                      {schemaResponse.wrapper_code}
                    </pre>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">Your schema has been successfully created. You can now proceed to processing text.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Text Processing Tab */}
          {activeTab === 'process' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Process Text</h2>
              <form onSubmit={handleProcessText}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text to Process
                  </label>
                  <textarea
                    value={textData}
                    onChange={(e) => setTextData(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg shadow-sm min-h-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter text to process..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chunk Size
                    </label>
                    <input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="100"
                      max="10000"
                    />
                    <p className="mt-1 text-sm text-gray-500">Maximum characters per text chunk</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chunk Overlap
                    </label>
                    <input
                      type="number"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      max="1000"
                    />
                    <p className="mt-1 text-sm text-gray-500">Character overlap between chunks</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Process Text'}
                </button>
              </form>
            </div>
          )}
          
          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  Results <span className="text-lg text-teal-500 font-normal ml-1">({processedResults.length} items)</span>
                </h2>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-md disabled:bg-teal-300 disabled:cursor-not-allowed"
                  disabled={isLoading || processedResults.length === 0}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export to CSV
                    </>
                  )}
                </button>
              </div>
              
              {processedResults.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(processedResults[0]).map(key => (
                          <th key={key} className="border-b px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processedResults.map((result, resultIndex) => (
                        <tr key={resultIndex} className={resultIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.entries(result).map(([key, value]) => (
                            <td key={key} className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No results available yet.</p>
                  <p className="text-gray-400 text-sm mt-2">Process some text first to see results here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
        <p>Text Processing App &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}