"use client";

import { useMemo } from "react";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook que calcula el ancho del sidebar según su estado (abierto/cerrado)
 * Solo se aplica en desktop (no en móvil)
 * 
 * @param {boolean} isOpen - Estado del sidebar (abierto/cerrado)
 * @returns {number} - Ancho del sidebar en píxeles (0 en móvil)
 */
export const useSidebarWidth = (isOpen) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const width = useMemo(() => {
    // En móvil, el sidebar no ocupa espacio (está en overlay)
    if (isMobile) {
      return 0;
    }

    // En desktop, el sidebar tiene 288px cuando está abierto y 80px cuando está cerrado
    return isOpen ? 288 : 80;
  }, [isOpen, isMobile]);

  return width;
};

