import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-screen bg-sudan-gradient">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-white">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">
              🇸🇩 Sudan Passport Renewal
            </h1>
            <p className="mb-5 text-lg">
              Streamlined, secure, and efficient passport renewal system for Sudanese citizens.
              Apply online with face recognition and document validation.
            </p>
            <button className="btn btn-sudan mr-4">
              Start Application
            </button>
            <button className="btn btn-outline btn-white">
              Check Status
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-sudan-gradient">
            System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-sudan">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📷</span>
                </div>
                <h3 className="card-title text-primary">Face Recognition</h3>
                <p>Advanced AI-powered face detection and validation for secure identity verification.</p>
                <div className="badge badge-success mt-2">AI Powered</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-sudan">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="card-title text-secondary">Document Validation</h3>
                <p>Automatic passport document scanning and verification using computer vision.</p>
                <div className="badge badge-info mt-2">CV Technology</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-sudan">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="card-title text-accent">Fast Processing</h3>
                <p>Multi-step form with real-time validation and instant feedback for users.</p>
                <div className="badge badge-warning mt-2">Real-time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test DaisyUI Components */}
      <div className="py-16 px-4 bg-base-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Component Test (Development Only)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Components */}
            <div className="card-sudan">
              <div className="card-body">
                <h3 className="card-title">Form Components</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Sudan input field" 
                    className="input-sudan" 
                  />
                  <select className="select-sudan">
                    <option>Select location</option>
                    <option>Khartoum</option>
                    <option>Omdurman</option>
                    <option>Kassala</option>
                  </select>
                  <textarea 
                    placeholder="Comments..." 
                    className="textarea-sudan" 
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Status Components */}
            <div className="card-sudan">
              <div className="card-body">
                <h3 className="card-title">Status Indicators</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="status-badge status-pending">Pending</span>
                    <span className="status-badge status-processing">Processing</span>
                    <span className="status-badge status-approved">Approved</span>
                    <span className="status-badge status-rejected">Rejected</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="btn-sudan">Primary Action</button>
                    <button className="btn-sudan-outline">Secondary</button>
                  </div>
                  
                  <div className="alert alert-success">
                    <span>✅ DaisyUI + Tailwind CSS working perfectly!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-primary text-primary-content">
        <div>
          <p className="font-bold text-lg">
            Sudan Passport Renewal System
          </p>
          <p>Republic of Sudan - Ministry of Interior</p>
          <p>Secure • Efficient • Digital</p>
        </div>
      </footer>
    </div>
  );
}
