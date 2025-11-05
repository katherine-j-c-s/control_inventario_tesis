'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Componente para buscar una orden de compra por su ID
 * 
 * @param {Function} onSearch - Callback que recibe el ID de la orden a buscar
 * @param {Boolean} isLoading - Indica si hay una búsqueda en curso
 */
const SearchOrderForm = ({ onSearch, isLoading }) => {
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      onSearch(orderId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Ingrese el ID de la orden de compra"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !orderId.trim()}
          className="sm:w-auto w-full"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Buscando...' : 'Buscar Orden'}
        </Button>
      </div>
    </form>
  );
};

export default SearchOrderForm;

