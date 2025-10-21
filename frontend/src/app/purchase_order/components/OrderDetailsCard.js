'use client';

import React from 'react';
import { Calendar, User, Package, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * Componente para mostrar los detalles de una orden de compra
 * 
 * @param {Object} order - Datos de la orden de compra
 * @param {String|Number} order.id 
 * @param {String} order.fecha 
 * @param {String} order.proveedor 
 * @param {Number} order.total 
 * @param {Number} order.cantidadItems 
 */
const OrderDetailsCard = ({ order }) => {
  if (!order) return null;

  // Formatear fecha si viene en formato ISO
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-2xl">Detalles de la Orden</CardTitle>
        <CardDescription>
          Información completa de la orden de compra #{order.order_id || order.id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID de la Orden */}
          <div className="flex items-start space-x-3">
            
            <div className='flex items-center gap-2'>
              <p className="text-sm text-muted-foreground">ID de Orden :</p>
              <p className="text-lg font-semibold">#{order.order_id || order.id}</p>
            </div>
          </div>

          {/* Fecha */}
          <div className="flex items-start space-x-3">
            
            <div className='flex items-center gap-2'>
              <p className="text-sm text-muted-foreground">Fecha de Emisión :</p>
              <p className="text-lg font-semibold">
                {formatDate(order.issue_date || order.fecha || order.date || 'N/A')}
              </p>
            </div>
          </div>

          {/* Proveedor */}
          <div className="flex items-start space-x-3">
            
            <div className='flex items-center gap-2'>
              <p className="text-sm text-muted-foreground">Proveedor :</p>
              <p className="text-lg font-semibold">
                {order.proveedor || order.supplier || 'N/A'}
              </p>
            </div>
          </div>

          {/* Cantidad de Items */}
          <div className="flex items-start space-x-3">
           
            <div className='flex items-center gap-2'>
              <p className="text-sm text-muted-foreground">Cantidad de Ítems :</p>
              <p className="text-lg font-semibold">
                {order.item_quantity || order.cantidadItems || order.itemCount || order.items?.length || 0}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-start space-x-3 md:col-span-2">
           
            <div className='flex items-center gap-2'>
              <p className="text-sm text-muted-foreground">Total :</p>
              <p className="text-lg font-semibold ">
                {formatCurrency(order.total || order.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional si existe */}
        {order.descripcion && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Descripción</p>
            <p className="text-sm">{order.descripcion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;

