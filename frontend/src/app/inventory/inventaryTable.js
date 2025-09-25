"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 👇 Datos de ejemplo
const data = [
  {
    id: 1,
    nombre: "Aceite Motor 5W-30",
    codigo: "AM5W30001",
    categoria: "Lubricantes",
    descripcion: "Aceite sintético para motores de alta performance",
    unidad_medida: "Litros",
    precio_unitario: 45.99,
    stock_minimo: 50,
    stock_actual: 120,
    ubicacion: "Almacén A - Estante 1",
    activo: true,
  },
  {
    id: 2,
    nombre: "Gasolina Premium 95",
    codigo: "GP95001",
    categoria: "Combustibles",
    descripcion: "Gasolina premium octanaje 95",
    unidad_medida: "Litros",
    precio_unitario: 1.25,
    stock_minimo: 1000,
    stock_actual: 8500,
    ubicacion: "Tanque Principal T1",
    activo: true,
  },
  {
    id: 3,
    nombre: "Diesel Ultra Bajo Azufre",
    codigo: "DUBA001",
    categoria: "Combustibles",
    descripcion: "Diesel con contenido ultra bajo de azufre",
    unidad_medida: "Litros",
    precio_unitario: 1.15,
    stock_minimo: 1500,
    stock_actual: 12000,
    ubicacion: "Tanque Principal T2",
    activo: true,
  },
  {
    id: 4,
    nombre: "Grasa Multipropósito",
    codigo: "GM001",
    categoria: "Lubricantes",
    descripcion: "Grasa para uso industrial multipropósito",
    unidad_medida: "Kilogramos",
    precio_unitario: 8.5,
    stock_minimo: 25,
    stock_actual: 15,
    ubicacion: "Almacén B - Estante 3",
    activo: true,
  },
  {
    id: 5,
    nombre: "Aditivo Anticongelante",
    codigo: "AA001",
    categoria: "Aditivos",
    descripcion: "Aditivo anticongelante para sistemas de refrigeración",
    unidad_medida: "Litros",
    precio_unitario: 12.75,
    stock_minimo: 30,
    stock_actual: 45,
    ubicacion: "Almacén A - Estante 5",
    activo: true,
  },
];

/// 👇 Columnas para inventario
export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <div>{row.getValue("nombre")}</div>,
  },
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => <div>{row.getValue("codigo")}</div>,
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => <div>{row.getValue("categoria")}</div>,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => <div>{row.getValue("descripcion")}</div>,
  },
  {
    accessorKey: "unidad_medida",
    header: "Unidad",
    cell: ({ row }) => <div>{row.getValue("unidad_medida")}</div>,
  },
  {
    accessorKey: "precio_unitario",
    header: "Precio Unitario",
    cell: ({ row }) => {
      const precio = parseFloat(row.getValue("precio_unitario"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(precio);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock_minimo",
    header: "Stock Mínimo",
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("stock_minimo")}</div>
    ),
  },
  {
    accessorKey: "stock_actual",
    header: "Stock Actual",
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("stock_actual")}</div>
    ),
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
    cell: ({ row }) => <div>{row.getValue("ubicacion")}</div>,
  },
  {
    accessorKey: "activo",
    header: "Activo",
    cell: ({ row }) => <div>{row.getValue("activo") ? "Sí" : "No"}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// 👇 Componente principal de la tabla
export function DataTableDemo() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
