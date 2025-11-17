// app/inventory/inventaryTable.js
"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  FileDown,
  Pencil,
  Trash2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// --- Función para determinar el estado del stock ---
const getStockStatus = (product) => {
  if (product.stock_actual <= product.stock_minimo) {
    return { text: "Bajo", variant: "destructive" }; // Rojo
  }
  if (product.stock_actual <= product.stock_minimo * 1.2) {
    return { text: "Normal", variant: "default" }; // Amarillo/Naranja (por defecto)
  }
  return { text: "Óptimo", variant: "success" }; // Verde
};

// --- Definición de Columnas ---
export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Producto <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.nombre}
        <div className="text-xs text-muted-foreground">
          {row.original.codigo}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
  },
  {
    accessorKey: "stock_actual",
    header: () => <div className="text-center">Stock Actual</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.stock_actual} {row.original.unidad_medida}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = getStockStatus(row.original);
      return <Badge variant={status.variant}>{status.text}</Badge>;
    },
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
  },
  {
    accessorKey: "precio_unitario",
    header: () => <div className="text-right">Precio</div>,
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(row.original.precio_unitario);
      return <div className="text-right font-mono">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <QrCode className="mr-2 h-4 w-4" /> Ver QR
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

// --- Componente Principal de la Tabla ---
export function DataTable({ products }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Productos en Almacen</CardTitle>
            <CardDescription>
              {table.getFilteredRowModel().rows.length} producto(s)
              encontrado(s).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md hidden md:block">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-border"
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
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Vista móvil */}
        <div className="space-y-3 md:hidden">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="border border-border rounded-lg p-4 bg-muted/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {row.original.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.original.codigo}
                    </p>
                  </div>
                  <Badge variant={getStockStatus(row.original).variant}>
                    {getStockStatus(row.original).text}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Categoría</dt>
                    <dd className="font-medium">{row.original.categoria}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-muted-foreground">Stock</dt>
                    <dd className="font-medium">
                      {row.original.stock_actual} {row.original.unidad_medida}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ubicación</dt>
                    <dd className="font-medium">{row.original.ubicacion}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-muted-foreground">Precio</dt>
                    <dd className="font-medium">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(row.original.precio_unitario)}
                    </dd>
                  </div>
                </dl>
                <div className="flex justify-end mt-3 gap-2">
                  <Button variant="outline" size="sm">
                    Ver acciones
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No se encontraron resultados.
            </p>
          )}
        </div>
        {/* --- Paginación --- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
