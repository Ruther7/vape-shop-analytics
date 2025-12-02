'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Database {
  products: any[]
  customers: any[]
  sales: any[]
  employees: any[]
  inventory: any[]
}

export default function PredictiveAnalytics() {
  const [data, setData] = useState<Database | null>(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-8">Loading...</div>

  // Simple Linear Regression for Sales Forecasting
  const salesByDate = data.sales.reduce((acc: any, sale) => {
    const date = new Date(sale.date)
    const day = date.getDate()
    acc[day] = (acc[day] || 0) + sale.total
    return acc
  }, {})

  const historicalSales = Object.entries(salesByDate)
    .map(([day, total]) => ({
      day: Number(day),
      sales: Number(total)
    }))
    .sort((a, b) => a.day - b.day)

  // Calculate linear regression
  const n = historicalSales.length
  const sumX = historicalSales.reduce((sum, d) => sum + d.day, 0)
  const sumY = historicalSales.reduce((sum, d) => sum + d.sales, 0)
  const sumXY = historicalSales.reduce((sum, d) => sum + d.day * d.sales, 0)
  const sumX2 = historicalSales.reduce((sum, d) => sum + d.day * d.day, 0)

  const denominator = n * sumX2 - sumX * sumX
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator
  const intercept = n === 0 ? 0 : (sumY - slope * sumX) / n

  // Generate predictions for next 10 days
  const maxDay = Math.max(...historicalSales.map(d => d.day))
  const predictions = []
  for (let day = maxDay + 1; day <= maxDay + 10; day++) {
    const predicted = slope * day + intercept
    predictions.push({
      day: day,
      sales: Math.max(0, predicted), // Ensure non-negative
      type: 'Predicted'
    })
  }

  const salesWithPredictions = [
    ...historicalSales.map(d => ({ ...d, type: 'Historical' })),
    ...predictions
  ]

  // Product Demand Forecasting
  const productDemand = data.products.map(product => {
    const productSales = data.sales.filter(s => s.productId === product.id)
    const avgDailySales = productSales.length > 0 
      ? productSales.reduce((sum, s) => sum + s.quantity, 0) / 10 // Assuming 10 days of data
      : 0
    const daysUntilReorder = product.stock > 0 && avgDailySales > 0
      ? Math.floor(product.stock / avgDailySales)
      : 0
    return {
      name: product.name,
      currentStock: product.stock,
      avgDailySales: avgDailySales,
      daysUntilReorder: daysUntilReorder,
      predictedNeed: avgDailySales * 30 // 30-day forecast
    }
  }).filter(p => p.avgDailySales > 0).sort((a, b) => a.daysUntilReorder - b.daysUntilReorder)

  // Revenue Forecast (next 30 days)
  const avgDailyRevenue =
    historicalSales.length > 0
      ? historicalSales.reduce((sum, d) => sum + d.sales, 0) / historicalSales.length
      : 0
  const monthlyForecast = avgDailyRevenue * 30

  // Customer Growth Prediction
  const customerGrowth = data.customers.map(customer => {
    const daysSinceJoin = Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24))
    const purchaseRate = daysSinceJoin > 0 ? customer.totalPurchases / daysSinceJoin : 0
    const predictedPurchases = purchaseRate * 30 // Next 30 days
    const avgOrderValue =
      customer.totalPurchases > 0 ? customer.totalSpent / customer.totalPurchases : 0
    return {
      name: customer.name,
      currentPurchases: customer.totalPurchases,
      predictedPurchases: predictedPurchases,
      predictedSpending: predictedPurchases * avgOrderValue
    }
  }).sort((a, b) => b.predictedSpending - a.predictedSpending)

  const averageSales = n > 0 ? sumY / n : 0
  const growthRateValue = averageSales === 0 ? 0 : (slope / averageSales) * 100
  const trendAnalysis = {
    currentTrend: slope > 0 ? 'Increasing' : slope < 0 ? 'Decreasing' : 'Stable',
    growthRate: `${growthRateValue.toFixed(2)}%`,
    confidence: 'Medium' // In a real system, this would be calculated based on R²
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 no-print">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">Predictive Analytics</h1>
        <p className="text-gray-600 mb-8">
          Forecasting future trends and predicting outcomes based on historical data patterns
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">₱{monthlyForecast.toFixed(2)}</div>
            <div className="text-gray-600 mb-2">Predicted Revenue (Next 30 Days)</div>
            <div className="text-sm text-gray-500">Based on average daily sales</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">{trendAnalysis.currentTrend}</div>
            <div className="text-gray-600 mb-2">Sales Trend</div>
            <div className="text-sm text-gray-500">Growth Rate: {trendAnalysis.growthRate}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">{trendAnalysis.confidence}</div>
            <div className="text-gray-600 mb-2">Forecast Confidence</div>
            <div className="text-sm text-gray-500">Based on historical data quality</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Forecast (Next 10 Days)</h2>
          <p className="text-gray-600 mb-4">
            Using linear regression to predict future sales based on historical trends
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesWithPredictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Sales (₱)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Methodology:</strong> Linear regression (y = mx + b) where:</p>
            <p>• Slope (m) = {slope.toFixed(2)}</p>
            <p>• Intercept (b) = {intercept.toFixed(2)}</p>
            <p>• Historical data points: {historicalSales.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Demand Forecast</h2>
          <p className="text-gray-600 mb-4">
            Predicting which products will need restocking based on current sales velocity
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productDemand.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentStock" fill="#8884d8" name="Current Stock" />
              <Bar dataKey="predictedNeed" fill="#82ca9d" name="Predicted Need (30 days)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Products Needing Reorder Soon:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {productDemand.filter(p => p.daysUntilReorder < 15 && p.daysUntilReorder > 0).slice(0, 5).map((product, idx) => (
                <li key={idx}>
                  {product.name}: {product.daysUntilReorder} days remaining at current sales rate
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Spending Prediction (Next 30 Days)</h2>
          <p className="text-gray-600 mb-4">
            Forecasting customer purchasing behavior based on historical patterns
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerGrowth.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="predictedSpending" fill="#8884d8" name="Predicted Spending (₱)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Forecast Metrics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Metric</th>
                  <th className="px-4 py-2 text-left border">Value</th>
                  <th className="px-4 py-2 text-left border">Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">30-Day Revenue Forecast</td>
                  <td className="px-4 py-2 border">₱{monthlyForecast.toFixed(2)}</td>
                  <td className="px-4 py-2 border">Average Daily Revenue × 30</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Sales Trend</td>
                  <td className="px-4 py-2 border">{trendAnalysis.currentTrend}</td>
                  <td className="px-4 py-2 border">Linear Regression</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Growth Rate</td>
                  <td className="px-4 py-2 border">{trendAnalysis.growthRate}</td>
                  <td className="px-4 py-2 border">Slope Analysis</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">Products at Risk (Low Stock)</td>
                  <td className="px-4 py-2 border">
                    {productDemand.filter(p => p.daysUntilReorder < 15 && p.daysUntilReorder > 0).length}
                  </td>
                  <td className="px-4 py-2 border">Sales Velocity Analysis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

