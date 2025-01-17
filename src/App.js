import React, { useState, useEffect } from 'react';
import { Home, Plus, FileText, ChevronRight, X, Info } from 'lucide-react';

const App = () => {
  // State management
  const [view, setView] = useState('onboarding');
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('recoveryItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentRoom, setCurrentRoom] = useState(null);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recoveryItems', JSON.stringify(items));
  }, [items]);

  // Predefined room types
  const rooms = [
    'Living Room',
    'Kitchen',
    'Master Bedroom',
    'Bedrooms',
    'Bathrooms',
    'Garage',
    'Dining Room',
    'Office',
    'Other'
  ];

  // Common item categories
  const categories = [
    'Furniture',
    'Electronics',
    'Appliances',
    'Clothing',
    'Jewelry & Watches',
    'Art & Decor',
    'Tools & Equipment',
    'Other'
  ];

  // Onboarding view
  const OnboardingView = () => (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">RecoveryAlly</h1>
          <p className="text-gray-600">
            We'll help you document everything you lost, room by room, 
            to make your insurance claim easier.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Quick Tips:</h2>
          <ul className="space-y-2 text-sm">
            <li>• Take it one room at a time</li>
            <li>• List everything you can remember</li>
            <li>• Include rough value estimates</li>
            <li>• Export your list regularly</li>
          </ul>
        </div>

        <button
          onClick={() => setView('rooms')}
          className="w-full bg-blue-500 text-white rounded-lg p-4"
        >
          Start Room-by-Room List
        </button>
      </div>
    </div>
  );

  // Room list view
  const RoomListView = () => (
    <div className="p-4 space-y-2">
      {rooms.map(room => {
        const roomItems = items.filter(item => item.room === room);
        const roomTotal = roomItems.reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0);
        
        return (
          <button
            key={room}
            onClick={() => {
              setCurrentRoom(room);
              setView('room-items');
            }}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <div>
              <h3 className="font-medium">{room}</h3>
              <p className="text-sm text-gray-500">
                {roomItems.length} items · ${roomTotal.toLocaleString()}
              </p>
            </div>
            <ChevronRight className="text-gray-400" />
          </button>
        );
      })}
    </div>
  );

  // Room items view
  const RoomItemsView = () => {
    const roomItems = items.filter(item => item.room === currentRoom);

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentRoom}</h2>
          <button
            onClick={() => setView('add-item')}
            className="p-2 bg-blue-500 text-white rounded-lg"
          >
            <Plus />
          </button>
        </div>

        <div className="space-y-2">
          {roomItems.map(item => (
            <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex justify-between">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">
                  ${Number(item.estimatedValue).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-500">{item.category}</p>
              {item.notes && (
                <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Add item view
  const AddItemView = () => {
    const [itemData, setItemData] = useState({
      name: '',
      room: currentRoom,
      category: categories[0],
      estimatedValue: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      setItems(prev => [...prev, { ...itemData, id: Date.now() }]);
      setView('room-items');
    };

    return (
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name*</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={itemData.name}
              onChange={e => setItemData({ ...itemData, name: e.target.value })}
              placeholder="e.g., Samsung TV, Leather Sofa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category*</label>
            <select
              required
              className="w-full p-2 border rounded"
              value={itemData.category}
              onChange={e => setItemData({ ...itemData, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estimated Value*</label>
            <input
              type="number"
              required
              className="w-full p-2 border rounded"
              value={itemData.estimatedValue}
              onChange={e => setItemData({ ...itemData, estimatedValue: e.target.value })}
              placeholder="$"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded"
              value={itemData.notes}
              onChange={e => setItemData({ ...itemData, notes: e.target.value })}
              placeholder="Brand, model, age, condition, or other details"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('room-items')}
              className="flex-1 p-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-500 text-white rounded"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Export data function
  const exportData = () => {
    const csv = [
      ['Room', 'Item', 'Category', 'Estimated Value', 'Notes'],
      ...items.map(item => [
        item.room,
        item.name,
        item.category,
        item.estimatedValue,
        item.notes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fire-loss-inventory.csv';
    a.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {view === 'onboarding' ? (
        <OnboardingView />
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border-b p-4 flex justify-between items-center">
            {view !== 'rooms' && (
              <button onClick={() => setView('rooms')} className="text-blue-500">
                Back
              </button>
            )}
            <h1 className="text-lg font-semibold">RecoveryAlly</h1>
            <button onClick={exportData} className="text-blue-500">
              <FileText />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {view === 'rooms' && <RoomListView />}
            {view === 'add-item' && <AddItemView />}
            {view === 'room-items' && <RoomItemsView />}
          </div>

          {/* Footer */}
          {view === 'rooms' && (
            <div className="p-4 bg-white border-t">
              <div className="mb-4 text-sm text-center text-gray-600">
                Need help? Contact your insurance agent or call 211 for disaster assistance
              </div>
              <button
                onClick={() => {
                  setCurrentRoom(rooms[0]);
                  setView('add-item');
                }}
                className="w-full bg-blue-500 text-white rounded-lg p-4 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Item
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
