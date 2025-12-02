'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Database {
  products: any[]
  customers: any[]
  sales: any[]
  employees: any[]
  inventory: any[]
}

export default function PrescriptiveAnalytics() {
  const [data, setData] = useState<Database | null>(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-8">Loading...</div>

  // Inventory Recommendations
  const inventoryRecommendations = data.products.map(product => {
    const productSales = data.sales.filter(s => s.productId === product.id)
    const avgDailySales = productSales.length > 0 
      ? productSales.reduce((sum, s) => sum + s.quantity, 0) / 10
      : 0
    const daysUntilReorder = product.stock > 0 && avgDailySales > 0
      ? Math.floor(product.stock / avgDailySales)
      : 999
    const recommendedOrder = avgDailySales * 30 // 30-day supply
    const priority = daysUntilReorder < 7 ? 'High' : daysUntilReorder < 15 ? 'Medium' : 'Low'
    
    return {
      name: product.name,
      currentStock: product.stock,
      recommendedOrder: Math.ceil(recommendedOrder),
      priority,
      daysUntilReorder: daysUntilReorder === 999 ? 'N/A' : daysUntilReorder,
      estimatedCost: Math.ceil(recommendedOrder) * product.cost
    }
  }).filter(p => p.priority !== 'Low').sort((a, b) => {
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 }
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
  })

  // Pricing Recommendations
  const pricingRecommendations = data.products.map(product => {
    const productSales = data.sales.filter(s => s.productId === product.id)
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0)
    const revenue = productSales.reduce((sum, s) => sum + s.total, 0)
    const profitMargin = revenue > 0 ? ((revenue - (totalSold * product.cost)) / revenue) * 100 : 0
    
    let recommendation = 'Maintain'
    let suggestedPrice = product.price
    let reason = 'Current pricing is optimal'
    
    if (profitMargin < 20 && totalSold > 5) {
      recommendation = 'Increase'
      suggestedPrice = product.price * 1.1
      reason = 'Low profit margin with good sales volume'
    } else if (profitMargin > 50 && totalSold < 3) {
      recommendation = 'Decrease'
      suggestedPrice = product.price * 0.9
      reason = 'High margin but low sales - price may be too high'
    } else if (totalSold === 0) {
      recommendation = 'Promote'
      suggestedPrice = product.price * 0.85
      reason = 'No sales - consider promotional pricing'
    }
    
    return {
      name: product.name,
      currentPrice: product.price,
      suggestedPrice: suggestedPrice,
      recommendation,
      reason,
      profitMargin: profitMargin.toFixed(1) + '%',
      salesCount: totalSold
    }
  }).filter(p => p.recommendation !== 'Maintain')

  // Customer Targeting Recommendations
  const customerTargeting = data.customers.map(customer => {
    const customerSales = data.sales.filter(s => s.customerId === customer.id)
    const avgPurchaseValue = customerSales.length > 0 
      ? customerSales.reduce((sum, s) => sum + s.total, 0) / customerSales.length 
      : 0
    const daysSinceLastPurchase = customerSales.length > 0 ? 10 : 30 // Simplified
    const customerValue = customer.totalSpent
    const churnRisk = daysSinceLastPurchase > 20 ? 'High' : daysSinceLastPurchase > 10 ? 'Medium' : 'Low'
    
    let action = 'Maintain'
    if (customerValue > 500 && churnRisk === 'High') {
      action = 'Win Back Campaign'
    } else if (customerValue > 300 && churnRisk === 'Medium') {
      action = 'Engagement Email'
    } else if (customerValue < 200 && avgPurchaseValue > 50) {
      action = 'Upsell Opportunity'
    }
    
    return {
      name: customer.name,
      customerValue,
      churnRisk,
      action,
      avgPurchaseValue: avgPurchaseValue.toFixed(2)
    }
  }).filter(c => c.action !== 'Maintain').sort((a, b) => b.customerValue - a.customerValue)

  // Employee Training Recommendations
  const employeeRecommendations = data.employees.map(emp => {
    const empSales = data.sales.filter(s => s.employeeId === emp.id)
    const totalRevenue = empSales.reduce((sum, s) => sum + s.total, 0)
    const avgSaleValue = empSales.length > 0 ? totalRevenue / empSales.length : 0
    const efficiency = empSales.length > 0 ? (totalRevenue / emp.salary) * 100 : 0
    const avgEfficiency = data.employees.reduce((sum, e) => {
      const eSales = data.sales.filter(s => s.employeeId === e.id)
      const eRev = eSales.reduce((s, sale) => s + sale.total, 0)
      return sum + (eSales.length > 0 ? (eRev / e.salary) * 100 : 0)
    }, 0) / data.employees.length
    
    let recommendation = 'No Action'
    if (efficiency < avgEfficiency * 0.8) {
      recommendation = 'Sales Training Needed'
    } else if (avgSaleValue < 30) {
      recommendation = 'Upselling Training'
    } else if (empSales.length < 20) {
      recommendation = 'Product Knowledge Training'
    }
    
    return {
      name: emp.name,
      efficiency: efficiency.toFixed(1),
      avgSaleValue: avgSaleValue.toFixed(2),
      recommendation
    }
  }).filter(e => e.recommendation !== 'No Action')

  // Strategic Recommendations Summary
  const totalReorderCost = inventoryRecommendations.reduce((sum, p) => sum + p.estimatedCost, 0)
  const potentialRevenueIncrease = pricingRecommendations.reduce((sum, p) => {
    if (p.recommendation === 'Increase') {
      return sum + ((p.suggestedPrice - p.currentPrice) * 5) // Estimate 5 units
    }
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 no-print">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">Prescriptive Analytics</h1>
        <p className="text-gray-600 mb-8">
          Actionable recommendations and insights for data-driven decision-making
        </p>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold">{inventoryRecommendations.length}</div>
              <div className="text-sm opacity-90">Products Need Reordering</div>
              <div className="text-xs opacity-75 mt-1">Est. Cost: ₱{totalReorderCost.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{pricingRecommendations.length}</div>
              <div className="text-sm opacity-90">Pricing Adjustments Recommended</div>
              <div className="text-xs opacity-75 mt-1">Potential Revenue: +₱{potentialRevenueIncrease.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{customerTargeting.length}</div>
              <div className="text-sm opacity-90">Customer Actions Required</div>
              <div className="text-xs opacity-75 mt-1">Targeted Marketing Opportunities</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Inventory Management Recommendations</h2>
          <p className="text-gray-600 mb-4">
            Products that need immediate attention for restocking
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Product</th>
                  <th className="px-4 py-2 text-left border">Current Stock</th>
                  <th className="px-4 py-2 text-left border">Recommended Order</th>
                  <th className="px-4 py-2 text-left border">Days Until Reorder</th>
                  <th className="px-4 py-2 text-left border">Priority</th>
                  <th className="px-4 py-2 text-left border">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRecommendations.map((item, idx) => (
                  <tr key={idx} className={item.priority === 'High' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">{item.currentStock}</td>
                    <td className="px-4 py-2 border">{item.recommendedOrder}</td>
                    <td className="px-4 py-2 border">{item.daysUntilReorder}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.priority === 'High' ? 'bg-red-200 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">₱{item.estimatedCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2">💡 Recommendation:</p>
            <p className="text-gray-700">
              Place orders for high-priority items immediately to avoid stockouts. 
              Total estimated reorder cost: <strong>₱{totalReorderCost.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Pricing Strategy Recommendations</h2>
          <p className="text-gray-600 mb-4">
            Products with pricing optimization opportunities
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Product</th>
                  <th className="px-4 py-2 text-left border">Current Price</th>
                  <th className="px-4 py-2 text-left border">Suggested Price</th>
                  <th className="px-4 py-2 text-left border">Action</th>
                  <th className="px-4 py-2 text-left border">Reason</th>
                  <th className="px-4 py-2 text-left border">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {pricingRecommendations.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">₱{item.currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 border">₱{item.suggestedPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.recommendation === 'Increase' ? 'bg-green-200 text-green-800' :
                        item.recommendation === 'Decrease' ? 'bg-blue-200 text-blue-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {item.recommendation}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">{item.reason}</td>
                    <td className="px-4 py-2 border">{item.profitMargin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2">💡 Recommendation:</p>
            <p className="text-gray-700">
              Adjust pricing for these products to optimize profit margins and sales volume. 
              Monitor results and adjust as needed.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Customer Targeting Recommendations</h2>
          <p className="text-gray-600 mb-4">
            Strategic actions for customer retention and growth
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Customer</th>
                  <th className="px-4 py-2 text-left border">Customer Value</th>
                  <th className="px-4 py-2 text-left border">Churn Risk</th>
                  <th className="px-4 py-2 text-left border">Recommended Action</th>
                  <th className="px-4 py-2 text-left border">Avg Purchase</th>
                </tr>
              </thead>
              <tbody>
                {customerTargeting.slice(0, 10).map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">₱{item.customerValue.toFixed(2)}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.churnRisk === 'High' ? 'bg-red-200 text-red-800' :
                        item.churnRisk === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {item.churnRisk}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">{item.action}</td>
                    <td className="px-4 py-2 border">₱{item.avgPurchaseValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2">💡 Recommendation:</p>
            <p className="text-gray-700">
              Implement targeted marketing campaigns for high-value customers at risk of churning. 
              Focus on win-back campaigns and personalized offers.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👔 Employee Development Recommendations</h2>
          <p className="text-gray-600 mb-4">
            Training and development opportunities for staff improvement
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Employee</th>
                  <th className="px-4 py-2 text-left border">Efficiency Score</th>
                  <th className="px-4 py-2 text-left border">Avg Sale Value</th>
                  <th className="px-4 py-2 text-left border">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {employeeRecommendations.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">{item.efficiency}</td>
                    <td className="px-4 py-2 border">₱{item.avgSaleValue}</td>
                    <td className="px-4 py-2 border">{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2">💡 Recommendation:</p>
            <p className="text-gray-700">
              Provide targeted training programs to improve employee performance. 
              Focus on sales techniques, product knowledge, and upselling strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

