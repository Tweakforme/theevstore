"use client";

import { useState } from "react";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet, Save } from "lucide-react";

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
      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: importData }),
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
    const templateData = [
      ['title', 'sku', 'oe_number', 'price_1pc', 'main_category', 'subcategory', 'weight', 'dimensions'],
      ['MODEL 3 Front Bumper (With Sensor Hole)', 'BN-TE-3-0004', '1084168-SO-5-E', '44', 'Model 3 - BODY', 'M3 1001 - Bumper and Fascia', '5.2', '185*58*45'],
      ['MODEL 3 Door Handle Left', 'DH-TE-3-0001', '1077730-00-C', '29.99', 'Model 3 - EXTERIOR', 'M3 2001 - Door Components', '0.5', '15*8*3']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tesla-model3-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setImportData([]);
    setPreview([]);
    setImportResults(null);
    setStep(1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import Products</h1>
        <p className="text-gray-600">Import multiple Tesla parts from Excel or CSV files</p>
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
            <span className="font-medium">Preview & Validate</span>
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
                  Download our Excel template to ensure your data is formatted correctly for import.
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Your File</h3>
            
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
                  <p className="text-sm text-gray-600 mt-2">Processing file...</p>
                </div>
              )}
            </div>

            {/* Supported Columns */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Your Excel Columns (Model 3 Format)</h4>
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
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Note:</strong> Your Excel file format is already detected! All Model 3 products will be automatically tagged as MODEL_3 compatible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Preview Import Data ({importData.length} products)
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
                  <span>{isProcessing ? 'Importing...' : 'Import Products'}</span>
                </button>
              </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(0, 10).map((product, index) => (
                    <tr key={index} className={product.hasErrors ? 'bg-red-50' : ''}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.weight ? `${product.weight}kg` : '-'}
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
                            Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.length > 10 && (
              <p className="text-sm text-gray-500 mt-4">
                Showing first 10 of {preview.length} products. All products will be imported.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && importResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Import Results</h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">{importResults.successful || 0}</p>
                    <p className="text-sm text-green-700">Products Imported</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-900">{importResults.failed || 0}</p>
                    <p className="text-sm text-red-700">Failed Imports</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{importResults.total || 0}</p>
                    <p className="text-sm text-blue-700">Total Processed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-900 mb-3">Import Errors</h4>
                <div className="space-y-2">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <span className="font-medium">Row {error.row}:</span> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import Another File
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