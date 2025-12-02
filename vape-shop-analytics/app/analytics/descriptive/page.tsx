'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface Database {
  products: any[]
  customers: any[]
  sales: any[]
  employees: any[]
  inventory: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function DescriptiveAnalytics() {
  const [data, setData] = useState<Database | null>(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-8">Loading...</div>

  // Calculate statistics
  const totalSales = data.sales.reduce((sum, sale) => sum + sale.total, 0)
  const avgSaleAmount = totalSales / data.sales.length
  const totalProducts = data.products.length
  const totalCustomers = data.customers.length
  const avgCustomerSpending = data.customers.reduce((sum, c) => sum + c.totalSpent, 0) / data.customers.length
  const totalInventoryValue = data.products.reduce((sum, p) => sum + (p.stock * p.cost), 0)

  // Sales by product category
  const salesByCategory = data.sales.reduce((acc: any, sale) => {
    const product = data.products.find(p => p.id === sale.productId)
    if (product) {
      const category = product.category
      acc[category] = (acc[category] || 0) + sale.total
    }
    return acc
  }, {})

  const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({
    name,
    value: Number(value)
  }))

  // Top selling products
  const productSales = data.sales.reduce((acc: any, sale) => {
    acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity
    return acc
  }, {})

  const topProducts = Object.entries(productSales)
    .map(([id, qty]) => {
      const product = data.products.find(p => p.id === Number(id))
      return {
        name: product?.name || 'Unknown',
        quantity: Number(qty),
        revenue: data.sales
          .filter(s => s.productId === Number(id))
          .reduce((sum, s) => sum + s.total, 0)
      }
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Sales over time (by date)
  const salesByDate = data.sales.reduce((acc: any, sale) => {
    acc[sale.date] = (acc[sale.date] || 0) + sale.total
    return acc
  }, {})

  const dailySales = Object.entries(salesByDate)
    .map(([date, total]) => ({
      date: date.split('-').slice(1).join('/'),
      sales: Number(total)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Customer age distribution
  const ageGroups = data.customers.reduce((acc: any, customer) => {
    const age = customer.age
    let group = ''
    if (age < 25) group = '18-24'
    else if (age < 30) group = '25-29'
    else if (age < 35) group = '30-34'
    else group = '35+'
    
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {})

  const ageDistribution = Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value: Number(value)
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 no-print">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">Descriptive Analytics</h1>
        <p className="text-gray-600 mb-8">
          Summary statistics and visualizations of historical business data
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-blue-600">₱{totalSales.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Sales</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">₱{avgSaleAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Avg Sale Amount</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600">{totalProducts}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-orange-600">{totalCustomers}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-red-600">₱{avgCustomerSpending.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Avg Customer Spending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-indigo-600">₱{totalInventoryValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Inventory Value</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales by Product Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Age Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Selling Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales (₱)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Metric</th>
                  <th className="px-4 py-2 text-left border">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">Total Revenue</td>
                  <td className="px-4 py-2 border">₱{totalSales.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Number of Transactions</td>
                  <td className="px-4 py-2 border">{data.sales.length}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Average Transaction Value</td>
                  <td className="px-4 py-2 border">₱{avgSaleAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Total Products in Catalog</td>
                  <td className="px-4 py-2 border">{totalProducts}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Active Customers</td>
                  <td className="px-4 py-2 border">{totalCustomers}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Average Customer Lifetime Value</td>
                  <td className="px-4 py-2 border">₱{avgCustomerSpending.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Total Inventory Value</td>
                  <td className="px-4 py-2 border">₱{totalInventoryValue.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

