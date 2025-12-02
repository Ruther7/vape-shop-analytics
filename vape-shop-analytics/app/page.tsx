import Link from 'next/link'

const tiles = [
  {
    href: '/analytics/descriptive',
    icon: '📈',
    title: 'Descriptive Analytics',
    copy: 'See what sold today, top flavors, and quick register stats.'
  },
  {
    href: '/analytics/predictive',
    icon: '🔮',
    title: 'Predictive Analytics',
    copy: 'Plan reorders and weekend promos with simple forecasts.'
  },
  {
    href: '/analytics/prescriptive',
    icon: '💡',
    title: 'Prescriptive Analytics',
    copy: 'Pairings, bundles, and talking points ready for the floor.'
  },
  {
    href: '/database',
    icon: '🗃️',
    title: 'Database Records',
    copy: 'Browse the tables if you need to double-check stock or vendors.'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">CloudBurst Vape Shop</h1>
          <p className="text-xl text-gray-600 mb-8">Neighborhood vape lounge + inventory headquarters</p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <p className="text-gray-700 mb-2">
              Fresh drops, honest gear, and the tools we use to keep the shop running smooth.
            </p>
            <p className="text-gray-500 text-sm">Tap into whatever you need before opening the doors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="no-print">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 h-full flex flex-col">
                <div className="text-4xl mb-4">{tile.icon}</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{tile.title}</h2>
                <p className="text-gray-600 flex-grow">{tile.copy}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">Made for the everyday crew at Cloudburst Vape</p>
        </div>
      </div>
    </div>
  )
}

