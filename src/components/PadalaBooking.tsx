import React, { useState } from 'react';
import { ArrowLeft, Package, MapPin, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import Header from './Header';

interface PadalaBookingProps {
  onBack: () => void;
}

const PadalaBooking: React.FC<PadalaBookingProps> = ({ onBack }) => {
  const { calculateDistance, calculateDeliveryFee, isWithinDeliveryArea } = useGoogleMaps();
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    pickup_address: '',
    delivery_address: '',
    item_description: '',
    item_weight: '',
    item_value: '',
    special_instructions: '',
    preferred_date: '',
    preferred_time: 'Morning',
    notes: ''
  });
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithinArea, setIsWithinArea] = useState<boolean | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateFee = async () => {
    if (!formData.pickup_address.trim() || !formData.delivery_address.trim()) {
      return;
    }

    setIsCalculating(true);
    try {
      // Check if delivery address is within area
      const areaCheck = await isWithinDeliveryArea(formData.delivery_address);
      setIsWithinArea(areaCheck.within);

      if (areaCheck.within) {
        // Calculate distance from pickup to delivery
        const result = await calculateDistance(formData.delivery_address);
        if (result) {
          setDistance(result.distance);
          const fee = calculateDeliveryFee(result.distance);
          setDeliveryFee(fee);
        }
      } else {
        setDistance(null);
        setDeliveryFee(0);
      }
    } catch (error) {
      console.error('Error calculating fee:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.contact_number || !formData.pickup_address || 
        !formData.delivery_address || !formData.item_description) {
      alert('Please fill in all required fields');
      return;
    }

    if (isWithinArea === false) {
      alert('Delivery address is outside our service area');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('padala_bookings')
        .insert({
          customer_name: formData.customer_name,
          contact_number: formData.contact_number,
          pickup_address: formData.pickup_address,
          delivery_address: formData.delivery_address,
          item_description: formData.item_description,
          item_weight: formData.item_weight || null,
          item_value: formData.item_value ? parseFloat(formData.item_value) : null,
          special_instructions: formData.special_instructions || null,
          preferred_date: formData.preferred_date || null,
          preferred_time: formData.preferred_time,
          delivery_fee: deliveryFee || null,
          distance_km: distance || null,
          notes: formData.notes || null,
          status: 'pending'
        });

      if (error) throw error;

      // Create Messenger message
      const message = `📦 PACKAGE DELIVERY BOOKING

👤 Customer: ${formData.customer_name}
📞 Contact: ${formData.contact_number}

📍 Pickup Address:
${formData.pickup_address}

📍 Delivery Address:
${formData.delivery_address}

📦 Package Details:
${formData.item_description}
${formData.item_weight ? `Weight: ${formData.item_weight}` : ''}
${formData.item_value ? `Declared Value: ₱${formData.item_value}` : ''}

📅 Preferred Date: ${formData.preferred_date || 'Any'}
⏰ Preferred Time: ${formData.preferred_time}

${distance ? `📏 Distance: ${distance} km` : ''}
💰 Delivery Fee: ₱${deliveryFee.toFixed(2)}

${formData.special_instructions ? `📝 Special Instructions: ${formData.special_instructions}` : ''}
${formData.notes ? `📝 Notes: ${formData.notes}` : ''}

Please confirm this package delivery booking. Thank you! 🛵`;

      const encodedMessage = encodeURIComponent(message);
      const messengerUrl = `https://m.me/375641885639863?text=${encodedMessage}`;
      
      window.open(messengerUrl, '_blank');
      
      // Reset form
      setFormData({
        customer_name: '',
        contact_number: '',
        pickup_address: '',
        delivery_address: '',
        item_description: '',
        item_weight: '',
        item_value: '',
        special_instructions: '',
        preferred_date: '',
        preferred_time: 'Morning',
        notes: ''
      });
      setDistance(null);
      setDeliveryFee(0);
      setIsWithinArea(null);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite font-inter">
      <Header 
        cartItemsCount={0}
        onCartClick={() => {}}
        onMenuClick={onBack}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-primary text-white text-sm sm:text-base font-medium shadow hover:bg-green-dark transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Services</span>
          </button>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-black flex items-center gap-2 text-center">
            <Package className="h-7 w-7 sm:h-8 sm:w-8" />
            Package Delivery
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                <textarea
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  placeholder="Enter complete pickup address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                <textarea
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  onBlur={calculateFee}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  placeholder="Enter complete delivery address"
                />
                {isCalculating && (
                  <p className="text-xs text-gray-500 mt-1">Calculating distance...</p>
                )}
                {isWithinArea === true && distance !== null && !isCalculating && (
                  <p className="text-xs text-green-600 mt-1">✓ Within area • Distance: {distance} km</p>
                )}
                {isWithinArea === false && !isCalculating && (
                  <p className="text-xs text-red-600 mt-1">✗ Outside delivery area</p>
                )}
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Description *</label>
                <textarea
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  placeholder="Describe what you're sending"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Weight (optional)</label>
                  <input
                    type="text"
                    name="item_weight"
                    value={formData.item_weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    placeholder="e.g., 1kg, 2kg, light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Value (optional)</label>
                  <input
                    type="number"
                    name="item_value"
                    value={formData.item_value}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    placeholder="₱0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Schedule */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Preferred Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Time
                </label>
                <select
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (optional)</label>
            <textarea
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
              placeholder="Any special instructions for delivery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
              placeholder="Any additional notes"
            />
          </div>

          {/* Delivery Fee Display */}
          {distance !== null && deliveryFee > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estimated Distance</p>
                  <p className="text-lg font-semibold text-gray-900">{distance} km</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="text-2xl font-bold text-green-primary">₱{deliveryFee.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isWithinArea === false}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform bg-green-primary text-white hover:bg-green-dark hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PadalaBooking;

