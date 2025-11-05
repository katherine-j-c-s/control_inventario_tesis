'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import SearchOrderForm from './SearchOrderForm';
import OrderDetailsCard from './OrderDetailsCard';
import GenerateReportButton from './GenerateReportButton';
import { orderAPI } from '@/lib/api';

const GenerateReportComponent = ({ onClose, className = '' }) => {
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  
   /* Función para buscar una orden por su ID*/
  const handleSearchOrder = async (orderId) => {
    setIsLoading(true);
    setError(null);
    setOrder(null);
    setProducts([]);

    try {
      const [orderResponse, productsResponse] = await Promise.all([
        orderAPI.getOrderById(orderId),
        orderAPI.getOrderProducts(orderId)
      ]);
      
      if (orderResponse.data.success) {
        let orderData = orderResponse.data.data;
        
        // Si la respuesta es un array, tomar el primer elemento
        if (Array.isArray(orderData)) {
          orderData = orderData.length > 0 ? orderData[0] : null;
        }
        
        if (!orderData) {
          setError('No se encontraron datos de la orden');
          return;
        }
        
        setOrder(orderData);
        
        // Manejar productos (puede ser array o objeto)
        if (productsResponse.data.success) {
          let productsData = productsResponse.data.data;
          if (Array.isArray(productsData)) {
            setProducts(productsData);
          } else if (productsData && typeof productsData === 'object') {
            // Si es un objeto, convertirlo a array
            setProducts([productsData]);
          } else {
            setProducts([]);
          }
        } else {
          setProducts([]);
        }
      } else {
        setError(orderResponse.data.message || 'Error al buscar la orden');
      }

    } catch (err) {
      if (err.response?.status === 404) {
        setError('Orden no encontrada');
      } else if (err.response?.status === 401) {
        setError('No tiene permisos para ver esta orden');
      } else if (err.response?.status === 403) {
        setError('Token inválido o expirado');
      } else {
        setError(err.response?.data?.message || 'Error al buscar la orden');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Card de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Orden de Compra</CardTitle>
          <CardDescription>
            Ingrese el ID de la orden de compra para ver sus detalles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchOrderForm 
            onSearch={handleSearchOrder} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Error
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalles de la orden */}
      {order && (
        <div className="space-y-4">
          <OrderDetailsCard order={order} />
          
          {/* Card de productos */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Productos de la Orden</CardTitle>
                <CardDescription>
                  Lista de productos incluidos en esta orden de compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products.map((product, index) => (
                    <div key={product.id || index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name || 'Producto sin nombre'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          Cantidad: {product.quantity || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Precio: ${parseFloat(product.unit_price || 0).toFixed(2)}
                        </p>
                        <p className="font-semibold text-primary-600">
                          Total: ${parseFloat(product.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Botón para generar PDF */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    ¿Desea generar el informe PDF?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Se descargará automáticamente el informe completo de la orden
                    {products.length > 0 && ` con ${products.length} productos`}
                  </p>
                </div>
                <GenerateReportButton 
                  orderId={order?.order_id || order?.id || null}
                  key={`report-btn-${order?.order_id || order?.id || 'no-id'}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Buscando orden...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GenerateReportComponent;

