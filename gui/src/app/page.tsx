import Link from 'next/link';
import { Button } from './components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">ChatSphere</h1>
        <nav className="flex items-center space-x-6">
          <Link href="/docs" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Documentation
          </Link>
          <Link 
            href="https://github.com/swarnikaraj/chatsphere" 
            target="_blank"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            GitHub
          </Link>
          <Link href="/login">
            <Button variant="primary">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Real-Time Chat with <span className="text-indigo-600">Voice & Face Recognition</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Experience secure, real-time communication with speech-to-text transcription and facial authentication.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Voice Chat</h3>
            <p className="text-gray-600">Convert your speech to text seamlessly and communicate naturally.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Face Authentication</h3>
            <p className="text-gray-600">Secure login with facial recognition technology for enhanced security.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Group Chats</h3>
            <p className="text-gray-600">Create rooms and invite friends for collaborative conversations.</p>
          </div>
        </section>
      </main>

      <footer className="bg-white mt-16 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} ChatSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}