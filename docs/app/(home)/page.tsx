import Link from 'next/link';


export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center items-center text-center p-8">
      {/* Hero Section */}
      <section className="mb-12 max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">
          Build Your Own Streaming Platform
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          Create a fully customized streaming experience tailored to your needs. Our headless API gives you the flexibility to build your own platform — whether its for on-demand video, live streaming, or more.
        </p>
        <Link
          href="/docs"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
        >
          Get Started with Documentation
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 max-w-6xl">
        <div className="flex flex-col items-center text-center p-6 border rounded-md shadow-sm">
          {/* <img src="https://via.placeholder.com/150" alt="Content Management" className="mb-4 w-24 h-24 object-cover rounded-full" /> */}
          <h3 className="text-xl font-semibold text-gray-800">Customizable Content Management</h3>
          <p className="text-gray-600">
            Easily upload, organize, and manage your media content with powerful tools that put you in control.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 border rounded-md shadow-sm">
          {/* <img src="https://via.placeholder.com/150" alt="Live Streaming" className="mb-4 w-24 h-24 object-cover rounded-full" /> */}
          <h3 className="text-xl font-semibold text-gray-800">Seamless Live Streaming</h3>
          <p className="text-gray-600">
            Set up high-quality live streams with ease, perfect for events, webinars, or broadcasting content in real-time.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 border rounded-md shadow-sm">
          {/* <img src="https://via.placeholder.com/150" alt="Scalable Infrastructure" className="mb-4 w-24 h-24 object-cover rounded-full" /> */}
          <h3 className="text-xl font-semibold text-gray-800">Scalable Infrastructure</h3>
          <p className="text-gray-600">
            Scale your platform effortlessly to accommodate millions of users with robust infrastructure and CDN support.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-12 max-w-3xl">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900">How It Works</h2>
        <p className="mb-6 text-lg text-gray-600">
          KodaStream is designed to be fully customizable and easy to deploy. With our headless API, you can clone the repo and get started without the need for accounts or complex configurations. Here’s how you can begin:
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 text-center p-6 border rounded-md shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800">1. Clone the Repo</h3>
            <p className="text-gray-600">
              Start by cloning the KodaStream repository from GitHub. No sign-up or API keys required—just clone and get started with the code!
            </p>
          </div>
          <div className="flex-1 text-center p-6 border rounded-md shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800">2. Build Your Custom UI</h3>
            <p className="text-gray-600">
              KodaStream is a headless platform that lets you build your own UI and customize media, events, content, and streams via the API.
            </p>
          </div>
          <div className="flex-1 text-center p-6 border rounded-md shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800">3. Go Live!</h3>
            <p className="text-gray-600">
              Once you’ve set up your content and UI, go live and start streaming! Engage your audience, monitor analytics, and scale your streams effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 text-white py-12 px-6 rounded-md shadow-md mb-12">
        <h2 className="mb-4 text-3xl font-semibold">Ready to Start Building?</h2>
        <p className="mb-6 text-lg">
          Dive right in and start creating your own custom streaming platform today. Our comprehensive documentation and resources are here to help you every step of the way.
        </p>
        <Link
          href="/docs"
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-md hover:bg-gray-100 transition"
        >
          View Documentation
        </Link>
      </section>

      {/* Footer Section */}
      <footer className="py-8 text-gray-600">
        <p>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link> |
          <Link href="/terms" className="text-gray-600 hover:text-gray-800"> Terms of Service</Link>
        </p>
      </footer>
    </main>
  );
}
