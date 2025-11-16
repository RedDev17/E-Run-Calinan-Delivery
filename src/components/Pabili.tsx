import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Grocery, CartItem, MenuItem } from '../types';

interface PabiliProps {
  onBack: () => void;
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  onCartClick: () => void;
}

const Pabili: React.FC<PabiliProps> = ({ onBack, cartItems, onAddToCart, updateQuantity, onCartClick }) => {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchGroceries();
  }, []);

  const fetchGroceries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groceries')
        .select('*')
        .eq('available', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        setGroceries(data);
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(g => g.category)));
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching groceries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroceries = groceries.filter(grocery => {
    const matchesCategory = selectedCategory === 'all' || grocery.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      grocery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grocery.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (grocery: Grocery) => {
    // Convert grocery to menu item format for cart
    const menuItem: MenuItem = {
      id: grocery.id,
      name: grocery.name,
      description: grocery.description,
      basePrice: grocery.price,
      category: grocery.category,
      image_url: grocery.image_url,
      available: grocery.available,
      popular: grocery.popular,
      variations: [],
      addOns: []
    };
    onAddToCart(menuItem, 1);
  };

  const getCartItem = (groceryId: string): CartItem | undefined => {
    return cartItems.find(item => item.id.startsWith(groceryId) && item.id.split('-')[0] === groceryId);
  };

  const handleIncrement = (grocery: Grocery) => {
    const cartItem = getCartItem(grocery.id);
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    } else {
      handleAddToCart(grocery);
    }
  };

  const handleDecrement = (grocery: Grocery) => {
    const cartItem = getCartItem(grocery.id);
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      } else {
        updateQuantity(cartItem.id, 0); // This will remove it
      }
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-offwhite font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-primary text-white text-sm sm:text-base font-medium shadow hover:bg-green-dark transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Services</span>
          </button>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-black text-center">
            🛒 Pabili
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search groceries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-green-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Groceries Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading groceries...</p>
          </div>
        ) : filteredGroceries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No groceries found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGroceries.map(grocery => (
              <div
                key={grocery.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {grocery.image_url && (
                  <img
                    src={grocery.image_url}
                    alt={grocery.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{grocery.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{grocery.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-primary">₱{grocery.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">per {grocery.unit}</p>
                    </div>
                    {(() => {
                      const cartItem = getCartItem(grocery.id);
                      const quantity = cartItem?.quantity || 0;
                      
                      if (quantity > 0) {
                        return (
                          <div className="flex items-center gap-3 bg-green-primary text-white rounded-lg px-3 py-2">
                            <button
                              onClick={() => handleDecrement(grocery)}
                              className="hover:bg-green-dark rounded p-1 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-semibold min-w-[24px] text-center">{quantity}</span>
                            <button
                              onClick={() => handleIncrement(grocery)}
                              className="hover:bg-green-dark rounded p-1 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => handleAddToCart(grocery)}
                          className="bg-green-primary text-white px-4 py-2 rounded-lg hover:bg-green-dark transition-colors flex items-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pabili;

