"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProductRow = ({ product, index, onUpdate, onRemove }) => {
  const handleChange = (field, value) => {
    onUpdate(index, { ...product, [field]: value });
  };

  return React.createElement(
    "div",
    { className: "flex flex-row justify-between items-center w-full wrap md:flex-row gap-4 p-4 border border-border rounded-lg bg-card" },
    // ID o código del producto
    React.createElement(
      "div",
      { className: "space-y-2 " },
      React.createElement(
        Label,
        { htmlFor: `product-id-${index}`, className: "text-sm font-medium" },
        "ID/Código * "
      ),
      React.createElement(Input, {
        id: `product-id-${index}`,
        type: "text",
        value: product.id || "",
        onChange: (e) => handleChange("id", e.target.value),
        placeholder: "Ej: PROD001",
        className: "w-full"
      })
    ),
    // Nombre o descripción
    React.createElement(
      "div",
      { className: "space-y-2" },
      React.createElement(
        Label,
        { htmlFor: `product-name-${index}`, className: "text-sm font-medium" },
        "Nombre *"
      ),
      React.createElement(Input, {
        id: `product-name-${index}`,
        type: "text",
        value: product.name || "",
        onChange: (e) => handleChange("name", e.target.value),
        placeholder: "Ej: Producto ABC",
        className: "w-full"
      })
    ),
    // Cantidad
    React.createElement(
      "div",
      { className: "space-y-2" },
      React.createElement(
        Label,
        { htmlFor: `product-quantity-${index}`, className: "text-sm font-medium" },
        "Cantidad *"
      ),
      React.createElement(Input, {
        id: `product-quantity-${index}`,
        type: "number",
        min: "1",
        value: product.quantity || "",
        onChange: (e) => handleChange("quantity", parseInt(e.target.value) || 0),
        placeholder: "1",
        className: "w-full"
      })
    ),
    // Precio unitario
    React.createElement(
      "div",
      { className: "space-y-2" },
      React.createElement(
        Label,
        { htmlFor: `product-price-${index}`, className: "text-sm font-medium" },
        "Precio Unitario"
      ),
      React.createElement(Input, {
        id: `product-price-${index}`,
        type: "number",
        min: "0",
        step: "0.01",
        value: product.price || "",
        onChange: (e) => handleChange("price", parseFloat(e.target.value) || 0),
        placeholder: "0.00",
        className: "w-full"
      })
    ),
    // Botón eliminar
    React.createElement(
      "div",
      { className: "flex items-end" },
      React.createElement(Button, {
        type: "button",
        variant: "destructive",
        size: "sm",
        onClick: () => onRemove(index),
        className: "w-full h-10"
      }, React.createElement(X, { className: "h-4 w-4" }))
    )
  );
};

export default ProductRow;
