export const COLLECTIONS = ['products', 'customers', 'sales', 'employees', 'inventory'] as const

export type CollectionName = (typeof COLLECTIONS)[number]

export const COLLECTION_LABELS: Record<CollectionName, string> = {
  products: 'Products',
  customers: 'Customers',
  sales: 'Sales',
  employees: 'Employees',
  inventory: 'Inventory'
}

