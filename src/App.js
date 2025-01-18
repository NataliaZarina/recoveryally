import React, { useState, useEffect } from 'react';
// Import icons from lucide-react library
import { Home, Plus, FileText, ChevronRight, ArrowLeft, Camera, X } from 'lucide-react';

// ============================================================
// CUSTOMIZATION SECTION - Modify these values as needed
// ============================================================

// Depreciation rates for different item categories
// You can add new categories or modify the rates and max depreciation
const depreciationRates = {
  'Electronics': { rate: 0.25, maxDepreciation: 0.8 },    // 25% per year, max 80%
  'Furniture': { rate: 0.1, maxDepreciation: 0.7 },      // 10% per year, max 70%
  'Clothing': { rate: 0.2, maxDepreciation: 0.9 },       // 20% per year, max 90%
  'Appliances': { rate: 0.1, maxDepreciation: 0.8 },     // 10% per year, max 80%
  'Art': { rate: 0.05, maxDepreciation: 0.5 },           // 5% per year, max 50%
  'Jewelry': { rate: 0.05, maxDepreciation: 0.5 },       // 5% per year, max 50%
  'Equipment': { rate: 0.15, maxDepreciation: 0.8 },     // 15% per year, max 80%
  'Other': { rate: 0.15, maxDepreciation: 0.7 }          // 15% per year, max 70%
  // Add more categories here as needed
};

// Room templates with common items
// You can modify these templates or add new ones
const roomTemplates = {
  'Living Room': {
    'Furniture': [
      { name: 'Sofa', category: 'Furniture', typical_value: 1200 },
      { name: 'Armchairs', category: 'Furniture', typical_value: 800 },
      { name: 'Coffee Table', category: 'Furniture', typical_value: 400 },
      { name: 'TV Stand', category: 'Furniture', typical_value: 600 },
      { name: 'Bookshelves', category: 'Furniture', typical_value: 300 }
      // Add more furniture items here
    ],
    'Electronics': [
      { name: 'TV', category: 'Electronics', typical_value: 1000 },
      { name: 'Sound System', category: 'Electronics', typical_value: 500 },
      { name: 'Gaming Console', category: 'Electronics', typical_value: 400 }      // Add more electronics items here
    ],
    'Decor': [
      { name: 'Area Rug', category: 'Decor', typical_value: 400 },
      { name: 'Curtains', category: 'Decor', typical_value: 200 },
      { name: 'Art/Pictures', category: 'Art', typical_value: 300 }
    ]
  },
  'Kitchen': {
    'Appliances': [
      { name: 'Refrigerator', category: 'Appliances', typical_value: 2000 },
      { name: 'Stove', category: 'Appliances', typical_value: 1200 },
      { name: 'Dishwasher', category: 'Appliances', typical_value: 800 },
      { name: 'Microwave', category: 'Appliances', typical_value: 300 }
    ],
    'Small Appliances': [
      { name: 'Coffee Maker', category: 'Appliances', typical_value: 100 },
      { name: 'Toaster', category: 'Appliances', typical_value: 50 },
      { name: 'Blender', category: 'Appliances', typical_value: 100 },
      { name: 'Food Processor', category: 'Appliances', typical_value: 150 }
    ],
    'Kitchen Items': [
      { name: 'Cookware Set', category: 'Kitchen', typical_value: 400 },
      { name: 'Dinnerware Set', category: 'Kitchen', typical_value: 300 },
      { name: 'Utensils', category: 'Kitchen', typical_value: 200 }
    ]
  },
  'Bedroom': {
    'Furniture': [
      { name: 'Bed Frame', category: 'Furniture', typical_value: 800 },
      { name: 'Mattress', category: 'Furniture', typical_value: 1000 },
      { name: 'Dresser', category: 'Furniture', typical_value: 600 },
      { name: 'Nightstands', category: 'Furniture', typical_value: 300 }
    ],
    'Electronics': [
      { name: 'TV', category: 'Electronics', typical_value: 500 },
      { name: 'Lamps', category: 'Electronics', typical_value: 100 }
    ],
    'Personal Items': [
      { name: 'Clothing', category: 'Clothing', typical_value: 2000 },
      { name: 'Jewelry', category: 'Jewelry', typical_value: 1000 }
    ]
  }
  // Add more rooms as needed
};

// ============================================================
// Main App Component
// ============================================================

