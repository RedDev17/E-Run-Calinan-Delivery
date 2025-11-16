import React from 'react';

interface ServiceSelectionProps {
  onServiceSelect: (service: 'food' | 'pabili' | 'padala' | 'requests') => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onServiceSelect }) => {
  const services = [
    {
      id: 'food' as const,
      name: 'Food',
      icon: '🍔',
      description: 'Order from restaurants',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      id: 'pabili' as const,
      name: 'Pabili',
      icon: '🛒',
      description: 'Buy grocery items',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'padala' as const,
      name: 'Padala',
      icon: '📦',
      description: 'Package delivery',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'requests' as const,
      name: 'Requests',
      icon: '📝',
      description: 'Angkas/Padala requests',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600'
    }
  ];

  const handleServiceClick = (serviceId: 'food' | 'pabili' | 'padala' | 'requests') => {
    onServiceSelect(serviceId);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with purple background */}
        <div className="bg-purple-600 text-white py-6 px-6 rounded-t-xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Select service
          </h1>
        </div>

        {/* Services Grid - 4 services in a row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2"
            >
              <div className="text-center">
                <div className="text-6xl md:text-7xl mb-3">{service.icon}</div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  {service.name}
                </h2>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;

