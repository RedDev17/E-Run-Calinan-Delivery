import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import Hero from './components/Hero';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import { useMenu } from './hooks/useMenu';
import { useRestaurants } from './hooks/useRestaurants';
import { Restaurant } from './types';

function MainApp() {
  const cart = useCart();
  const { menuItems } = useMenu();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const [currentView, setCurrentView] = React.useState<'restaurants' | 'restaurant-menu' | 'cart' | 'checkout'>('restaurants');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Restaurant | null>(null);

  const handleViewChange = (view: 'restaurants' | 'restaurant-menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentView('restaurant-menu');
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
    setCurrentView('restaurants');
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when category is selected
  };

  // Filter menu items based on search query and category
  const filteredMenuItems = React.useMemo(() => {
    let filtered = menuItems;

    // If there's a search query, filter by search first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Then filter by active category (if not 'all')
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  }, [menuItems, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-offwhite font-inter">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('restaurants')}
      />
      
      {currentView === 'restaurants' && (
        <>
          <Hero 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            restaurantCount={restaurants.length}
          />
          <RestaurantList
            restaurants={restaurants}
            searchQuery={searchQuery}
            onRestaurantClick={handleRestaurantClick}
            loading={restaurantsLoading}
          />
        </>
      )}

      {currentView === 'restaurant-menu' && selectedRestaurant && (
        <RestaurantMenu
          restaurant={selectedRestaurant}
          cartItems={cart.cartItems}
          onBack={handleBackToRestaurants}
          onAddToCart={cart.addToCart}
          updateQuantity={cart.updateQuantity}
        />
      )}
      
      {currentView === 'menu' && (
        <>
          <Hero 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <SubNav selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
          <Menu 
            menuItems={filteredMenuItems}
            addToCart={cart.addToCart}
            cartItems={cart.cartItems}
            updateQuantity={cart.updateQuantity}
            activeCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
            searchQuery={searchQuery}
          />
        </>
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('restaurants')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
        />
      )}
      
      {(currentView === 'restaurants' || currentView === 'restaurant-menu') && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;