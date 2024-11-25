import { Play, Info } from 'lucide-react'
import './App.css'

function App() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="absolute top-0 z-50 w-full flex items-center justify-between p-4">
                <img src="images/logo.png" alt="Netflix" className="w-24" />
                <nav>
                    <ul className="flex space-x-4">
                        <li>Home</li>
                        <li>Live</li>
                        <li>Categories</li>
                        <li>New & Popular</li>
                    </ul>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative h-screen w-screen">
                <img
                    src="http://localhost:3000/thumbnails/1/thumbnail.jpg"
                    alt="Featured Movie"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
                <div className="absolute bottom-1/4 left-16 max-w-xl">
                    <h1 className="text-5xl font-bold mb-4">Best of Y Combinator</h1>
                    <p className="text-lg mb-6">
                        The best content from YC streaming 24 hours a day. Including interviews, advice and insights from a huge back catlog of content.
                    </p>
                    <div className="flex space-x-4">
                        <button className="bg-white text-black px-4 py-2 rounded flex items-center space-x-2">
                            <Play className="w-5 h-5" />
                            <span>Play</span>
                        </button>
                        <button className="bg-gray-500 bg-opacity-50 px-4 py-2 rounded flex items-center space-x-2">
                            <Info className="w-5 h-5" />
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section className="px-16 py-8">
                <h2 className="text-2xl font-semibold mb-4">Trending Now</h2>
                <div className="grid grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="relative aspect-video rounded-md overflow-hidden hover:scale-105 transition-transform duration-200">
                            <img
                                src={"http://localhost:3000/thumbnails/1/thumbnail.jpg"}
                                alt={`Trending Movie ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default App

