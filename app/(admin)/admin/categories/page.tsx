"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FolderTree, Save, X, Eye, EyeOff, ChevronDown, ChevronRight, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  level: number;
  parentId: string | null;
  productCount?: number;
  createdAt: string;
  children?: Category[];
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null as string | null,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    buildHierarchy();
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = () => {
    // Group categories by parentId
    const categoryMap = new Map<string, Category[]>();
    const rootCategories: Category[] = [];

    categories.forEach(category => {
      if (category.parentId === null) {
        rootCategories.push({ ...category, children: [] });
      } else {
        if (!categoryMap.has(category.parentId)) {
          categoryMap.set(category.parentId, []);
        }
        categoryMap.get(category.parentId)!.push({ ...category, children: [] });
      }
    });

    // Build the tree recursively
    const buildTree = (cats: Category[]): Category[] => {
      return cats.map(category => {
        const children = categoryMap.get(category.id) || [];
        return {
          ...category,
          children: buildTree(children.sort((a, b) => a.sortOrder - b.sortOrder))
        };
      }).sort((a, b) => a.sortOrder - b.sortOrder);
    };

    const hierarchy = buildTree(rootCategories);
    setHierarchicalCategories(hierarchy);

    // Auto-expand first level categories
    const firstLevelIds = hierarchy.map(cat => cat.id);
    setExpandedCategories(new Set(firstLevelIds));
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Get categories that can be parents (up to level 2, since max is level 3)
  const getPotentialParents = () => {
    return categories.filter(cat => cat.level <= 2).sort((a, b) => {
      // Sort by level first, then by name
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });
  };

  // Calculate what level the new category would be
  const getNewCategoryLevel = (parentId: string | null) => {
    if (!parentId) return 1; // Root category
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.level + 1 : 1;
  };

  // Format category name with indentation for dropdown
  const formatCategoryForDropdown = (category: Category) => {
    const indent = '  '.repeat(category.level - 1);
    const levelLabel = category.level === 1 ? '[Root]' : category.level === 2 ? '[Main]' : '[Sub]';
    return `${indent}${levelLabel} ${category.name}`;
  };
  const getAllCategoryIds = (cats: Category[]): string[] => {
    const ids: string[] = [];
    cats.forEach(cat => {
      ids.push(cat.id);
      if (cat.children && cat.children.length > 0) {
        ids.push(...getAllCategoryIds(cat.children));
      }
    });
    return ids;
  };

  // Handle individual category selection
  const handleCategorySelect = (categoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (checked) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = getAllCategoryIds(hierarchicalCategories);
      setSelectedCategories(new Set(allIds));
    } else {
      setSelectedCategories(new Set());
    }
  };

  // Check if all categories are selected
  const isAllSelected = () => {
    const allIds = getAllCategoryIds(hierarchicalCategories);
    return allIds.length > 0 && allIds.every(id => selectedCategories.has(id));
  };

  // Check if some (but not all) categories are selected
  const isIndeterminate = () => {
    const allIds = getAllCategoryIds(hierarchicalCategories);
    const selectedCount = allIds.filter(id => selectedCategories.has(id)).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  };

  // Bulk delete functionality
  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return;

    const selectedArray = Array.from(selectedCategories);
    const categoryNames = selectedArray.map(id => 
      categories.find(cat => cat.id === id)?.name
    ).filter(Boolean);

    if (!confirm(
      `Are you sure you want to delete ${selectedCategories.size} categories?\n\n` +
      `Categories to delete:\n${categoryNames.join('\n')}\n\n` +
      `This action cannot be undone.`
    )) return;

    setBulkDeleting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Delete categories one by one to handle individual errors
      for (const categoryId of selectedArray) {
        try {
          const response = await fetch(`/api/categories/${categoryId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            successCount++;
          } else {
            const result = await response.json();
            errorCount++;
            const categoryName = categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
            errors.push(`${categoryName}: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          const categoryName = categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
          errors.push(`${categoryName}: Network error`);
        }
      }

      // Show results
      if (successCount > 0) {
        await fetchCategories(); // Refresh the list
        setSelectedCategories(new Set()); // Clear selection
      }

      if (errorCount === 0) {
        alert(`Successfully deleted ${successCount} categories!`);
      } else {
        alert(
          `Bulk delete completed:\n` +
          `✓ Successfully deleted: ${successCount} categories\n` +
          `✗ Failed to delete: ${errorCount} categories\n\n` +
          `Errors:\n${errors.join('\n')}`
        );
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert('An unexpected error occurred during bulk delete');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    // Validate hierarchy depth
    const newLevel = getNewCategoryLevel(formData.parentId);
    if (newLevel > 3) {
      alert('Maximum category depth is 3 levels (Root → Main → Sub)');
      return;
    }
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      // Prepare data with hierarchy information
      const submitData = {
        ...formData,
        level: newLevel,
        parentId: formData.parentId || null
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      if (result.success || response.ok) {
        fetchCategories();
        resetForm();
        alert(editingCategory ? 'Category updated!' : 'Category created!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId,
      isActive: category.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCategories();
        alert('Category deleted!');
      } else {
        const result = await response.json();
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: null, isActive: true });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  // Render category row with proper indentation and selection
  const renderCategoryRow = (category: Category, level: number = 0): JSX.Element[] => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.has(category.id);
    const indent = level * 24; // 24px per level

    const rows: JSX.Element[] = [];

    // Main category row
    rows.push(
      <tr key={category.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
            {/* Selection checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleCategorySelect(category.id, e.target.checked)}
              className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" /> // Spacer for alignment
            )}
            
            <div className="flex items-center space-x-2">
              {/* Level indicator */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                category.level === 1 ? 'bg-blue-100 text-blue-800' :
                category.level === 2 ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                L{category.level}
              </span>
              
              <div>
                <div className={`text-sm font-medium ${
                  category.level === 1 ? 'text-blue-900 text-lg' :
                  category.level === 2 ? 'text-green-900' :
                  'text-gray-900'
                }`}>
                  {category.name}
                </div>
                {category.description && (
                  <div className="text-sm text-gray-500 max-w-md truncate">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {category.productCount || 0} products
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => toggleActive(category.id, category.isActive)}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {category.isActive ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(category.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="text-blue-600 hover:text-blue-900"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="text-red-600 hover:text-red-900"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );

    // Add children rows if expanded
    if (hasChildren && isExpanded) {
      category.children!.forEach(child => {
        rows.push(...renderCategoryRow(child, level + 1));
      });
    }

    return rows;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-600">Manage your Tesla parts categories and organization</p>
      </div>

      {/* Category Statistics */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">
              {categories.filter(c => c.level === 1).length}
            </div>
            <div className="text-sm text-blue-700">Root Categories</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {categories.filter(c => c.level === 2).length}
            </div>
            <div className="text-sm text-green-700">Main Categories</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {categories.filter(c => c.level === 3).length}
            </div>
            <div className="text-sm text-purple-700">Subcategories</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  <div className="text-2xl font-bold text-gray-900">
    {categories.reduce((sum, c) => sum + (c.directProductCount || 0), 0)}
  </div>
  <div className="text-sm text-gray-700">Total Products</div>
</div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">
            Categories ({categories.length})
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">L1</span>
            <span>Root</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">L2</span>
            <span>Main</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">L3</span>
            <span>Sub</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Bulk Delete Button */}
          {selectedCategories.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedCategories.size} Selected`}
              </span>
            </button>
          )}
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Selection Info */}
      {selectedCategories.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                {selectedCategories.size} categories selected
              </span>
            </div>
            <button
              onClick={() => setSelectedCategories(new Set())}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Model 3 - Interior"
                required
              />
            </div>

            {/* Parent Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root Category (Level 1)</option>
                {getPotentialParents()
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id) // Prevent self-selection
                  .map(cat => (
                    <option 
                      key={cat.id} 
                      value={cat.id}
                      disabled={cat.level >= 3} // Prevent creating level 4+
                    >
                      {formatCategoryForDropdown(cat)}
                    </option>
                  ))}
              </select>
              {formData.parentId && (
                <p className="text-sm text-gray-500 mt-1">
                  This will be a Level {getNewCategoryLevel(formData.parentId)} category
                </p>
              )}
              {!formData.parentId && (
                <p className="text-sm text-gray-500 mt-1">
                  This will be a Root (Level 1) category
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category description..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active category
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingCategory ? 'Update' : 'Create'} Category</span>
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hierarchical Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate();
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Category Hierarchy</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hierarchicalCategories.map(category => 
                renderCategoryRow(category, 0)
              ).flat()}
            </tbody>
          </table>
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first category or use auto-setup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;