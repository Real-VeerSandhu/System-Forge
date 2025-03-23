import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Database, Server, ArrowRight, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive } from 'lucide-react';

const DataPipelineSimulator = () => {
  // State for input fields
  const [name, setName] = useState('Production Data Pipeline');
  const [processingMode, setProcessingMode] = useState('stream');
  const [dataVolume, setDataVolume] = useState(60);
  const [partitions, setPartitions] = useState(4);
  const [parallelism, setParallelism] = useState(4);
  const [windowSize, setWindowSize] = useState(10);
  const [backpressureLimit, setBackpressureLimit] = useState(70);
  const [isRunning, setIsRunning] = useState(false);
  
  // State for simulation data
  const [simulationTime, setSimulationTime] = useState(0);
  const [throughputData, setThroughputData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);
  const [coreUtilization, setCoreUtilization] = useState([]);
  const [systemLoad, setSystemLoad] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('idle');
  
  const simulationInterval = useRef(null);
  
  // Generate deterministic values based on configuration
  const generateSimulationData = () => {
    const isStreaming = processingMode === 'stream';
    const newTime = simulationTime + 1;
    
    // Calculate base throughput - actual simulation based on configuration
    const maxThroughput = dataVolume * 20; // Maximum theoretical throughput
    
    // Determine core utilization - each core gets a different workload based on its position
    let newCoreUtil = [];
    for (let i = 0; i < parallelism; i++) {
      // Core utilization based on deterministic factors
      const corePosition = i + 1;
      
      // Complex but deterministic formula for core utilization
      let coreLoad;
      
      if (isStreaming) {
        // In streaming, cores tend to have more balanced loads
        // Early cores handle partitioning and initial processing
        // Later cores handle aggregations and output
        if (corePosition <= Math.ceil(parallelism / 3)) {
          // First third of cores - data ingestion and partitioning
          coreLoad = 50 + (dataVolume / 2) * Math.sin(newTime / 10 + corePosition);
        } else if (corePosition <= Math.ceil(2 * parallelism / 3)) {
          // Middle third - processing and transformations
          coreLoad = 60 + (dataVolume / 3) * Math.cos(newTime / 8 + corePosition);
        } else {
          // Last third - aggregations and output
          coreLoad = 40 + (dataVolume / 4) * Math.sin(newTime / 12 + corePosition);
        }
        
        // Apply backpressure effect
        if (backpressureLimit < 50) {
          // Low backpressure limit causes higher core usage as system throttles
          coreLoad += (50 - backpressureLimit) * 0.6;
        }
      } else {
        // In batch processing, core utilization follows a more predictable pattern
        // Based on batch processing phase
        const batchCycleLength = windowSize * 2;
        const batchPhase = newTime % batchCycleLength;
        
        if (batchPhase < windowSize * 0.2) {
          // Initial data loading phase - higher load on early cores
          coreLoad = 80 + (corePosition <= 2 ? 15 : 0) - (corePosition > parallelism/2 ? 20 : 0);
        } else if (batchPhase < windowSize * 0.6) {
          // Main processing phase - all cores highly utilized
          coreLoad = 85 - Math.abs(corePosition - parallelism/2) * 3;
        } else if (batchPhase < windowSize * 0.9) {
          // Aggregation phase - higher load on later cores
          coreLoad = 75 - (corePosition <= 2 ? 20 : 0) + (corePosition > parallelism/2 ? 15 : 0);
        } else {
          // Result writing phase - reduced load
          coreLoad = 40 + (corePosition > parallelism/2 ? 20 : 0);
        }
        
        // Resource allocation affects all cores
        coreLoad = coreLoad * (backpressureLimit / 70);
      }
      
      // Ensure core load stays within reasonable bounds
      coreLoad = Math.max(10, Math.min(coreLoad, 98));
      
      newCoreUtil.push({
        name: `Core ${i+1}`,
        load: Math.round(coreLoad)
      });
    }
    
    // Calculate system-wide throughput based on core utilization
    const avgCoreUtil = newCoreUtil.reduce((sum, core) => sum + core.load, 0) / parallelism;
    const effectiveParallelism = parallelism * (avgCoreUtil / 100);
    
    // Throughput calculation - based on available processing power and data volume
    let throughputValue;
    
    if (isStreaming) {
      // Streaming throughput tends to be more consistent with occasional fluctuations
      const baseStreamingThroughput = maxThroughput * (effectiveParallelism / parallelism);
      
      // Backpressure affects streaming throughput significantly
      const backpressureFactor = Math.min(1, backpressureLimit / 100);
      
      // Add some cyclic patterns that would be seen in real systems
      const cycleEffect = Math.sin(newTime / 15) * (maxThroughput * 0.1);
      
      throughputValue = baseStreamingThroughput * backpressureFactor + cycleEffect;
    } else {
      // Batch processing has distinct phases
      const batchCycleLength = windowSize * 2;
      const batchPhase = newTime % batchCycleLength;
      
      if (batchPhase < windowSize * 0.2) {
        // Initial loading phase - ramping up
        throughputValue = maxThroughput * 0.5 * (batchPhase / (windowSize * 0.2));
      } else if (batchPhase < windowSize * 0.8) {
        // Main processing phase - high throughput
        throughputValue = maxThroughput * 0.8;
      } else if (batchPhase < windowSize * 0.9) {
        // Finalization phase - dropping off
        throughputValue = maxThroughput * 0.4;
      } else {
        // Idle between batches
        throughputValue = maxThroughput * 0.1;
      }
      
      // Resource allocation affects batch throughput
      throughputValue *= backpressureLimit / 100;
    }
    
    // Round throughput to nearest integer
    throughputValue = Math.round(throughputValue);
    
    // Calculate latency based on configuration and current load
    let latencyValue;
    
    if (isStreaming) {
      // Base streaming latency is low but increases with high utilization
      const baseLatency = 20 + (dataVolume / 10);
      
      // Backpressure significantly affects streaming latency
      const backpressureImpact = Math.max(1, Math.pow(100 / backpressureLimit, 2));
      
      // High core utilization increases latency
      const utilizationImpact = Math.pow(avgCoreUtil / 50, 2);
      
      latencyValue = baseLatency * utilizationImpact * backpressureImpact;
    } else {
      // Batch processing has much higher but more stable latency
      const batchCycleLength = windowSize * 2;
      const batchPhase = newTime % batchCycleLength;
      
      // Base batch latency depends on data volume and resource allocation
      const baseLatency = 100 + (dataVolume * 5);
      
      if (batchPhase < windowSize) {
        // During active processing, latency increases with phase
        latencyValue = baseLatency * (0.5 + batchPhase / windowSize);
      } else {
        // Between batches, latency drops
        latencyValue = baseLatency * 0.3;
      }
      
      // Resource allocation inversely affects batch latency
      latencyValue *= 100 / backpressureLimit;
    }
    
    // Round latency to integer
    latencyValue = Math.round(latencyValue);
    
    // Calculate system load - combination of I/O, memory, and CPU pressure
    const baseSystemLoad = avgCoreUtil * 0.7; // CPU component
    
    // I/O component - higher with more data volume
    const ioLoad = (dataVolume / 100) * 30;
    
    // Memory component - affected by window size and backpressure
    const memoryLoad = (windowSize / 20) * 10 + ((100 - backpressureLimit) / 100) * 20;
    
    // Calculate total system load
    const systemLoadValue = Math.min(100, Math.round(baseSystemLoad + ioLoad + memoryLoad));
    
    // Update all the data state
    setThroughputData(prev => {
      const newData = [...prev, { time: newTime, value: throughputValue }];
      return newData.length > 30 ? newData.slice(-30) : newData;
    });
    
    setLatencyData(prev => {
      const newData = [...prev, { time: newTime, value: latencyValue }];
      return newData.length > 30 ? newData.slice(-30) : newData;
    });
    
    setCoreUtilization(newCoreUtil);
    
    setSystemLoad(prev => {
      const newData = [...prev, { time: newTime, value: systemLoadValue }];
      return newData.length > 30 ? newData.slice(-30) : newData;
    });
    
    // Update pipeline status based on system load
    if (systemLoadValue > 90) {
      setPipelineStatus('warning');
    } else {
      setPipelineStatus('running');
    }
    
    // Update simulation time
    setSimulationTime(newTime);
  };
  
  // Handle start/stop simulation
  const handleRunClick = () => {
    if (isRunning) {
      // Stop simulation
      clearInterval(simulationInterval.current);
      setPipelineStatus('idle');
    } else {
      // Reset and start simulation
      setThroughputData([]);
      setLatencyData([]);
      setSystemLoad([]);
      setCoreUtilization(Array(parallelism).fill(0).map((_, i) => ({ name: `Core ${i+1}`, load: 0 })));
      setSimulationTime(0);
      setPipelineStatus('initializing');
      
      // Start simulation after brief delay
      setTimeout(() => {
        setPipelineStatus('running');
        simulationInterval.current = setInterval(generateSimulationData, 500);
      }, 600);
    }
    
    setIsRunning(!isRunning);
  };
  
  // Update core utilization when parallelism changes
  useEffect(() => {
    setCoreUtilization(Array(parallelism).fill(0).map((_, i) => ({ name: `Core ${i+1}`, load: 0 })));
  }, [parallelism]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);
  
  // Status indicator component
  const StatusIndicator = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'warning': return 'text-yellow-500';
        case 'running': return 'text-green-500';
        case 'initializing': return 'text-blue-500';
        default: return 'text-gray-500';
      }
    };
    
    const getStatusIcon = (status) => {
      switch (status) {
        case 'warning': return <AlertTriangle className="w-5 h-5" />;
        case 'running': return <Activity className="w-5 h-5" />;
        case 'initializing': return <Clock className="w-5 h-5" />;
        default: return <CheckCircle className="w-5 h-5" />;
      }
    };
    
    return (
      <div className={`flex items-center ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
        <span className="ml-2 capitalize">{status}</span>
      </div>
    );
  };
  
  // Get average values for metrics
  const getAverageThroughput = () => {
    if (throughputData.length === 0) return 0;
    return Math.round(throughputData.reduce((sum, item) => sum + item.value, 0) / throughputData.length);
  };
  
  const getAverageLatency = () => {
    if (latencyData.length === 0) return 0;
    return Math.round(latencyData.reduce((sum, item) => sum + item.value, 0) / latencyData.length);
  };
  
  const getAverageSystemLoad = () => {
    if (systemLoad.length === 0) return 0;
    return Math.round(systemLoad.reduce((sum, item) => sum + item.value, 0) / systemLoad.length);
  };
  
  // Simplified Pipeline Visualization component
  const SimplePipelineVisualization = () => {
    const isStreaming = processingMode === 'stream';
    
    // Define components based on pipeline mode
    const sourceComponent = isStreaming ? (
      <div className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">Source</div>
        <div className="flex items-center justify-center w-20 h-16 bg-blue-100 border border-blue-300 rounded-lg">
          <Activity className="w-6 h-6 text-blue-500" />
        </div>
        <div className="text-xs text-center mt-1">Kafka / Kinesis</div>
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">Source</div>
        <div className="flex items-center justify-center w-20 h-16 bg-gray-100 border border-gray-300 rounded-lg">
          <Database className="w-6 h-6 text-gray-500" />
        </div>
        <div className="text-xs text-center mt-1">S3 / HDFS</div>
      </div>
    );
    
    const processingComponent = isStreaming ? (
      <div className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">Processing</div>
        <div className="flex items-center justify-center w-20 h-16 bg-purple-100 border border-purple-300 rounded-lg">
          <Server className="w-6 h-6 text-purple-500" />
        </div>
        <div className="text-xs text-center mt-1">Flink / Spark</div>
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">Processing</div>
        <div className="flex items-center justify-center w-20 h-16 bg-purple-100 border border-purple-300 rounded-lg">
          <Server className="w-6 h-6 text-purple-500" />
        </div>
        <div className="text-xs text-center mt-1">Spark / MapReduce</div>
      </div>
    );
    
    const sinkComponent = isStreaming ? (
      <div className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">Sink</div>
        <div className="flex items-center justify-center w-20 h-16 bg-green-100 border border-green-300 rounded-lg">
          <Database className="w-6 h-6 text-green-500" />
        </div>
        <div className="text-xs text-center mt-1">ElasticSearch</div>
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">Sink</div>
        <div className="flex items-center justify-center w-20 h-16 bg-green-100 border border-green-300 rounded-lg">
          <Database className="w-6 h-6 text-green-500" />
        </div>
        <div className="text-xs text-center mt-1">Data Warehouse</div>
      </div>
    );
    
    const arrowComponent = (
      <div className="flex items-center justify-center px-3">
        <ArrowRight className="w-6 h-6 text-gray-400" />
      </div>
    );
    
    return (
      <div className="flex items-center justify-center mb-2">
        {sourceComponent}
        {arrowComponent}
        {processingComponent}
        {arrowComponent}
        {sinkComponent}
      </div>
    );
  };

  // Streaming vs Batch info
  const PipelineInfo = () => {
    const isStreaming = processingMode === 'stream';
    
    return (
      <div className="grid grid-cols-3 gap-2 text-sm mt-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <div className="font-medium">Source</div>
          <div>{isStreaming ? 'Message Queue (Kafka/Kinesis)' : 'File Storage (S3/HDFS)'}</div>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg">
          <div className="font-medium">Processing Pattern</div>
          <div>{isStreaming ? 'Continuous, event-by-event' : 'Periodic, micro-batch'}</div>
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <div className="font-medium">Data Freshness</div>
          <div>{isStreaming ? 'Near real-time (ms to s)' : 'Latent (minutes to hours)'}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex min-h-screen pt-[2%] pb-1 px-2">
        <div className="w-full flex rounded-lg">
          {/* Left Sidebar (20%) with configuration controls */}
          <div className="w-1/5 p-4 border-2 border-primary rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Pipeline Configuration</h2>

            {/* Pipeline name */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">Pipeline Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Processing Mode */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">Processing Mode</label>
              <select
                value={processingMode}
                onChange={(e) => setProcessingMode(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="stream">Stream Processing</option>
                <option value="batch">Batch Processing</option>
              </select>
            </div>

            {/* Data Volume */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">
                Data Volume {processingMode === 'stream' ? '(MB/s)' : '(GB/batch)'}
                <span className="float-right">{dataVolume}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={dataVolume}
                onChange={(e) => setDataVolume(e.target.value)}
                className="range"
              />
            </div>

            {/* Partitions */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">
                {processingMode === 'stream' ? 'Partitions' : 'Input Splits'}
                <span className="float-right">{partitions}</span>
              </label>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={partitions}
                onChange={(e) => setPartitions(e.target.value)}
                className="range"
              />
            </div>

            {/* Parallelism */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">
                Parallelism (Cores)
                <span className="float-right">{parallelism}</span>
              </label>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={parallelism}
                onChange={(e) => setParallelism(e.target.value)}
                className="range"
              />
            </div>

            {/* Window Size (for streaming) or Batch Interval (for batch) */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">
                {processingMode === 'stream' ? 'Window Size (s)' : 'Batch Interval (min)'}
                <span className="float-right">{windowSize}</span>
              </label>
              <input
                type="range"
                min="1"
                max={processingMode === 'stream' ? "30" : "60"}
                step="1"
                value={windowSize}
                onChange={(e) => setWindowSize(e.target.value)}
                className="range"
              />
            </div>

            {/* Backpressure Limit (for streaming) or Resource Allocation (for batch) */}
            <div className="mb-3">
              <label className="block text-sm font-medium pb-1">
                {processingMode === 'stream' ? 'Backpressure Limit' : 'Resource Allocation'}
                <span className="float-right">{backpressureLimit}%</span>
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={backpressureLimit}
                onChange={(e) => setBackpressureLimit(e.target.value)}
                className="range"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunClick}
              className={`btn w-full ${isRunning ? 'btn-error' : 'btn-primary'}`}
            >
              {isRunning ? 'Stop Pipeline' : 'Start Pipeline'}
            </button>
          </div>

          {/* Right Output Section (80%) */}
          <div className="w-4/5 p-4 border-2 border-gray-200 rounded-lg ml-4">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="flex items-center space-x-2">
                <StatusIndicator status={pipelineStatus} />
                <div className="ml-4 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                  Time: {simulationTime}s
                </div>
              </div>
            </div>

            {/* Pipeline Type Banner */}
            <div className="mb-3 py-2 px-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-semibold mr-2">Mode:</span>
                <span className="capitalize">{processingMode} Processing</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Optimized for:</span>
                <span>{processingMode === 'stream' ? 'Low Latency, Real-time Analytics' : 'High Throughput, Complex Aggregations'}</span>
              </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
              <h2 className="text-lg font-semibold mb-2">Pipeline Topology</h2>
              <SimplePipelineVisualization />
              <PipelineInfo />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Throughput</div>
                <div className="text-2xl font-bold">{getAverageThroughput()} {processingMode === 'stream' ? 'msgs/sec' : 'MB/sec'}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">Latency</div>
                <div className="text-2xl font-bold">{getAverageLatency()} {processingMode === 'stream' ? 'ms' : 'sec'}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-sm text-gray-500 mb-1">System Load</div>
                <div className="text-2xl font-bold">{getAverageSystemLoad()}%</div>
              </div>
            </div>

            {/* Charts - 2 rows with 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Throughput Chart */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-md font-semibold mb-1">Throughput</h2>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={throughputData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                        domain={[0, 'dataMax']}
                        type="number"
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} ${processingMode === 'stream' ? 'msgs/sec' : 'MB/sec'}`, 'Throughput']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Load Chart */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-md font-semibold mb-1">System Load</h2>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={systemLoad}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                        domain={[0, 'dataMax']}
                        type="number"
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Load']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Latency Chart */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-md font-semibold mb-1">Latency</h2>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                        domain={[0, 'dataMax']}
                        type="number"
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} ${processingMode === 'stream' ? 'ms' : 'sec'}`, 'Latency']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Core Utilization Chart */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-md font-semibold mb-1">Core Utilization</h2>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coreUtilization}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                      <Bar dataKey="load" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPipelineSimulator;