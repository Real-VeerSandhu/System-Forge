import React, { useState, useEffect } from 'react';
import { Server, Database, RotateCcw, ArrowRight, Clock, Users } from 'lucide-react';

// Simulation protocols
const Protocols = {
  HTTP: 'HTTP/REST',
  GRPC: 'gRPC',
  MQTT: 'MQTT',
  TCP: 'TCP/IP',
};

// Message types
const MessageTypes = {
  REQUEST: 'REQUEST',
  RESPONSE: 'RESPONSE',
  EVENT: 'EVENT',
};

const SystemSimulation = () => {
  // Simulation configuration states
  const [requestRate, setRequestRate] = useState(50);
  const [protocol, setProtocol] = useState(Protocols.HTTP);
  const [latency, setLatency] = useState(100);
  const [errorRate, setErrorRate] = useState(0);
  const [concurrentUsers, setConcurrentUsers] = useState(10);
  const [cacheEnabled, setCacheEnabled] = useState(false);
  
  // Simulation runtime states
  const [isSimulating, setIsSimulating] = useState(false);
  const [services, setServices] = useState({});
  const [activeMessages, setActiveMessages] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successRate: 100,
    avgLatency: 0,
    cacheHits: 0,
  });
  const [logs, setLogs] = useState([]);

  // Initialize services with proper database metrics
  useEffect(() => {
    setServices({
      gateway: { 
        type: 'API Gateway',
        health: 100,
        connections: ['auth', 'cache'],
        metrics: { requests: 0, errors: 0 }
      },
      auth: { 
        type: 'Auth Service',
        health: 100,
        connections: ['user', 'cache'],
        metrics: { requests: 0, errors: 0 }
      },
      cache: {
        type: 'Cache Layer',
        health: 100,
        connections: ['db'],
        metrics: { hits: 0, misses: 0 }
      },
      user: { 
        type: 'User Service',
        health: 100,
        connections: ['db'],
        metrics: { requests: 0, errors: 0 }
      },
      db: { 
        type: 'Database',
        health: 100,
        connections: [],
        metrics: { requests: 0, reads: 0, writes: 0, errors: 0 }  // Added proper database metrics
      }
    });
  }, []);

  // Simulate message passing between services
  const simulateMessage = async (from, to, data) => {
    const messageId = Date.now();
    const delay = Math.random() * latency;
    
    // Add message to active messages
    setActiveMessages(prev => [...prev, {
      id: messageId,
      from,
      to,
      data,
      progress: 0
    }]);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Update service metrics
    setServices(prev => {
      const newServices = { ...prev };
      
      // Update general request count
      newServices[to] = {
        ...newServices[to],
        metrics: {
          ...newServices[to].metrics,
          requests: (newServices[to].metrics.requests || 0) + 1
        }
      };

      // Special handling for database operations
      if (to === 'db') {
        const isWrite = data.payload?.operation === 'WRITE';
        newServices.db.metrics = {
          ...newServices.db.metrics,
          reads: newServices.db.metrics.reads + (isWrite ? 0 : 1),
          writes: newServices.db.metrics.writes + (isWrite ? 1 : 0)
        };
      }

      return newServices;
    });

    // Remove message after animation
    setActiveMessages(prev => prev.filter(m => m.id !== messageId));
    
    // Simulate errors based on error rate
    if (Math.random() < errorRate / 100) {
      throw new Error(`Service ${to} failed to process message`);
    }
  };

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type
    }].slice(-10));
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Reset metrics at the start of simulation
    setMetrics({
      totalRequests: 0,
      successRate: 100,
      avgLatency: 0,
      cacheHits: 0,
    });

    // Reset service metrics
    setServices(prev => {
      const newServices = { ...prev };
      Object.keys(newServices).forEach(key => {
        newServices[key].metrics = {
          ...newServices[key].metrics,
          requests: 0,
          errors: 0
        };
        if (key === 'db') {
          newServices[key].metrics.reads = 0;
          newServices[key].metrics.writes = 0;
        }
      });
      return newServices;
    });

    try {
      // Start processing requests
      for (let i = 0; i < requestRate; i++) {
        const requestId = Date.now() + i;
        addLog(`Processing request ${requestId}`);

        // API Gateway → Auth Service
        await simulateMessage('gateway', 'auth', {
          type: MessageTypes.REQUEST,
          payload: { requestId, timestamp: Date.now() }
        });

        // Check cache if enabled
        if (cacheEnabled) {
          const cacheHit = Math.random() > 0.5;
          if (cacheHit) {
            setMetrics(prev => ({
              ...prev,
              cacheHits: prev.cacheHits + 1
            }));
            addLog(`Cache hit for request ${requestId}`);
            continue;
          }
        }

        // Auth Service → User Service
        await simulateMessage('auth', 'user', {
          type: MessageTypes.REQUEST,
          payload: { requestId, authenticated: true }
        });

        // User Service → Database (READ operation)
        await simulateMessage('user', 'db', {
          type: MessageTypes.REQUEST,
          payload: { requestId, operation: 'READ' }
        });

        // Simulate occasional write operations
        if (Math.random() > 0.7) {  // 30% chance of write operation
          await simulateMessage('user', 'db', {
            type: MessageTypes.REQUEST,
            payload: { requestId, operation: 'WRITE' }
          });
        }

        setMetrics(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          avgLatency: (prev.avgLatency * prev.totalRequests + latency) / (prev.totalRequests + 1)
        }));
      }
    } catch (error) {
      addLog(error.message, 'error');
      setMetrics(prev => ({
        ...prev,
        successRate: (prev.successRate * prev.totalRequests - 1) / prev.totalRequests
      }));
    }

    setIsSimulating(false);
  };

  const ServiceNode = ({ id, service }) => (
    <div className={`
      relative p-4 rounded-lg border-2
      ${isSimulating ? 'animate-pulse border-blue-500' : 'border-gray-300'}
    `}>
      {service.type === 'Database' ? (
        <Database className="w-8 h-8 mb-2" />
      ) : (
        <Server className="w-8 h-8 mb-2" />
      )}
      <div className="text-sm font-medium">{service.type}</div>
      <div className="text-xs mt-2">
        {service.type === 'Database' ? (
          <>
            <div>Reads: {service.metrics.reads || 0}</div>
            <div>Writes: {service.metrics.writes || 0}</div>
            <div>Total: {service.metrics.requests || 0}</div>
          </>
        ) : (
          <>
            <div>Requests: {service.metrics.requests || 0}</div>
            {service.metrics.hits !== undefined && (
              <div>Cache Hits: {service.metrics.hits}</div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex min-h-screen pt-[4%] pb-1 px-2">
        <div className="w-full flex rounded-lg">
          {/* Left Sidebar */}
          <div className="w-1/5 p-4 border-2 border-primary rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Simulation Config</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Request Rate (req/s)</label>
              <input
                type="range"
                min="1"
                max="100"
                value={requestRate}
                onChange={(e) => setRequestRate(parseInt(e.target.value))}
                className="range"
              />
              <p>Value: {requestRate} req/s</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="select select-bordered w-full"
              >
                {Object.entries(Protocols).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Network Latency (ms)</label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={latency}
                onChange={(e) => setLatency(parseInt(e.target.value))}
                className="range"
              />
              <p>Value: {latency}ms</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Error Rate (%)</label>
              <input
                type="range"
                min="0"
                max="20"
                value={errorRate}
                onChange={(e) => setErrorRate(parseInt(e.target.value))}
                className="range"
              />
              <p>Value: {errorRate}%</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Concurrent Users</label>
              <input
                type="range"
                min="1"
                max="100"
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(parseInt(e.target.value))}
                className="range"
              />
              <p>Value: {concurrentUsers}</p>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cacheEnabled}
                  onChange={(e) => setCacheEnabled(e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm font-medium">Enable Caching</span>
              </label>
            </div>

            <button
              onClick={runSimulation}
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

          {/* Right Output Section */}
          <div className="w-4/5 p-4">
            <h1 className="text-3xl font-bold mb-4">System Simulation</h1>
            
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium">Total Requests</h3>
                <p className="text-2xl font-bold">{metrics.totalRequests}</p>
              </div>
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium">Success Rate</h3>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
              </div>
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium">Avg Latency</h3>
                <p className="text-2xl font-bold">{metrics.avgLatency.toFixed(0)}ms</p>
              </div>
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium">Cache Hits</h3>
                <p className="text-2xl font-bold">{metrics.cacheHits}</p>
              </div>
            </div>

            {/* Service Architecture Visualization */}
            <div className="bg-base-200 p-6 rounded-lg mb-4">
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(services).map(([id, service]) => (
                  <ServiceNode key={id} id={id} service={service} />
                ))}
              </div>
            </div>

            {/* Simulation Logs */}
            <div className="bg-base-300 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Simulation Logs</h3>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-sm font-mono ${
                      log.type === 'error' ? 'text-red-500' : ''
                    }`}
                  >
                    {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
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

export default SystemSimulation;