import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import ServiceSelection from './components/ServiceSelection';
import Pabili from './components/Pabili';
import PadalaBooking from './components/PadalaBooking';
import Requests from './components/Requests';
import { useMenu } from './hooks/useMenu';
import { useRestaurants } from './hooks/useRestaurants';
import { Restaurant } from './types';

function ServiceSelectionPage() {
  const navigate = useNavigate();
  
  const handleServiceSelect = (service: 'food' | 'pabili' | 'padala' | 'requests') => {
    switch (service) {
      case 'food':
        navigate('/food');
        break;
      case 'pabili':
        navigate('/pabili');
        break;
      case 'padala':
        navigate('/padala');
        break;
      case 'requests':
        navigate('/requests');
        break;
    }
  };

  return <ServiceSelection onServiceSelect={handleServiceSelect} />;
}

function FoodService() {
  const navigate = useNavigate();
  const cart = useCart();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const [currentView, setCurrentView] = React.useState<'restaurants' | 'restaurant-menu' | 'cart' | 'checkout'>('restaurants');
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

  const handleBackToServices = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-offwhite font-inter">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={handleBackToServices}
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

function PabiliService() {
  const navigate = useNavigate();
  const cart = useCart();
  const [currentView, setCurrentView] = React.useState<'groceries' | 'cart' | 'checkout'>('groceries');

  const handleViewChange = (view: 'groceries' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleBackToServices = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-offwhite font-inter">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={handleBackToServices}
      />
      
      {currentView === 'groceries' && (
        <Pabili 
          onBack={handleBackToServices}
          cartItems={cart.cartItems}
          onAddToCart={cart.addToCart}
          updateQuantity={cart.updateQuantity}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('groceries')}
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
      
      {currentView === 'groceries' && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function PadalaService() {
  const navigate = useNavigate();
  return <PadalaBooking onBack={() => navigate('/')} />;
}

function RequestsService() {
  const navigate = useNavigate();
  return <Requests onBack={() => navigate('/')} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ServiceSelectionPage />} />
        <Route path="/food" element={<FoodService />} />
        <Route path="/pabili" element={<PabiliService />} />
        <Route path="/padala" element={<PadalaService />} />
        <Route path="/requests" element={<RequestsService />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;