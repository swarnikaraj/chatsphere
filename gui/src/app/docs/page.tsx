import { Button } from '../components/ui/Button';
import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            ChatSphere
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/chat" className="text-gray-600 hover:text-indigo-600">
              Live Demo
            </Link>
            <Link 
              href="https://github.com/swarnikaraj/chatsphere"  
              target="_blank"
              className="text-gray-600 hover:text-indigo-600"
            >
              GitHub
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-20 space-y-1">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Documentation</h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a 
                      href={`#${section.id}`}
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {section.title}
                    </a>
                    {section.subsections && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {section.subsections.map((sub) => (
                          <li key={sub.id}>
                            <a 
                              href={`#${sub.id}`}
                              className="block px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              {sub.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">ChatSphere Documentation</h1>
              
              <section id="overview" className="mb-12 text-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-gray-700 mb-4">
                  ChatSphere is a real-time chat application with advanced features including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
                  <li>Secure face recognition authentication</li>
                  <li>Speech-to-text message input</li>
                  <li>Group chat functionality</li>
                  <li>Real-time messaging with WebSockets</li>
                </ul>
                <div className="flex space-x-4 text-gray-700">
                  <Link href="/login">
                    <Button variant="primary">Get Started</Button>
                  </Link>
                  <Link href="https://github.com/swarnikaraj/chatsphere" target="_blank">
                    <Button variant="outline">View on GitHub</Button>
                  </Link>
                </div>
              </section>

              <section id="authentication" className="mb-12 text-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
                <p className="text-gray-700 mb-4">
                  ChatSphere uses facial recognition for secure authentication. Users register with their
                  email, password, and a facial scan which is used for subsequent logins.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-gray-700">
                  <h3 className="text-lg font-medium mb-3" id="registration-flow">Registration Flow</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>User enters email, name, and password</li>
                    <li>User captures facial image via webcam</li>
                    <li>System stores facial data securely</li>
                    <li>Account is created</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  <h3 className="text-lg font-medium mb-3" id="login-flow">Login Flow</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>User enters email and password</li>
                    <li>User captures facial image via webcam</li>
                    <li>System compares with stored facial data</li>
                    <li>Access granted if match is successful</li>
                  </ol>
                </div>
              </section>

              <section id="features" className="mb-12 text-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                
                <div className="space-y-8">
                  <div id="real-time-chat" className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Real-Time Chat</h3>
                    <p className="text-gray-700 mb-3">
                      Messages are delivered instantly using WebSocket technology. The application
                      maintains persistent connections for low-latency communication.
                    </p>
                    <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono">
                        
                        {/* Example WebSocket connection code */}
                      <br />
                      const socket = new WebSocket(&apos;wss://api.chatsphere.com/ws&apos;);
                    </div>
                  </div>

                  <div id="speech-to-text" className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    <h3 className="text-lg font-medium mb-3">Speech-to-Text</h3>
                    <p className="text-gray-700 mb-3">
                      Users can dictate messages which are converted to text using google
                      Speech Recognition API.
                    </p>
                 
                  </div>

                  <div id="group-chats" className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    <h3 className="text-lg font-medium mb-3">Group Chats</h3>
                    <p className="text-gray-700 mb-3">
                      Users can create and manage group conversations with multiple participants.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 ">
                      <li>Create groups with custom names</li>
                      <li>Add/remove participants (Not implemented)</li>
                      <li>Admin controls for group owners (Not implemented)</li>
                      <li>Message history persistence</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="api-reference" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">API Reference</h2>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 text-white px-4 py-2 font-mono">
                      POST /api/auth/register
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">Register a new user account</p>
                      <h4 className="font-medium mb-2 text-gray-700">Request Body</h4>
                      <pre className="bg-gray-50 p-3  text-gray-700 rounded text-sm overflow-x-auto">
                        {`{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "faceImage": "base64encodedimage"
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 text-white px-4 py-2 font-mono">
                      POST /api/auth/login
                    </div>
                    <div className="p-4 text-gray-700">
                      <p className="text-gray-700 mb-3">Authenticate an existing user</p>
                      <h4 className="font-medium mb-2">Request Body</h4>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                        {`{
  "email": "user@example.com",
  "password": "securepassword123",
  "faceImage": "base64encodedimage"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              <section id="getting-started" className="mb-12">
  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Getting Started</h2>
  
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-lg font-medium mb-3 text-gray-800">Prerequisites</h3>
    <p className="text-gray-700 mb-4">
      Before running ChatSphere, you&apos;ll need to set up the following services:
    </p>

    <div className="space-y-6">
      {/* AWS Setup */}
      <div>
        <h4 className="font-medium text-gray-800 mb-2">1. AWS Rekognition Setup</h4>
        <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-600">
          <li>Create an AWS account at aws.amazon.com</li>
          <li>Navigate to IAM and create a new user with Rekognition access</li>
          <li>Save the AWS access key and secret key</li>
          <li>Enable Rekognition service in your AWS console</li>
        </ol>
        <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-x-auto">
          <span className="text-yellow-400"># Add to your .env file</span><br />
          AWS_ACCESS_KEY_ID=your_access_key<br />
          AWS_SECRET_ACCESS_KEY=your_secret_key<br />
          AWS_REGION=your_region
        </div>
      </div>

      {/* GCP Setup */}
      <div>
        <h4 className="font-medium text-gray-800 mb-2">2. Google Cloud Platform Setup</h4>
        <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-600">
          <li>Create a GCP account at console.cloud.google.com</li>
          <li>Create a new project</li>
          <li>Navigate to IAM & Admin Service Accounts</li>
          <li>Create a new service account and download the JSON key file</li>
        </ol>
        <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-x-auto">
          <span className="text-yellow-400"># Save the service account JSON as</span><br />
          gcp-service-account.json
        </div>
      </div>

      {/* Speech-to-Text Setup */}
      <div>
        <h4 className="font-medium text-gray-800 mb-2">3. Deploy Speech-to-Text Service</h4>
        <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-600">
          <li>Navigate to the speech-to-text folder</li>
          <li>Deploy to GCP Cloud Functions using gcloud CLI</li>
          <li>Copy the deployed function URL</li>
        </ol>
        <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-x-auto">
          <span className="text-green-400">$</span> cd speech-to-text<br />
          <span className="text-green-400">$</span> gcloud functions deploy speechToText \<br />
          &nbsp;&nbsp;--runtime nodejs18 \<br />
          &nbsp;&nbsp;--trigger-http \<br />
          &nbsp;&nbsp;--allow-unauthenticated
        </div>
      </div>

      {/* WebSocket Server Setup */}
      <div>
        <h4 className="font-medium text-gray-800 mb-2">4. Deploy WebSocket Server</h4>
        <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-600">
          <li>Build Docker image for WebSocket server</li>
          <li>Deploy to GCP Container Service</li>
        </ol>
        <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-x-auto">
          <span className="text-green-400">$</span> cd socket-server<br />
          <span className="text-green-400">$</span> docker build -t websocket-server .<br />
          <span className="text-green-400">$</span> docker tag websocket-server gcr.io/[PROJECT-ID]/websocket-server<br />
          <span className="text-green-400">$</span> docker push gcr.io/[PROJECT-ID]/websocket-server<br />
          <span className="text-green-400">$</span> gcloud run deploy websocket-server \<br />
          &nbsp;&nbsp;--image gcr.io/[PROJECT-ID]/websocket-server \<br />
          &nbsp;&nbsp;--platform managed
        </div>
      </div>
    </div>

    <h3 className="text-lg font-medium my-6 text-gray-800">Local Development</h3>
    <p className="text-gray-700 mb-4">
      After setting up all services, follow these steps to run ChatSphere locally:
    </p>
    <ol className="list-decimal pl-6 space-y-2 mb-4">
      <li className='text-gray-600'>Clone the repository</li>
      <li className='text-gray-600'>Install dependencies</li>
      <li className='text-gray-600'>Set up environment variables</li>
      <li className='text-gray-600'>Run the development server</li>
    </ol>
    <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-x-auto">
      <span className="text-green-400">$</span> git clone https://github.com/swarnikaraj/chatshpere.git<br />
      <span className="text-green-400">$</span> cd gui<br />
      <span className="text-green-400">$</span> cp example.env .env<br />
      <span className="text-yellow-400"># Update .env with your service URLs and credentials</span><br />
      <span className="text-green-400">$</span> npm install<br />
      <span className="text-green-400">$</span> npm run dev
    </div>

    <div className="mt-6 bg-blue-50 p-4 rounded">
      <h4 className="font-medium text-blue-800 mb-2">Important Environment Variables</h4>
      <div className="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-x-auto">
        NEXT_PUBLIC_WEBSOCKET_URL=your_websocket_url<br />
        NEXT_PUBLIC_SPEECH_TO_TEXT_URL=your_speech_to_text_url<br />
        AWS_ACCESS_KEY_ID=your_aws_access_key<br />
        AWS_SECRET_ACCESS_KEY=your_aws_secret_key<br />
        GCP_PROJECT_ID=your_gcp_project_id
      </div>
    </div>
  </div>
</section>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} ChatSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const sections = [
  {
    id: 'overview',
    title: 'Overview'
  },
  {
    id: 'authentication',
    title: 'Authentication',
    subsections: [
      { id: 'registration-flow', title: 'Registration Flow' },
      { id: 'login-flow', title: 'Login Flow' }
    ]
  },
  {
    id: 'features',
    title: 'Features',
    subsections: [
      { id: 'real-time-chat', title: 'Real-Time Chat' },
      { id: 'speech-to-text', title: 'Speech-to-Text' },
      { id: 'group-chats', title: 'Group Chats' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference'
  },
  {
    id: 'getting-started',
    title: 'Getting Started'
  }
];