const App = () => {
  // === STATE MANAGEMENT ===
  // These control what data is stored in the app
  
  // Controls which screen is shown to the user
  const [view, setView] = useState('onboarding');
  
  // Stores all inventory items with localStorage backup
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('recoveryItems');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Tracks which room is currently being viewed/edited
  const [currentRoom, setCurrentRoom] = useState(null);
  
  // Tracks which item is being edited (if any)
  const [editingItemId, setEditingItemId] = useState(null);
  
  // Stores search input for filtering items
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tracks which room template is selected

  // === AUTO-SAVE FUNCTIONALITY ===
  // Automatically saves items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recoveryItems', JSON.stringify(items));
  }, [items]);

  // === HELPER FUNCTIONS ===
  
  // Calculates depreciated value based on item age and category
  const calculateDepreciatedValue = (originalValue, purchaseYear, category) => {
    const yearsOld = new Date().getFullYear() - purchaseYear;
    const { rate, maxDepreciation } = depreciationRates[category] || depreciationRates['Other'];
    const depreciation = Math.min(rate * yearsOld, maxDepreciation);
    return Math.round(originalValue * (1 - depreciation));
  };

  // Handles selecting a room template and creating initial items
  const handleTemplateSelect = (templateName) => {
    setSelectedTemplate(templateName);
    const templateItems = [];
    
    // Create items from template
    Object.entries(roomTemplates[templateName]).forEach(([category, items]) => {
      items.forEach(item => {
        templateItems.push({
          ...item,
          id: crypto.randomUUID(),  // Generate unique ID
          room: templateName,
          purchaseYear: new Date().getFullYear(),
          originalValue: item.typical_value,
          estimatedValue: item.typical_value,
          photos: [],
          receipts: []
        });
      });
    });
    
    // Add template items to inventory
    setItems(prev => [...prev, ...templateItems]);
    setCurrentRoom(templateName);
    setView('room');
  };

  // === ITEM MANAGEMENT FUNCTIONS ===
  
  // Opens item edit screen
  const handleEditItem = (itemId) => {
    setEditingItemId(itemId);
    setView('editItem');
  };

  // Saves new or edited item
  const handleSaveItem = (editedItem) => {
    setItems(prev => {
      if (editingItemId) {
        // Update existing item
        return prev.map(item => 
          item.id === editingItemId ? { ...editedItem, id: editingItemId } : item
        );
      }
      // Add new item
      return [...prev, { ...editedItem, id: crypto.randomUUID() }];
    });
    setEditingItemId(null);
    setView('room');
  };

  // === EXPORT FUNCTIONALITY ===
  // Creates and downloads inventory JSON file
  const exportInventory = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalValue: items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0),
      items: items.map(item => ({
        ...item,
        photos: item.photos ? item.photos.length : 0,
        receipts: item.receipts ? item.receipts.length : 0
      }))
    };

    // Create and trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === VIEW RENDERING ===
  // Controls what is shown on screen based on current view state
  const renderView = () => {
    switch (view) {
      case 'onboarding':
        return (
          <div className="min-h-screen bg-white p-4">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Header Section */}
              <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                  <Home className="w-8 h-8 mr-2 text-blue-600" />
                    <h1 className="text-4xl font-bold text-blue-600">RecoveryAlly</h1>
              </div>
                <p className="text-xl text-gray-600">
                  We'll help you document your losses for insurance claims.
                </p>
              </div>

              {/* Features Overview */}
              <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                <h2 className="font-semibold text-lg">How This Tool Helps:</h2>
                <div className="grid gap-3">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <div>
                      <h3 className="font-medium">Room-by-Room Inventory</h3>
                      <p className="text-gray-600 text-sm">Organize items by room for thorough documentation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <div>
                      <h3 className="font-medium">Smart Value Calculator</h3>
                      <p className="text-gray-600 text-sm">Automatically estimates current values based on purchase date</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <div>
                      <h3 className="font-medium">Photo & Receipt Storage</h3>
                      <p className="text-gray-600 text-sm">Keep all your documentation in one place</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <div>
                      <h3 className="font-medium">Export for Claims</h3>
                      <p className="text-gray-600 text-sm">Generate detailed reports for insurance companies</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">Select a Room to Begin:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(roomTemplates).map(room => (
                    <button
                      key={room}
                      onClick={() => handleTemplateSelect(room)}
                      className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-blue-600">{room}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {Object.keys(roomTemplates[room]).length} categories of items
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Existing Inventory Button */}
              {items.length > 0 && (
                <div className="pt-4">
                  <button
                    onClick={() => setView('inventory')}
                    className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>View Existing Inventory ({items.length} items)</span>
                  </button>
                </div>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500">
                <p>Your data is saved automatically and stored locally on your device.</p>
                <p>Use the export feature to save your inventory externally.</p>
              </div>
            </div>
          </div>
        );

        case 'inventory':
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setView('onboarding')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Back
                  </button>
                  <h2 className="text-xl font-semibold">Complete Inventory</h2>
                  <button
                    onClick={exportInventory}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-5 h-5 mr-1" />
                    Export
                  </button>
                </div>
  
                {/* Search Bar */}
                <div className="mb-6">
                  <input
                    type="search"
                    placeholder="Search items by name, category, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
  
                {/* Inventory Stats */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-xl font-medium">{items.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-xl font-medium">
                        ${items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
  
                {/* Items List */}
                <div className="space-y-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No items found. Try a different search term or add new items.
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleEditItem(item.id)}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              {item.room} • {item.category}
                            </p>
                            {item.purchaseYear && (
                              <p className="text-sm text-gray-500">
                                Purchased: {item.purchaseYear}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-blue-600">
                              ${item.estimatedValue || item.originalValue}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-1">
                              {item.photos?.length > 0 && (
                                <div className="text-xs text-gray-400 flex items-center">
                                  <Camera className="w-3 h-3 mr-1" />
                                  {item.photos.length}
                                </div>
                              )}
                              {item.receipts?.length > 0 && (
                                <div className="text-xs text-gray-400 flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {item.receipts.length}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
  
                {/* Add Item Button */}
                <button
                  onClick={() => {
                    setEditingItemId(null);
                    setView('editItem');
                  }}
                  className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          );

          case 'editItem':
            const itemToEdit = editingItemId 
              ? items.find(item => item.id === editingItemId)
              : { 
                  name: '', 
                  category: '', 
                  room: currentRoom || '',
                  photos: [],
                  receipts: [],
                  purchaseYear: new Date().getFullYear(),
                  originalValue: 0,
                  estimatedValue: 0
                };
    
            return (
              <div className="min-h-screen bg-white p-4">
                <div className="max-w-2xl mx-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setView(editingItemId ? 'inventory' : 'room')}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ArrowLeft className="w-5 h-5 mr-1" />
                      Back
                    </button>
                    <h2 className="text-xl font-semibold">
                      {editingItemId ? 'Edit Item' : 'Add New Item'}
                    </h2>
                    <div className="w-20"></div>
                  </div>
    
                  {/* Item Edit Form */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Item Name*</label>
                      <input
                        type="text"
                        required
                        value={itemToEdit.name}
                        onChange={(e) => {
                          const updatedItem = { ...itemToEdit, name: e.target.value };
                          setEditingItemId(prev => prev ? prev : null);
                          handleSaveItem(updatedItem);
                        }}
                        className="w-full p-3 border rounded-lg"
                        placeholder="Enter item name"
                      />
                    </div>
    
                    {/* Category and Room */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Category*</label>
                        <select
                          required
                          value={itemToEdit.category}
                          onChange={(e) => {
                            const updatedItem = { ...itemToEdit, category: e.target.value };
                            setEditingItemId(prev => prev ? prev : null);
                            handleSaveItem(updatedItem);
                          }}
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="">Select Category</option>
                          {Object.keys(depreciationRates).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Room*</label>
                        <select
                          required
                          value={itemToEdit.room}
                          onChange={(e) => {
                            const updatedItem = { ...itemToEdit, room: e.target.value };
                            setEditingItemId(prev => prev ? prev : null);
                            handleSaveItem(updatedItem);
                          }}
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="">Select Room</option>
                          {Object.keys(roomTemplates).map(room => (
                            <option key={room} value={room}>{room}</option>
                          ))}
                        </select>
                      </div>
                    </div>
    
                    {/* Value Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Purchase Year</label>
                        <input
                          type="number"
                          value={itemToEdit.purchaseYear}
                          onChange={(e) => {
                            const updatedItem = {
                              ...itemToEdit,
                              purchaseYear: parseInt(e.target.value),
                              estimatedValue: calculateDepreciatedValue(
                                itemToEdit.originalValue,
                                parseInt(e.target.value),
                                itemToEdit.category
                              )
                            };
                            setEditingItemId(prev => prev ? prev : null);
                            handleSaveItem(updatedItem);
                          }}
                          max={new Date().getFullYear()}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Original Value ($)</label>
                        <input
                          type="number"
                          value={itemToEdit.originalValue}
                          onChange={(e) => {
                            const updatedItem = {
                              ...itemToEdit,
                              originalValue: parseInt(e.target.value),
                              estimatedValue: calculateDepreciatedValue(
                                parseInt(e.target.value),
                                itemToEdit.purchaseYear,
                                itemToEdit.category
                              )
                            };
                            setEditingItemId(prev => prev ? prev : null);
                            handleSaveItem(updatedItem);
                          }}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                    </div>
    
                    {/* Current Value */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Estimated Current Value: ${itemToEdit.estimatedValue}
                      </label>
                      <input
                        type="range"
                        value={itemToEdit.estimatedValue}
                        onChange={(e) => {
                          const updatedItem = {
                            ...itemToEdit,
                            estimatedValue: parseInt(e.target.value)
                          };
                          setEditingItemId(prev => prev ? prev : null);
                          handleSaveItem(updatedItem);
                        }}
                        min={Math.max(1, Math.floor(itemToEdit.originalValue * 0.1))}
                        max={Math.ceil(itemToEdit.originalValue * 1.2)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>${Math.max(1, Math.floor(itemToEdit.originalValue * 0.1))}</span>
                        <span>${Math.ceil(itemToEdit.originalValue * 1.2)}</span>
                      </div>
                    </div>
    
                    {/* Photo Upload */}
                    <div>
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                       Photos
                    </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {itemToEdit.photos?.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo.data}
                              alt={`Item ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedItem = {
                                  ...itemToEdit,
                                  photos: itemToEdit.photos.filter((_, i) => i !== index)
                                };
                                setEditingItemId(prev => prev ? prev : null);
                                handleSaveItem(updatedItem);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          const newPhotos = await Promise.all(
                            files.map(file =>
                              new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve({
                                  name: file.name,
                                  type: file.type,
                                  data: reader.result,
                                  uploadDate: new Date().toISOString()
                                });
                                reader.readAsDataURL(file);
                              })
                            )
                          );
    
                          const updatedItem = {
                            ...itemToEdit,
                            photos: [...(itemToEdit.photos || []), ...newPhotos]
                          };
                          setEditingItemId(prev => prev ? prev : null);
                          handleSaveItem(updatedItem);
                        }}
                        className="w-full"
                      />
                    </div>
    
                    {/* Receipt Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Receipts/Documents</label>
                      <div className="space-y-2 mb-2">
                        {itemToEdit.receipts?.map((receipt, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{receipt.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedItem = {
                                  ...itemToEdit,
                                  receipts: itemToEdit.receipts.filter((_, i) => i !== index)
                                };
                                setEditingItemId(prev => prev ? prev : null);
                                handleSaveItem(updatedItem);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          const newReceipts = await Promise.all(
                            files.map(file =>
                              new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve({
                                  name: file.name,
                                  type: file.type,
                                  data: reader.result,
                                  uploadDate: new Date().toISOString()
                                });
                                reader.readAsDataURL(file);
                              })
                            )
                          );
    
                          const updatedItem = {
                            ...itemToEdit,
                            receipts: [...(itemToEdit.receipts || []), ...newReceipts]
                          };
                          setEditingItemId(prev => prev ? prev : null);
                          handleSaveItem(updatedItem);
                        }}
                        className="w-full"
                      />
                    </div>
    
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <textarea
                        value={itemToEdit.notes || ''}
                        onChange={(e) => {
                          const updatedItem = {
                            ...itemToEdit,
                            notes: e.target.value
                          };
                          setEditingItemId(prev => prev ? prev : null);
                          handleSaveItem(updatedItem);
                        }}
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                        placeholder="Add any additional details about the item..."
                      />
                    </div>
    
                    {/* Delete Button (only show for existing items) */}
                    {editingItemId && (
                      <button
                        onClick={() => {
                          setItems(prev => prev.filter(item => item.id !== editingItemId));
                          setEditingItemId(null);
                          setView('inventory');
                        }}
                        className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );

      case 'room':
        // Get items for current room
        const roomItems = items.filter(item => item.room === currentRoom);
        
        return (
          <div className="min-h-screen bg-white p-4">
            <div className="max-w-2xl mx-auto">
              {/* Header with Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setView('onboarding')}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  Back to Rooms
                </button>
                <h2 className="text-xl font-semibold">{currentRoom}</h2>
                <button
                  onClick={() => setView('inventory')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View All Items
                </button>
              </div>

              {/* Category Sections */}
              <div className="space-y-6">
                {Object.entries(roomTemplates[currentRoom]).map(([category, templateItems]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3">{category}</h3>
                    <div className="space-y-3">
                      {roomItems
                        .filter(item => item.category === category)
                        .map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleEditItem(item.id)}
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                {item.purchaseYear && (
                                  <p className="text-sm text-gray-500">
                                    Purchased: {item.purchaseYear}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-blue-600">
                                  ${item.estimatedValue || item.originalValue}
                                </div>
                                {item.photos?.length > 0 && (
                                  <div className="text-xs text-gray-400 flex items-center justify-end">
                                    <Camera className="w-3 h-3 mr-1" />
                                    {item.photos.length}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                      {/* Add Item Button for Category */}
                      <button
                        onClick={() => {
                          setEditingItemId(null);
                          setView('editItem');
                        }}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add {category} Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Room Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-xl font-medium">{roomItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Value</p>
                    <p className="text-xl font-medium">
                      ${roomItems.reduce((sum, item) => sum + (item.estimatedValue || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Global Add Button */}
              <button
                onClick={() => {
                  setEditingItemId(null);
                  setView('editItem');
                }}
                className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        );

      default:
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-xl font-semibold">Invalid View</h2>
                <button
                  onClick={() => setView('onboarding')}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Go Home
                </button>
              </div>
            </div>
          );
      }
    };        
  
    // Render the current view
    return renderView();
  };
  
  export default App;