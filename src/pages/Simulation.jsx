import React, { useState, useEffect } from 'react';
import { Server, Database, RotateCcw, ArrowRight, Clock, Users } from 'lucide-react';

// Simulated service types
const ServiceTypes = {
  API_GATEWAY: 'API Gateway',
  AUTH: 'Auth Service',
  USER: 'User Service',
  PAYMENT: 'Payment Service',
  DATABASE: 'Database'
};

// Animation states for services
const AnimationStates = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed'
};

const Simulation = () => {
  // Existing state from your component
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [dropdownValue, setDropdownValue] = useState("");
  
  // New simulation states 
  const [isSimulating, setIsSimulating] = useState(false);
  const [services, setServices] = useState({});
  const [connections, setConnections] = useState([]);
  const [logs, setLogs] = useState([]);

  // Initialize services
  useEffect(() => { 
    setServices({
      gateway: { type: ServiceTypes.API_GATEWAY, state: AnimationStates.IDLE, load: 0 },
      auth: { type: ServiceTypes.AUTH, state: AnimationStates.IDLE, load: 0 },
      user: { type: ServiceTypes.USER, state: AnimationStates.IDLE, load: 0 },
      payment: { type: ServiceTypes.PAYMENT, state: AnimationStates.IDLE, load: 0 },
      db: { type: ServiceTypes.DATABASE, state: AnimationStates.IDLE, load: 0 }
    });
  }, []);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-5));
  };

  const simulateRequest = async () => {
    setIsSimulating(true);
    const requests = parseInt(sliderValue);
    
    // Reset states
    setServices(prev => Object.keys(prev).reduce((acc, key) => ({
      ...acc,
      [key]: { ...prev[key], state: AnimationStates.IDLE, load: 0 }
    }), {}));
    setLogs([]);

    // Simulate API Gateway receiving requests
    addLog(`Receiving ${requests} requests at API Gateway`);
    await updateService('gateway', AnimationStates.PROCESSING, requests);

    // Auth service processing
    addLog('Authenticating requests...');
    await updateService('auth', AnimationStates.PROCESSING, Math.ceil(requests * 0.8));
    
    // User service handling
    addLog('Processing user data...');
    await updateService('user', AnimationStates.PROCESSING, Math.ceil(requests * 0.6));
    
    // Payment service (if selected in dropdown)
    if (dropdownValue === 'Option 1') {
      addLog('Processing payments...');
      await updateService('payment', AnimationStates.PROCESSING, Math.ceil(requests * 0.4));
    }

    // Database operations
    addLog('Saving to database...');
    await updateService('db', AnimationStates.PROCESSING, Math.ceil(requests * 0.3));

    // Complete simulation
    addLog('Request processing complete!');
    setIsSimulating(false);
  };

  const updateService = async (serviceId, state, load) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], state, load }
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Handle the Run button click
  const handleRunClick = () => {
    simulateRequest();
  };

  // Service node component
  const ServiceNode = ({ type, state, load }) => (
    <div className={`
      flex flex-col items-center justify-center p-4 rounded-lg border-2
      ${state === AnimationStates.PROCESSING ? 'border-blue-500 animate-pulse' : 'border-gray-300'}
      ${state === AnimationStates.COMPLETE ? 'border-green-500' : ''}
      ${state === AnimationStates.FAILED ? 'border-red-500' : ''}
    `}>
      {type === ServiceTypes.DATABASE ? (
        <Database className="w-8 h-8 mb-2" />
      ) : (
        <Server className="w-8 h-8 mb-2" />
      )}
      <div className="text-sm font-medium">{type}</div>
      {load > 0 && (
        <div className="mt-2 text-xs">
          Load: {load} req/s
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex min-h-screen pt-[4%] pb-1 px-2">
        <div className="w-full flex rounded-lg">
          {/* Left Sidebar (20%) with rounded border */}
          <div className="w-1/5 p-4 border-2 border-primary rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Simulation Config</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="System name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Description</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="System description..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Requests per second</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(e.target.value)}
                className="range"
              />
              <p>Value: {sliderValue} req/s</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Simulation Type</label>
              <select
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Basic Flow</option>
                <option value="Option 1">With Payment Processing</option>
                <option value="Option 2">High Availability</option>
                <option value="Option 3">Fault Tolerance</option>
              </select>
            </div>

            <button
              onClick={handleRunClick}
              disabled={isSimulating}
              className="btn btn-primary w-full"
            >
              {isSimulating ? (
                <><RotateCcw className="animate-spin mr-2" /> Simulating...</>
              ) : (
                'Run Simulation'
              )}
            </button>
          </div>

          {/* Right Output Section (80%) */}
          <div className="w-4/5 p-4">
            <h1 className="text-3xl font-bold mb-4">System Simulation</h1>
            
            {/* Service Architecture Visualization */}
            <div className="bg-base-200 p-6 rounded-lg mb-4">
              <div className="grid grid-cols-5 gap-4">
                <ServiceNode {...services.gateway} />
                <ServiceNode {...services.auth} />
                <ServiceNode {...services.user} />
                <ServiceNode {...services.payment} />
                <ServiceNode {...services.db} />
              </div>
            </div>

            {/* Simulation Logs */}
            <div className="bg-base-300 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Simulation Logs</h3>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;