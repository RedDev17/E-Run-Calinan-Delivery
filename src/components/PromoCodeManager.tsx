import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag, Calendar, DollarSign, Percent, ArrowLeft } from 'lucide-react';
import { PromoCode } from '../types';
import { usePromoCodes } from '../hooks/usePromoCodes';

interface PromoCodeManagerProps {
  onBack: () => void;
}

const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({ onBack }) => {
  const { promoCodes, loading, addPromoCode, updatePromoCode, deletePromoCode } = usePromoCodes();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    applicable_to: 'total',
    min_order_amount: 0,
    max_discount_amount: 0,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usage_limit: 0,
    active: true,
    is_new_user_only: false
  });

  const handleEdit = (promo: PromoCode) => {
    setFormData({
      ...promo,
      start_date: new Date(promo.start_date).toISOString().slice(0, 16),
      end_date: new Date(promo.end_date).toISOString().slice(0, 16),
    });
    setEditingId(promo.id);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      applicable_to: 'total',
      min_order_amount: 0,
      max_discount_amount: 0,
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      usage_limit: 0,
      active: true,
      is_new_user_only: false
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.discount_value || !formData.start_date || !formData.end_date) {
        alert('Please fill in all required fields');
        return;
      }

      const promoData = {
        ...formData,
        code: formData.code.toUpperCase(),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      } as any;

      if (editingId) {
        await updatePromoCode(editingId, promoData);
      } else {
        await addPromoCode(promoData);
      }
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      alert('Failed to save promo code');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      try {
        await deletePromoCode(id);
      } catch (error) {
        alert('Failed to delete promo code');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">
            {editingId ? 'Edit Promo Code' : 'Add New Promo Code'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-black">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="e.g., WELCOME10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Description</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Internal note or description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Discount Type *</label>
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed_amount' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount (₱)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Discount Value *</label>
            <input
              type="number"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Applicable To *</label>
            <select
              value={formData.applicable_to}
              onChange={(e) => setFormData({ ...formData, applicable_to: e.target.value as 'delivery_fee' | 'food_items' | 'total' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="total">Total Order</option>
              <option value="food_items">Food Items Only</option>
              <option value="delivery_fee">Delivery Fee Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Min Order Amount</label>
            <input
              type="number"
              value={formData.min_order_amount || 0}
              onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Max Discount Amount (Optional)</label>
            <input
              type="number"
              value={formData.max_discount_amount || 0}
              onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Leave 0 for no limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Usage Limit (Optional)</label>
            <input
              type="number"
              value={formData.usage_limit || 0}
              onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Leave 0 for unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Start Date *</label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">End Date *</label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-6">
             <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
              />
              <span className="text-sm font-medium text-black">Active</span>
            </label>

             <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new_user_only || false}
                onChange={(e) => setFormData({ ...formData, is_new_user_only: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
              />
              <span className="text-sm font-medium text-black">New Users Only</span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Promo Code</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-semibold text-black">Promo Codes</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Code</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Discount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Applicable To</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Usage</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Validity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900">{promo.code}</span>
                    </div>
                    {promo.description && (
                      <p className="text-xs text-gray-500 mt-1">{promo.description}</p>
                    )}
                    {promo.is_new_user_only && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                        New Users Only
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {promo.discount_type === 'percentage' ? (
                        <Percent className="h-4 w-4 text-gray-400" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-900">
                        {promo.discount_value}
                        {promo.discount_type === 'percentage' ? '%' : ' OFF'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {promo.applicable_to.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {promo.usage_count} / {promo.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="text-xs">From: {new Date(promo.start_date).toLocaleDateString()}</span>
                      <span className="text-xs">To: {new Date(promo.end_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      promo.active && new Date() <= new Date(promo.end_date)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {promo.active && new Date() <= new Date(promo.end_date) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promoCodes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No promo codes found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManager;
