from flask import Flask, request, jsonify, Response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import Any, Dict, List, Union, Optional
from pydantic import BaseModel, Field
from functools import reduce
import re
import csv
from flask_cors import CORS
import io
from dotenv import load_dotenv
import os

# Initialize Flask application
app = Flask(__name__)
CORS(app)
# Load environment variables
load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")
model_name = os.getenv("MODEL")

# Initialize the model
Model_vision = ChatGoogleGenerativeAI(model=model_name)

def json_to_pydantic_model(json_data: Union[List, Dict], class_name: str = "SingleData") -> str:
    """
    Convert a list of field definitions to a Pydantic BaseModel class definition.
    
    Args:
        json_data: List of field definitions [name, type, description] or dict
        class_name: Name for the Pydantic class
        
    Returns:
        String containing the Pydantic class definition
    """
    # Handle list of field definitions
    if isinstance(json_data, list):
        fields = []
        for field_def in json_data:
            if len(field_def) >= 3:
                field_name = field_def[0]
                field_type = field_def[1]
                description = field_def[2]
                fields.append((field_name, field_type, description))
            else:
                return "Error: Each field definition should have name, type, and description."
    else:
        return "Error: Expected a list of field definitions."
    
    # Generate class definition
    class_definition = [
        "from pydantic import BaseModel, Field",
        "from typing import List, Optional, Dict, Any, Union\n",
        f"class {class_name}(BaseModel):"
       # "   orginal_data: str = Field(default=None, description=\"Original data from the user\")"
    ]
    
    class_definition.append(f"    original: str = Field(default=None, description=\"original_data\")")
    for field_name, field_type, description in fields:
        # Sanitize field name to be a valid Python identifier
        field_name = re.sub(r'\W|^(?=\d)', '_', field_name)
        
        # Add field with type annotation and Field description
        class_definition.append(f"    {field_name}: {field_type} = Field(default=None, description=\"{description}\")")
    
    return "\n".join(class_definition)

# API 1: Create Schema
@app.route('/api/create-schema', methods=['POST'])
def create_schema():
    try:
        # Get field definitions from request
        json_data = request.json.get('field_definitions', [])
        class_name = request.json.get('class_name', 'SingleData')
        
        if not json_data:
            return jsonify({"error": "No field definitions provided"}), 400
        
        # Generate Pydantic model
        pydantic_class_code = json_to_pydantic_model(json_data, class_name)
        
        # Generate wrapper class
        wrapper_class_code = f"class Final_data(BaseModel):\n    list_data: List[{class_name}] = Field(description=\"List of Objects of given data\")"
        
        # Execute the generated code to define the classes
        exec(pydantic_class_code, globals())
        exec(wrapper_class_code, globals())
        
        # Create structured output model
        globals()['strut_llm'] = Model_vision.with_structured_output(globals()['Final_data'])
        print(wrapper_class_code)
        
        return jsonify({
            "status": "success",
            "model_code": pydantic_class_code,
            "wrapper_code": wrapper_class_code,
            "message": "Schema created successfully and model initialized"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API 2: Process Data
@app.route('/api/process-data', methods=['POST'])
def process_data():
    try:
        # Get text data from request
        text_data = request.json.get('text', '')
        chunk_size = request.json.get('chunk_size', 1000)
        chunk_overlap = request.json.get('chunk_overlap', 100)
        
        if not text_data:
            return jsonify({"error": "No text data provided"}), 400
        
        if 'strut_llm' not in globals():
            return jsonify({"error": "Model not initialized. Please create schema first."}), 400
        
        # Split the text
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap
        )
        split_data = splitter.split_text(text_data)
        
        # Process each chunk
        final_result = []
        for data in split_data:
            result = globals()['strut_llm'].invoke(data)
            final_result.append(result)
        
        # Extract and flatten list_data
        information = [result.list_data for result in final_result]
        flattened_list = reduce(lambda x, y: x + y, information) if information else []
        
        # Convert to dictionary for JSON response
        results = [item.model_dump() for item in flattened_list]
        
        return jsonify({
            "status": "success",
            "results": results,
            "total_items": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API 3: Export Results to CSV
@app.route('/api/export-csv', methods=['POST'])
def export_csv():
    try:
        # Get data from request
        data = request.json.get('data', [])
        
        if not data:
            return jsonify({"error": "No data provided for export"}), 400
        
        # Create CSV in memory
        output = io.StringIO()
        
        # Get field names from first item
        if len(data) > 0:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
            # Create response with CSV file
            csv_data = output.getvalue()
            return Response(
                csv_data,
                mimetype="text/csv",
                headers={"Content-disposition": "attachment; filename=results.csv"}
            )
        else:
            return jsonify({"error": "Empty data set cannot be exported"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model": model_name})

# Main entry point
if __name__ == '__main__':
    app.run(debug=True, port=5000)