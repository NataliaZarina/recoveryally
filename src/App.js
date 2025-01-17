import React, { useState, useEffect } from 'react';
import { Plus, FileText, ChevronRight } from 'lucide-react';

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
        <h1 className="text-2xl font-bold mb-4">Recovery Ally</h1>
        <p className="text-gray-600">
          This tool helps wildfire survivors document lost belongings for insurance claims.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">What This Tool Does:</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Organizes lost items **room by room**</li>
          <li>✅ **Exports to CSV & PDF** for easy insurance submission</li>
          <li>✅ **Auto-saves** progress to avoid data loss</li>
          <li>✅ Provides **tips on maximizing claims**</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Limitations:</h2>
        <ul className="space-y-2 text-sm">
          <li>❌ Does not submit claims directly to insurance companies</li>
          <li>❌ Does not provide official appraisals</li>
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
