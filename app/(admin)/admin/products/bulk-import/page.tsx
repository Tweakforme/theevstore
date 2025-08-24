"use client";

import { useState } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet, Save, Settings, Zap, Trash2, RefreshCw, Car } from "lucide-react";

interface ProductData {
  name?: string;
  sku?: string;
  price?: number;
  description?: string;
  stockQuantity?: number;
  category?: string;
  compatibleModels?: string;
  weight?: number;
  dimensions?: string;
  slug?: string;
  isActive?: boolean;
  trackQuantity?: boolean;
  lowStockThreshold?: number;
  shortDescription?: string;
}

interface PreviewProduct extends ProductData {
  hasErrors?: boolean;
  errors?: string[];
  rowNumber?: number;
}

interface ImportResults {
  total: number;
  successful: number;
  failed: number;
  skippedDuplicates?: number;
  categoriesCreated?: string[];
  detectedModel?: string;
  message?: string;
  errors: Array<{
    row: number;
    sku?: string;
    message: string;
  }>;
}

const BulkImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ProductData[]>([]);
  const [preview, setPreview] = useState<PreviewProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
  const [setupStatus, setSetupStatus] = useState<string>('');
  const [cleanupStatus, setCleanupStatus] = useState<string>('');
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  // New state for Tesla model detection
  const [detectedModel, setDetectedModel] = useState<string>('');
  const [manualModelOverride, setManualModelOverride] = useState<string>('');

  const teslaModels = [
    { value: 'MODEL_3', label: 'Model 3', color: 'bg-blue-500', bgClass: 'bg-blue-100', textClass: 'text-blue-800' },
    { value: 'MODEL_Y', label: 'Model Y', color: 'bg-green-500', bgClass: 'bg-green-100', textClass: 'text-green-800' },
    { value: 'MODEL_S', label: 'Model S', color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-800' },
    { value: 'MODEL_X', label: 'Model X', color: 'bg-purple-500', bgClass: 'bg-purple-100', textClass: 'text-purple-800' },
  ];

  const getCurrentModel = () => manualModelOverride || detectedModel || 'MODEL_3';

  const getModelStyle = (modelValue: string) => {
    const model = teslaModels.find(m => m.value === modelValue);
    return model || teslaModels[0];
  };

  // Clean All Categories Function
  const handleCleanCategories = async () => {
    const confirmMessage = 'This will DELETE ALL existing categories. Are you sure?';
    
    if (!confirm(confirmMessage)) return;

    // Double confirmation
    const doubleConfirm = prompt(
      'Type "DELETE ALL CATEGORIES" to confirm this action:'
    );
    
    if (doubleConfirm !== 'DELETE ALL CATEGORIES') {
      alert('Cleanup cancelled - confirmation text did not match');
      return;
    }

    setIsCleaningUp(true);
    setCleanupStatus('Deleting all categories...');

    try {
      const response = await fetch('/api/categories/clean-all', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCleanupStatus(`✅ ${result.message}`);
      } else {
        setCleanupStatus(`❌ Error: ${result.error}`);
        if (result.suggestion) {
          setCleanupStatus(prev => prev + `\n💡 ${result.suggestion}`);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      setCleanupStatus('❌ Failed to clean categories');
    } finally {
      setIsCleaningUp(false);
      setTimeout(() => setCleanupStatus(''), 8000);
    }
  };

  // Tesla Auto-Setup Function
  const handleTeslaAutoSetup = async () => {
    if (!confirm('This will create all Tesla Model 3 & Y categories. Continue?')) return;
    
    setIsProcessing(true);
    setSetupStatus('Setting up Tesla categories...');

    try {
      const response = await fetch('/api/categories/tesla-auto-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Uses default hierarchy
      });

      const result = await response.json();

      if (result.success) {
        setSetupStatus(`✅ ${result.message}`);
        setTimeout(() => setSetupStatus(''), 5000);
      } else {
        setSetupStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Tesla setup error:', error);
      setSetupStatus('❌ Failed to setup Tesla categories');
    } finally {
      setIsProcessing(false);
    }
  };

  // Combined Clean & Setup Function
  const handleCleanAndSetup = async () => {
    const confirmMessage = 'This will DELETE ALL categories and create the new Tesla structure. Continue?';
    
    if (!confirm(confirmMessage)) return;

    setIsCleaningUp(true);
    setIsProcessing(true);
    
    try {
      // Step 1: Clean existing categories
      setCleanupStatus('🧹 Step 1: Cleaning existing categories...');
      
      const cleanResponse = await fetch('/api/categories/clean-all', {
        method: 'DELETE',
      });

      const cleanResult = await cleanResponse.json();
      
      if (!cleanResult.success && !cleanResult.message?.includes('No categories')) {
        throw new Error(cleanResult.error || 'Failed to clean categories');
      }

      // Step 2: Setup Tesla categories
      setCleanupStatus('🏗️ Step 2: Setting up Tesla categories...');
      
      const setupResponse = await fetch('/api/categories/tesla-auto-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const setupResult = await setupResponse.json();

      if (setupResult.success) {
        setCleanupStatus(`🎉 Complete! ${setupResult.message}`);
      } else {
        setCleanupStatus(`❌ Setup failed: ${setupResult.error}`);
      }

    } catch (error) {
      console.error('Clean & setup error:', error);
      setCleanupStatus(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCleaningUp(false);
      setIsProcessing(false);
      setTimeout(() => setCleanupStatus(''), 10000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/products/bulk-import/preview', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImportData(result.data);
        setPreview(result.preview);
        setDetectedModel(result.detectedModel || 'MODEL_3'); // Set detected model
        setStep(2);
      } else {
        alert('Error processing file: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);

    try {
      // Update the import data with the current model selection
      const updatedData = importData.map(product => ({
        ...product,
        compatibleModels: getCurrentModel()
      }));

      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: updatedData,
          detectedModel: getCurrentModel()
        }),
      });

      const result = await response.json();
      setImportResults(result);
      setStep(3);
    } catch (error) {
      console.error('Error importing products:', error);
      alert('Error importing products');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const currentModel = getCurrentModel() || 'MODEL_3';
    const modelName = currentModel.replace('_', ' ');
    
    const templateData = [
      ['title', 'sku', 'oe_number', 'price_1pc', 'main_category', 'subcategory', 'weight', 'dimensions'],
      [`${modelName} Front Bumper (With Sensor Hole)`, `BN-TE-${currentModel.split('_')[1][0]}-0004`, '1084168-SO-5-E', '44', `${modelName} - BODY`, `${currentModel.replace('_', '')} 1001 - Bumper and Fascia`, '5.2', '185*58*45'],
      [`${modelName} Door Handle Left`, `DH-TE-${currentModel.split('_')[1][0]}-0001`, '1077730-00-C', '29.99', `${modelName} - EXTERIOR`, `${currentModel.replace('_', '')} 2001 - Door Components`, '0.5', '15*8*3']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tesla-${currentModel.toLowerCase()}-import-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setImportData([]);
    setPreview([]);
    setImportResults(null);
    setDetectedModel('');
    setManualModelOverride('');
    setStep(1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Enhanced Header with Category Management */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tesla Parts Management</h1>
            <p className="text-gray-600">Setup categories and import Tesla parts with smart model detection</p>
          </div>
          
          {/* Category Management Panel */}
          <div className="bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h3 className="font-medium text-gray-900 mb-3">Category Management</h3>
            
            {/* Clean Categories */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-red-700">Clean Categories</p>
                <p className="text-xs text-red-600">Delete all existing categories</p>
              </div>
              <button
                onClick={handleCleanCategories}
                disabled={isCleaningUp || isProcessing}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clean</span>
              </button>
            </div>

            {/* Setup Categories */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-blue-700">Setup Tesla Categories</p>
                <p className="text-xs text-blue-600">Create Model 3 & Y structure</p>
              </div>
              <button
                onClick={handleTeslaAutoSetup}
                disabled={isProcessing || isCleaningUp}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <Settings className="h-3 w-3" />
                <span>Setup</span>
              </button>
            </div>

            {/* Combined Clean & Setup */}
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={handleCleanAndSetup}
                disabled={isProcessing || isCleaningUp}
                className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clean & Setup Fresh</span>
              </button>
            </div>

            {/* Status Display */}
            {(setupStatus || cleanupStatus) && (
              <div className="mt-3 p-2 bg-white border rounded text-xs">
                <div className="font-medium text-blue-700 whitespace-pre-line">
                  {setupStatus || cleanupStatus}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium">Upload File</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium">Preview & Configure</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium">Import Results</span>
          </div>
        </div>
      </div>

      {/* Step 1: File Upload */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="h-6 w-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900">Download Template</h3>
                <p className="text-blue-700 mb-4">
                  Download our Excel template for Tesla parts import. The system will auto-detect which model based on your filename.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Your Excel File</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="bulk-upload"
                disabled={isProcessing}
              />
              <label htmlFor="bulk-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Excel (.xlsx, .xls) or CSV files up to 10MB
                </p>
              </label>
              
              {isProcessing && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Processing file and detecting Tesla model...</p>
                </div>
              )}
            </div>

            {/* File naming hint */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">💡 Smart Model Detection Tips</h4>
              <p className="text-sm text-amber-700 mb-2">Name your files for automatic detection:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-amber-700">
                <div><strong>model3</strong>, <strong>model_3</strong>, <strong>m3</strong> → Model 3</div>
                <div><strong>modely</strong>, <strong>model_y</strong>, <strong>my</strong> → Model Y</div>
                <div><strong>models</strong>, <strong>model_s</strong>, <strong>ms</strong> → Model S</div>
                <div><strong>modelx</strong>, <strong>model_x</strong>, <strong>mx</strong> → Model X</div>
              </div>
            </div>

            {/* Supported Columns */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Expected Excel Format</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-medium">title:</span> Product name</div>
                <div><span className="font-medium">sku:</span> Product SKU</div>
                <div><span className="font-medium">oe_number:</span> OE part number</div>
                <div><span className="font-medium">price_1pc:</span> Price per piece (CAD)</div>
                <div><span className="font-medium">main_category:</span> Main category</div>
                <div><span className="font-medium">subcategory:</span> Subcategory</div>
                <div><span className="font-medium">weight:</span> Weight in kg</div>
                <div><span className="font-medium">dimensions:</span> Dimensions (L*W*H)</div>
                <div><span className="font-medium">unit_packing:</span> Packing info</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Configure */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Model Detection & Override */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Car className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Tesla Model Detection</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Auto-detected:</strong> <span className="font-medium text-blue-600">{detectedModel.replace('_', ' ')}</span> 
                {file && <span className="text-gray-500"> (from filename: {file.name})</span>}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {teslaModels.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => setManualModelOverride(manualModelOverride === model.value ? '' : model.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      getCurrentModel() === model.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${model.color} mx-auto mb-2`}></div>
                    <div className="text-sm font-medium">{model.label}</div>
                    {getCurrentModel() === model.value && (
                      <div className="text-xs text-blue-600 mt-1">Selected</div>
                    )}
                  </button>
                ))}
              </div>
              
              {manualModelOverride && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                  <strong>Manual Override:</strong> You've manually selected {manualModelOverride.replace('_', ' ')}. 
                  This will override the auto-detection.
                </div>
              )}
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Preview Import Data ({importData.length} products for {getCurrentModel().replace('_', ' ')})
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={resetImport}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleImport}
                  disabled={isProcessing || importData.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isProcessing ? 'Importing...' : `Import for ${getCurrentModel().replace('_', ' ')}`}</span>
                </button>
              </div>
            </div>

            {/* Model Info Banner */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Ready to import:</strong> All products will be tagged as compatible with <strong>{getCurrentModel().replace('_', ' ')}</strong>
              </p>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tesla Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(0, 10).map((product, index) => {
                    const modelStyle = getModelStyle(getCurrentModel());
                    return (
                      <tr key={index} className={product.hasErrors ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={product.name}>
                            {product.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {product.sku || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price || 0} CAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stockQuantity || 10}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={product.category}>
                            {product.category || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${modelStyle.bgClass} ${modelStyle.textClass}`}>
                            {getCurrentModel().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.hasErrors ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Error
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {preview.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing first 10 of {preview.length} products
                </div>
              )}
            </div>

            {/* Error Summary */}
            {preview.filter(p => p.hasErrors).length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">
                  Found {preview.filter(p => p.hasErrors).length} products with errors:
                </h4>
                <div className="space-y-1 text-sm text-red-700">
                  {preview.filter(p => p.hasErrors).slice(0, 5).map((product, index) => (
                    <div key={index}>
                      <strong>Row {product.rowNumber}:</strong> {product.errors?.join(', ')}
                    </div>
                  ))}
                  {preview.filter(p => p.hasErrors).length > 5 && (
                    <div className="text-red-600">
                      ...and {preview.filter(p => p.hasErrors).length - 5} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && importResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Import Results</h3>
            </div>

            {/* Success Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                <div className="text-sm text-green-700">Products Imported</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importResults.categoriesCreated?.length || 0}</div>
                <div className="text-sm text-blue-700">Categories Created</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{importResults.detectedModel?.replace('_', ' ') || 'N/A'}</div>
                <div className="text-sm text-purple-700">Tesla Model</div>
              </div>
            </div>

            {/* Success Message */}
            {importResults.message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <p className="text-green-800">{importResults.message}</p>
              </div>
            )}

            {/* Categories Created */}
            {importResults.categoriesCreated && importResults.categoriesCreated.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-purple-900 mb-3">New Categories Created</h4>
                <div className="flex flex-wrap gap-2">
                  {importResults.categoriesCreated.map((category, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-red-900 mb-3">Import Errors:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                      <strong>Row {error.row} ({error.sku}):</strong> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import More Products
              </button>
              <button
                onClick={() => window.location.href = '/admin/products'}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                View All Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportPage;