import { useState, useEffect } from 'react';
import { PromoCode } from '../types';
import { supabase } from '../lib/supabase';

export const usePromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPromoCodes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching promo codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const addPromoCode = async (promoCode: Omit<PromoCode, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('promo_codes')
        .insert({
          ...promoCode,
          usage_count: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchPromoCodes();
      return data;
    } catch (err) {
      console.error('Error adding promo code:', err);
      throw err;
    }
  };

  const updatePromoCode = async (id: string, updates: Partial<PromoCode>) => {
    try {
      const { error: updateError } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchPromoCodes();
    } catch (err) {
      console.error('Error updating promo code:', err);
      throw err;
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchPromoCodes();
    } catch (err) {
      console.error('Error deleting promo code:', err);
      throw err;
    }
  };

  const validatePromoCode = async (code: string, orderAmount: number, type: 'delivery' | 'food' = 'food', ipAddress?: string): Promise<{ valid: boolean; discount?: number; message?: string; promoCode?: PromoCode }> => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .single();

      if (error || !data) {
        return { valid: false, message: 'Invalid promo code' };
      }

      const promo = data as PromoCode;
      const now = new Date();
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);

      if (now < startDate || now > endDate) {
        return { valid: false, message: 'Promo code is expired or not yet active' };
      }

      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        return { valid: false, message: 'Promo code usage limit reached' };
      }

      if (promo.min_order_amount && orderAmount < promo.min_order_amount) {
        return { valid: false, message: `Minimum order amount of ₱${promo.min_order_amount} required` };
      }

      // New User Check
      if (promo.is_new_user_only) {
        if (!ipAddress) {
           // If we can't verify IP, we can't allow "New User Only" codes (or maybe we allow? safer to block)
           return { valid: false, message: 'Cannot verify new user status (IP missing)' };
        }

        // Check if this IP has used ANY promo code before
        const { count, error: logError } = await supabase
          .from('promo_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('ip_address', ipAddress);

        if (logError) {
            console.error('Error checking promo usage logs:', logError);
            return { valid: false, message: 'Error verifying new user status' };
        }

        if (count && count > 0) {
            return { valid: false, message: 'This promo code is for new users only' };
        }
      }

      // Check applicability
      if (promo.applicable_to === 'delivery_fee' && type !== 'delivery') {
         // If checking for food discount but code is for delivery, it's valid but 0 discount here (will be applied to delivery fee)
         // Actually, the caller should handle where to apply. 
         // Let's just return the promo details and let the caller calculate.
      }

      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (orderAmount * promo.discount_value) / 100;
        if (promo.max_discount_amount && discountAmount > promo.max_discount_amount) {
          discountAmount = promo.max_discount_amount;
        }
      } else {
        discountAmount = promo.discount_value;
      }

      return { valid: true, discount: discountAmount, promoCode: promo };

    } catch (err) {
      console.error('Error validating promo code:', err);
      return { valid: false, message: 'Error validating code' };
    }
  };
  
  const incrementUsage = async (id: string, ipAddress?: string) => {
      try {
          // First get current count to ensure atomic-ish update or just use rpc if we had one.
          // For now, simple update is fine for this scale.
          const { data } = await supabase.from('promo_codes').select('usage_count').eq('id', id).single();
          if (data) {
              await supabase.from('promo_codes').update({ usage_count: data.usage_count + 1 }).eq('id', id);
          }

          // Log usage if IP is provided
          if (ipAddress) {
              await supabase.from('promo_usage_logs').insert({
                  promo_code_id: id,
                  ip_address: ipAddress
              });
          }
      } catch (err) {
          console.error('Error incrementing usage:', err);
      }
  }

  return {
    promoCodes,
    loading,
    error,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    incrementUsage,
    refetch: fetchPromoCodes
  };
};
