# Vape Shop Analytics System

A comprehensive Business Analytics Information System for a Vape Shop, built with Next.js.

## Project Overview

This system integrates database management with advanced analytics capabilities to provide insights into sales, inventory, customer behavior, and employee performance. The project meets all requirements for a Business Analytics final project, including:

- **Database Structure**: 5 main data tables (Products, Customers, Sales, Employees, Inventory)
- **Data Requirements**: Each table contains 20+ records
- **Analytics Types**: Descriptive, Predictive, and Prescriptive analytics
- **Technology Stack**: Next.js, React, TypeScript, Tailwind CSS, Recharts

## Features

### 1. Database Management
- Complete database with 5 tables and 20+ records each
- View all database tables and records
- Structured data for Products, Customers, Sales, Employees, and Inventory

### 2. Descriptive Analytics
- Summary statistics and key metrics
- Visualizations (bar charts, pie charts, line graphs)
- Historical data analysis
- Sales trends and patterns

### 3. Predictive Analytics
- Sales forecasting using linear regression
- Product demand prediction
- Customer spending prediction
- Revenue forecasting
- Trend analysis

### 4. Prescriptive Analytics
- Inventory management recommendations
- Pricing strategy recommendations
- Customer targeting recommendations
- Employee development recommendations
- Actionable insights for decision-making

## Backend API

The project includes a lightweight file-backed API so you can demonstrate create/read/update/delete flows without running an external database server.

- Data lives in `data/database.json`.
- Shared helpers in `lib/jsonDatabase.ts` handle reading/writing the JSON file.
- Endpoints are dynamic, so every collection (`products`, `customers`, `sales`, `employees`, `inventory`) gets the same set of routes:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/data` | Returns the entire database snapshot |
| `GET` | `/api/[collection]` | Lists every record in the selected collection |
| `POST` | `/api/[collection]` | Appends a record; an auto-incrementing `id` is assigned |
| `GET` | `/api/[collection]/[id]` | Fetches a single record by numeric id |
| `PATCH` | `/api/[collection]/[id]` | Partially updates the record |
| `DELETE` | `/api/[collection]/[id]` | Deletes the record from the JSON file |

Example usage:

```bash
# List all products
curl http://localhost:3000/api/products

# Create a new customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Customer","email":"demo@shop.com","totalPurchases":0,"totalSpent":0}'

# Update inventory item 4
curl -X PATCH http://localhost:3000/api/inventory/4 \
  -H "Content-Type: application/json" \
  -d '{"currentStock":12}'
```

Each mutation writes directly to `data/database.json`, so changes persist while the dev server is running and are easy to inspect.

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd vape-shop-analytics
```

2. Install dependencies:
```bash
npm install
```

**Note**: You may see deprecation warnings and security vulnerabilities during installation. These are in development dependencies only and do not affect the production build. See `SECURITY_NOTES.md` for details.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Troubleshooting

If you see `'next' is not recognized`, make sure you've run `npm install` first to install all dependencies.

## Project Structure

```
vape-shop-analytics/
├── app/
│   ├── api/
│   │   ├── [collection]/
│   │   │   ├── [id]/route.ts     # GET/PATCH/DELETE per record
│   │   │   └── route.ts          # GET/POST per collection
│   │   └── data/
│   │       └── route.ts          # API endpoint for full database dump
│   ├── analytics/
│   │   ├── descriptive/
│   │   │   └── page.tsx          # Descriptive analytics page
│   │   ├── diagnostic/
│   │   │   └── page.tsx          # Diagnostic analytics page
│   │   ├── predictive/
│   │   │   └── page.tsx          # Predictive analytics page
│   │   └── prescriptive/
│   │       └── page.tsx          # Prescriptive analytics page
│   ├── database/
│   │   └── page.tsx              # Database viewer page
│   ├── overview/
│   │   └── page.tsx              # System overview/presentation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── data/
│   └── database.json             # Database file with all data
├── lib/
│   └── jsonDatabase.ts           # File-based data helpers
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Database Schema

### Products Table (20 records)
- id, name, category, price, cost, stock, supplier

### Customers Table (20 records)
- id, name, email, phone, age, joinDate, totalPurchases, totalSpent

### Sales Table (20 records)
- id, date, customerId, productId, quantity, price, total, employeeId

### Employees Table (20 records)
- id, name, position, hireDate, salary, salesCount, department

### Inventory Table (20 records)
- id, productId, date, quantityIn, quantityOut, currentStock, reorderLevel

## Analytics Methodologies

### Descriptive Analytics
- Statistical measures (mean, median, totals, averages)
- Data visualizations (charts and graphs)
- Summary tables

### Diagnostic Analytics
- Correlation analysis
- Trend identification
- Performance comparisons
- Root cause analysis

### Predictive Analytics
- Linear regression for forecasting
- Trend extrapolation
- Demand prediction
- Revenue forecasting

### Prescriptive Analytics
- Actionable recommendations
- Optimization suggestions
- Strategic planning insights
- Decision support

## Printing

All pages are optimized for printing. Use your browser's print function (Ctrl+P / Cmd+P) to generate PDFs or print reports. Navigation elements are automatically hidden when printing.

## Technologies Used

- **Next.js 14**: React framework for production
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization

## Project Requirements Met

✅ Database with 5+ variables  
✅ 20+ data sets per variable  
✅ Descriptive analytics  
✅ Diagnostic analytics  
✅ Predictive analytics  
✅ Prescriptive analytics  
✅ System overview/presentation  
✅ Next.js implementation  
✅ Printable format  

## Author

Business Analytics Final Project

## License

This project is created for educational purposes.

