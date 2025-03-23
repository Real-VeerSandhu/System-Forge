import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DataPipelineSimulationTest = () => {
  // State for input controls
  const [parallelism, setParallelism] = useState(2);
  const [bufferSize, setBufferSize] = useState(50);
  const [processingTime, setProcessingTime] = useState(200);
  const [ingestRate, setIngestRate] = useState(100);
  const [surgeMultiplier, setSurgeMultiplier] = useState(5);
  const [pipelineType, setPipelineType] = useState("standard");
  const [isRunning, setIsRunning] = useState(false);
  const [surgeTrigger, setSurgeTrigger] = useState(false);
  
  // State for simulation data
  const [throughputData, setThroughputData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [backpressureData, setBackpressureData] = useState([]);
  
  // Current time in simulation
  const [currentTime, setCurrentTime] = useState(0);
  
  // Refs for animation
  const animationRef = useRef();
  const surgeTimeoutRef = useRef();
  
  // Output summary
  const [output, setOutput] = useState({
    parallelism: 2,
    bufferSize: 50,
    processingTime: 200,
    ingestRate: 100,
    pipelineType: "standard",
    avgThroughput: 0,
    avgLatency: 0,
    avgCpuUsage: 0,
    maxBackpressure: 0
  });

  // Initialize simulation data
  useEffect(() => {
    if (isRunning) {
      resetSimulationData();
      runSimulation();
    } else {
      cancelAnimationFrame(animationRef.current);
      if (surgeTimeoutRef.current) clearTimeout(surgeTimeoutRef.current);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (surgeTimeoutRef.current) clearTimeout(surgeTimeoutRef.current);
    };
  }, [isRunning]);

  // Reset simulation data
  const resetSimulationData = () => {
    setThroughputData([]);
    setLatencyData([]);
    setCpuData([]);
    setBackpressureData([]);
    setCurrentTime(0);
    setSurgeTrigger(false);
  };

  // Handle run button click
  const handleRunClick = () => {
    setOutput({
      parallelism,
      bufferSize,
      processingTime,
      ingestRate,
      pipelineType,
      avgThroughput: 0,
      avgLatency: 0,
      avgCpuUsage: 0,
      maxBackpressure: 0
    });
    
    setIsRunning(!isRunning);
    if (isRunning) {
      resetSimulationData();
    }
  };

  // Handle surge button click
  const handleSurgeClick = () => {
    if (isRunning) {
      setSurgeTrigger(true);
      
      // Reset surge after 5 seconds
      surgeTimeoutRef.current = setTimeout(() => {
        setSurgeTrigger(false);
      }, 5000);
    }
  };

  // Run simulation loop
  const runSimulation = () => {
    const updateInterval = 1000; // Update every 1 second
    let lastUpdateTime = 0;
    
    const animate = (timestamp) => {
      if (!lastUpdateTime) lastUpdateTime = timestamp;
      
      const deltaTime = timestamp - lastUpdateTime;
      
      if (deltaTime > updateInterval) {
        updateSimulationData();
        lastUpdateTime = timestamp;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Update simulation data
  const updateSimulationData = () => {
    setCurrentTime(prevTime => prevTime + 1);
    
    // Calculate new data points based on current settings
    // 1. Calculate input rate (with surge if active)
    const effectiveIngestRate = surgeTrigger ? ingestRate * surgeMultiplier : ingestRate;
    
    // 2. Calculate throughput based on parallelism and processing time
    const maxThroughput = (1000 / processingTime) * parallelism;
    const actualThroughput = Math.min(effectiveIngestRate, maxThroughput);
    
    // 3. Calculate backpressure (0-100%)
    const backpressurePercent = Math.max(0, Math.min(100, ((effectiveIngestRate - actualThroughput) / effectiveIngestRate) * 100));
    
    // 4. Calculate latency (ms)
    let basePipelineLatency;
    if (pipelineType === "standard") {
      basePipelineLatency = processingTime;
    } else if (pipelineType === "complex") {
      basePipelineLatency = processingTime * 1.5;
    } else {
      basePipelineLatency = processingTime * 0.8;
    }
    
    // Add backpressure penalty to latency
    const latency = basePipelineLatency * (1 + (backpressurePercent / 100) * 2);
    
    // 5. Calculate CPU usage (0-100%)
    const baseLoad = (actualThroughput / maxThroughput) * 70; // Base load at 70% max
    const backpressureLoad = backpressurePercent * 0.3; // Additional load from backpressure
    const cpuUsage = Math.min(100, baseLoad + backpressureLoad);
    
    // Add data points to charts
    const newDataPoint = { 
      time: currentTime, 
      throughput: actualThroughput,
      latency,
      cpuUsage,
      backpressure: backpressurePercent
    };
    
    setThroughputData(prev => [...prev, newDataPoint].slice(-10));
    setLatencyData(prev => [...prev, newDataPoint].slice(-10));
    setCpuData(prev => [...prev, newDataPoint].slice(-10));
    setBackpressureData(prev => [...prev, newDataPoint].slice(-10));
    
    // Update output summary with averages
    if (currentTime > 0) {
      const avgThroughput = throughputData.reduce((sum, item) => sum + item.throughput, 0) / throughputData.length;
      const avgLatency = latencyData.reduce((sum, item) => sum + item.latency, 0) / latencyData.length;
      const avgCpuUsage = cpuData.reduce((sum, item) => sum + item.cpuUsage, 0) / cpuData.length;
      const maxBackpressure = Math.max(...backpressureData.map(item => item.backpressure), 0);
      
      setOutput(prev => ({
        ...prev,
        avgThroughput: avgThroughput.toFixed(2),
        avgLatency: avgLatency.toFixed(2),
        avgCpuUsage: avgCpuUsage.toFixed(2),
        maxBackpressure: maxBackpressure.toFixed(2)
      }));
    }
  };

  return (
    <div>
      {/* Main Content Container with Border and Padding */}
      <div className="flex min-h-screen pt-4 pb-1 px-2">
        {/* Padding from the top and sides */}
        <div className="w-full flex rounded-lg">
          {/* Left Sidebar (25%) with rounded border */}
          <div className="w-1/4 p-4 border-2 border-primary rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Pipeline Configuration</h2>
            
            {/* Parallelism Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Parallelism (Workers)</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={parallelism} 
                onChange={(e) => setParallelism(parseInt(e.target.value))} 
                className="range" 
                disabled={isRunning}
              />
              <p>Value: {parallelism}</p>
            </div>
            
            {/* Buffer Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Buffer Size (MB)</label>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="10" 
                value={bufferSize} 
                onChange={(e) => setBufferSize(parseInt(e.target.value))} 
                className="range" 
                disabled={isRunning}
              />
              <p>Value: {bufferSize}</p>
            </div>
            
            {/* Processing Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Processing Time (ms)</label>
              <input 
                type="range" 
                min="50" 
                max="500" 
                step="50" 
                value={processingTime} 
                onChange={(e) => setProcessingTime(parseInt(e.target.value))} 
                className="range" 
                disabled={isRunning}
              />
              <p>Value: {processingTime}</p>
            </div>
            
            {/* Ingest Rate */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Ingest Rate (events/sec)</label>
              <input 
                type="range" 
                min="10" 
                max="500" 
                step="10" 
                value={ingestRate} 
                onChange={(e) => setIngestRate(parseInt(e.target.value))} 
                className="range" 
                disabled={isRunning}
              />
              <p>Value: {ingestRate}</p>
            </div>
            
            {/* Surge Multiplier */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Data Tsunami Multiplier</label>
              <input 
                type="range" 
                min="2" 
                max="10" 
                value={surgeMultiplier} 
                onChange={(e) => setSurgeMultiplier(parseInt(e.target.value))} 
                className="range" 
                disabled={isRunning}
              />
              <p>Value: {surgeMultiplier}x</p>
            </div>
            
            {/* Pipeline Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Pipeline Architecture</label>
              <select 
                value={pipelineType} 
                onChange={(e) => setPipelineType(e.target.value)} 
                className="select select-bordered w-full"
                disabled={isRunning}
              >
                <option value="optimized">Optimized</option>
                <option value="standard">Standard</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            
            {/* Run Button */}
            <button 
              onClick={handleRunClick} 
              className={`btn w-full mb-2 ${isRunning ? "btn-error" : "btn-primary"}`}
            >
              {isRunning ? "Stop Simulation" : "Run Simulation"}
            </button>
            
            {/* Tsunami Button */}
            <button 
              onClick={handleSurgeClick} 
              className="btn btn-warning w-full"
              disabled={!isRunning || surgeTrigger}
            >
              Trigger Data Tsunami
            </button>
          </div>
          
          {/* Right Output Section (75%) */}
          <div className="w-3/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Data Pipeline Simulation</h1>
              <div className="badge badge-lg">
                {isRunning ? 
                  <span className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span> Running
                  </span> : 
                  <span className="flex items-center">
                    <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span> Stopped
                  </span>
                }
                {surgeTrigger && <span className="ml-2 badge badge-warning">Data Tsunami Active!</span>}
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Throughput Chart */}
              <div className="border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Throughput (events/sec)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={throughputData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="throughput" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Latency Chart */}
              <div className="border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Latency (ms)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="latency" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* CPU Usage Chart */}
              <div className="border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">CPU Usage (%)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cpuData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="cpuUsage" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Backpressure Chart */}
              <div className="border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Backpressure (%)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backpressureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="backpressure" stroke="#ff0000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Performance Summary */}
            <div className="mt-4 border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Pipeline Performance Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Configuration:</strong></p>
                  <ul className="list-disc ml-5">
                    <li>Parallelism: {output.parallelism} worker(s)</li>
                    <li>Buffer Size: {output.bufferSize} MB</li>
                    <li>Processing Time: {output.processingTime} ms</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Performance Metrics:</strong></p>
                  <ul className="list-disc ml-5">
                    <li>Avg. Throughput: {output.avgThroughput} events/sec</li>
                    <li>Avg. Latency: {output.avgLatency} ms</li>
                    <li>Avg. CPU Usage: {output.avgCpuUsage}%</li>
                    <li>Max Backpressure: {output.maxBackpressure}%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPipelineSimulationTest;