'use client';
import Layout from '@/components/layouts/Layout'
import { Button } from '@/components/ui/button';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PlusCircle } from 'lucide-react';
import React from 'react'

const MovementsContent = () => {
    const { user } = useAuth();
  return (
    <Layout>
        <h1>Movements</h1>

        <div className='flex gap-2 mt-4 mb-4'>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Pedido de Materiales
            </Button>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Movimiento
            </Button>
        </div>
        <div>
            Libreria maps
        </div>
        <div>
            P.o tabla    </div>
    </Layout>
  )
}

export default function Movements () {
    return (
        <AuthProvider>
            <MovementsContent />
        </AuthProvider>
    )
}