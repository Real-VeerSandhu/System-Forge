import React, { useState, useEffect } from 'react';
import { Database, FileText, PieChart, Cpu, RefreshCw, ArrowRight, Clock, RotateCcw, Zap, Settings, HardDrive, Server } from 'lucide-react';

// Simulated pipeline component types
const ComponentTypes = {
  DATA_SOURCE: 'Data Source',
  EXTRACTION: 'Extraction Service',
  TRANSFORMATION: 'Transformation Service',
  ANALYTICS: 'Analytics Engine',
  DATA_WAREHOUSE: 'Data Warehouse'
};

// Animation states for pipeline components
const AnimationStates = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed'
};

const DataPipelineSimulation = () => {
  // Configuration state
  const [dataVolume, setDataVolume] = useState(50);
  const [pipelineType, setPipelineType] = useState("");
  const [processingSpeed, setProcessingSpeed] = useState(1); // 1x, 2x, 3x speed
  const [compressionLevel, setCompressionLevel] = useState(3); // 1-5
  const [parallelism, setParallelism] = useState(2); // 1-5
  const [cachingEnabled, setCachingEnabled] = useState(true);
  const [errorSimulation, setErrorSimulation] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [components, setComponents] = useState({
    source: { type: ComponentTypes.DATA_SOURCE, state: AnimationStates.IDLE, load: 0, progress: 0 },
    extraction: { type: ComponentTypes.EXTRACTION, state: AnimationStates.IDLE, load: 0, progress: 0 },
    transformation: { type: ComponentTypes.TRANSFORMATION, state: AnimationStates.IDLE, load: 0, progress: 0 },
    analytics: { type: ComponentTypes.ANALYTICS, state: AnimationStates.IDLE, load: 0, progress: 0 },
    warehouse: { type: ComponentTypes.DATA_WAREHOUSE, state: AnimationStates.IDLE, load: 0, progress: 0 }
  });
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    throughput: 0,
    latency: 0,
    errorRate: 0,
    dataProcessed: 0,
    compressionRatio: 0,
    cpuUtilization: 0,
    memoryUsage: 0
  });
  
  // Data points for visualization
  const [dataPoints, setDataPoints] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [simulationTimer, setSimulationTimer] = useState(null);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message: `[${new Date().toLocaleTimeString()}] ${message}`, type }].slice(-15));
  };
  
  // Effect to update progress bars during simulation
  useEffect(() => {
    if (isSimulating) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Add a data point for visualization
        if (metrics.throughput > 0) {
          setDataPoints(prev => [
            ...prev, 
            { 
              time: elapsedTime, 
              throughput: metrics.throughput * (0.9 + Math.random() * 0.2),
              cpu: metrics.cpuUtilization * (0.85 + Math.random() * 0.3)
            }
          ].slice(-20));
        }
      }, 1000);
      
      setSimulationTimer(timer);
      return () => clearInterval(timer);
    } else if (simulationTimer) {
      clearInterval(simulationTimer);
    }
  }, [isSimulating, metrics.throughput, metrics.cpuUtilization, elapsedTime]);

  const simulatePipeline = async () => {
    setIsSimulating(true);
    setElapsedTime(0);
    setDataPoints([]);
    const dataSize = parseInt(dataVolume);
    
    // Reset states
    setComponents(prev => Object.keys(prev).reduce((acc, key) => ({
      ...acc,
      [key]: { ...prev[key], state: AnimationStates.IDLE, load: 0, progress: 0 }
    }), {}));
    setLogs([]);
    setMetrics({
      throughput: 0,
      latency: 0,
      errorRate: 0,
      dataProcessed: 0,
      compressionRatio: 0,
      cpuUtilization: 0,
      memoryUsage: 0
    });

    try {
      // Initial CPU and memory metrics
      setMetrics(prev => ({ 
        ...prev, 
        cpuUtilization: 15 + Math.random() * 10,
        memoryUsage: 20 + Math.random() * 15
      }));
      
      // Data source ingestion
      addLog(`Beginning data ingestion: ${dataSize} GB`, 'info');
      await simulateComponentProcessing('source', dataSize);
      
      setMetrics(prev => ({ 
        ...prev, 
        throughput: dataSize * 0.8 / processingSpeed, 
        dataProcessed: dataSize * 0.2,
        cpuUtilization: 25 + Math.random() * 15,
        memoryUsage: 30 + Math.random() * 10
      }));
      
      // Data extraction
      addLog('Extracting data from source systems...', 'info');
      const extractionLoad = Math.ceil(dataSize * 0.9);
      await simulateComponentProcessing('extraction', extractionLoad);
      
      setMetrics(prev => ({ 
        ...prev, 
        latency: dataSize * 0.5 / processingSpeed, 
        dataProcessed: dataSize * 0.4,
        cpuUtilization: 40 + Math.random() * 20,
        memoryUsage: 45 + Math.random() * 15,
        compressionRatio: compressionLevel * 1.5
      }));
      
      // Data transformation
      addLog('Transforming and normalizing data...', 'info');
      let transformationSuccess = true;
      
      // Simulating potential failure if error simulation enabled
      if (errorSimulation && Math.random() > 0.6) {
        transformationSuccess = false;
        addLog('ERROR: Transformation job failed - insufficient memory', 'error');
        
        await simulateComponentProcessing('transformation', Math.ceil(dataSize * 0.5), true);
        
        setMetrics(prev => ({ 
          ...prev, 
          errorRate: 35, 
          latency: prev.latency * 1.5,
          cpuUtilization: 90 + Math.random() * 10,
          memoryUsage: 85 + Math.random() * 15
        }));
        
        // Recovery attempt
        addLog('Attempting transformation recovery...', 'warning');
        await new Promise(resolve => setTimeout(resolve, 2000 / processingSpeed));
        transformationSuccess = Math.random() > 0.3; // 70% chance of recovery
        
        if (!transformationSuccess) {
          addLog('ERROR: Recovery failed - restarting transformation job', 'error');
          await new Promise(resolve => setTimeout(resolve, 1500 / processingSpeed));
          transformationSuccess = true;
        } else {
          addLog('Recovery successful - resuming transformation', 'success');
        }
      }
      
      if (transformationSuccess) {
        const transformationLoad = Math.ceil(dataSize * 0.7);
        await simulateComponentProcessing('transformation', transformationLoad);
        
        setMetrics(prev => ({ 
          ...prev, 
          dataProcessed: dataSize * 0.7,
          cpuUtilization: 60 + Math.random() * 20,
          memoryUsage: 55 + Math.random() * 20,
          compressionRatio: compressionLevel * 2.2
        }));
      }
      
      // Analytics processing (if selected in dropdown)
      if (pipelineType === 'Real-time Analytics' || pipelineType === 'Predictive Analytics') {
        addLog('Running analytics algorithms...', 'info');
        const analyticsLoad = Math.ceil(dataSize * 0.6);
        await simulateComponentProcessing('analytics', analyticsLoad);
        
        setMetrics(prev => ({ 
          ...prev, 
          throughput: prev.throughput * 0.7, 
          dataProcessed: dataSize * 0.9,
          cpuUtilization: 75 + Math.random() * 20,
          memoryUsage: 70 + Math.random() * 15
        }));
        
        if (pipelineType === 'Predictive Analytics') {
          addLog('Training machine learning models...', 'info');
          await new Promise(resolve => setTimeout(resolve, 3000 / processingSpeed));
          addLog('Models trained successfully', 'success');
        }
      }

      // Data warehouse loading
      addLog('Loading processed data to warehouse...', 'info');
      const warehouseLoad = Math.ceil(dataSize * 0.5);
      await simulateComponentProcessing('warehouse', warehouseLoad);
      
      setMetrics(prev => ({ 
        ...prev, 
        dataProcessed: dataSize,
        cpuUtilization: 45 + Math.random() * 15,
        memoryUsage: 50 + Math.random() * 10,
        compressionRatio: compressionLevel * 2.5
      }));

      // Complete simulation
      Object.keys(components).forEach(key => {
        if (components[key].state !== AnimationStates.FAILED) {
          updateComponent(key, AnimationStates.COMPLETE, components[key].load, 100);
        }
      });

      addLog('Data pipeline execution complete!', 'success');
    } catch (error) {
      addLog(`ERROR: ${error.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };
  
  const simulateComponentProcessing = async (componentId, load, isFailing = false) => {
    // Start processing
    updateComponent(componentId, AnimationStates.PROCESSING, load, 0);
    
    // Calculate total time based on load and processing speed
    const totalTime = (load * 100) / (processingSpeed * (parallelism * 0.5));
    const steps = 10;
    const stepTime = totalTime / steps;
    
    // Simulate progress increases
    for (let i = 1; i <= steps; i++) {
      if (isFailing && i > steps / 2) {
        updateComponent(componentId, AnimationStates.FAILED, load, (i / steps) * 100);
        break;
      }
      
      // Update progress
      await new Promise(resolve => setTimeout(resolve, stepTime));
      updateComponent(componentId, AnimationStates.PROCESSING, load, (i / steps) * 100);
      
      // Add some technical logs during processing
      if (i === Math.floor(steps / 3)) {
        const technicalLogs = [
          `Optimizing ${componentId} partitions: ${Math.floor(Math.random() * 20) + 5} partitions active`,
          `Buffer pool utilization at ${Math.floor(Math.random() * 40) + 60}%`,
          `Thread pool size: ${parallelism * 2} active workers`,
          cachingEnabled ? `Cache hit ratio: ${Math.floor(Math.random() * 30) + 70}%` : 'Caching disabled'
        ];
        addLog(technicalLogs[Math.floor(Math.random() * technicalLogs.length)], 'tech');
      }
    }
    
    if (!isFailing) {
      updateComponent(componentId, AnimationStates.COMPLETE, load, 100);
    }
  };

  const updateComponent = (componentId, state, load, progress) => {
    setComponents(prev => ({
      ...prev,
      [componentId]: { ...prev[componentId], state, load, progress }
    }));
  };

  // Component node rendering
  const PipelineComponent = ({ type, state, load, progress }) => {
    let Icon = FileText;
    
    // Select appropriate icon based on component type
    switch (type) {
      case ComponentTypes.DATA_SOURCE:
        Icon = Database;
        break;
      case ComponentTypes.EXTRACTION:
        Icon = FileText;
        break;
      case ComponentTypes.TRANSFORMATION:
        Icon = RefreshCw;
        break;
      case ComponentTypes.ANALYTICS:
        Icon = PieChart;
        break;
      case ComponentTypes.DATA_WAREHOUSE:
        Icon = Cpu;
        break;
      default:
        Icon = FileText;
    }
    
    return (
      <div className={`
        flex flex-col items-center justify-between p-4 rounded-lg border-2 shadow-md h-40 w-48
        ${state === AnimationStates.PROCESSING ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${state === AnimationStates.COMPLETE ? 'border-green-500 bg-green-50' : ''}
        ${state === AnimationStates.FAILED ? 'border-red-500 bg-red-50' : ''}
      `}>
        <div className="flex flex-col items-center">
          <Icon className={`w-10 h-10 mb-2 ${state === AnimationStates.PROCESSING ? 'animate-pulse' : ''}`} />
          <div className="text-sm font-medium text-center">{type}</div>
        </div>
        
        {load > 0 && (
          <div className="w-full mt-2 text-xs">
            <div className="flex justify-between mb-1">
              <span>{load} GB</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${state === AnimationStates.FAILED ? 'bg-red-500' : 'bg-blue-600'}`} 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Metrics component
  const MetricsDisplay = () => (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="bg-base-100 p-3 rounded-lg border shadow-sm">
        <div className="text-xs font-medium text-gray-500">Throughput</div>
        <div className="text-lg font-bold">{metrics.throughput.toFixed(1)} GB/s</div>
      </div>
      <div className="bg-base-100 p-3 rounded-lg border shadow-sm">
        <div className="text-xs font-medium text-gray-500">Latency</div>
        <div className="text-lg font-bold">{metrics.latency.toFixed(1)} ms</div>
      </div>
      <div className="bg-base-100 p-3 rounded-lg border shadow-sm">
        <div className="text-xs font-medium text-gray-500">CPU Utilization</div>
        <div className="text-lg font-bold">{metrics.cpuUtilization.toFixed(1)}%</div>
      </div>
      <div className="bg-base-100 p-3 rounded-lg border shadow-sm">
        <div className="text-xs font-medium text-gray-500">Memory Usage</div>
        <div className="text-lg font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
      </div>
    </div>
  );

  // Miniature chart for throughput
  const ThroughputChart = () => (
    <div className="h-24 flex items-end space-x-1">
      {dataPoints.map((point, index) => (
        <div 
          key={index} 
          className="bg-blue-500 w-3 rounded-t" 
          style={{ 
            height: `${Math.min(100, (point.throughput / (dataVolume * 0.1)) * 100)}%`,
            opacity: 0.5 + (index / dataPoints.length) * 0.5
          }}
        ></div>
      ))}
    </div>
  );
  
  // Miniature chart for CPU
  const CpuChart = () => (
    <div className="h-24 flex items-end space-x-1">
      {dataPoints.map((point, index) => (
        <div 
          key={index} 
          className="bg-purple-500 w-3 rounded-t" 
          style={{ 
            height: `${Math.min(100, point.cpu)}%`,
            opacity: 0.5 + (index / dataPoints.length) * 0.5
          }}
        ></div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex min-h-screen pt-[4%] pb-1 px-2">
        <div className="w-full flex rounded-lg">
          {/* Left Sidebar (20%) with rounded border */}
          <div className="w-1/5 p-4 border-2 border-primary rounded-lg overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Pipeline Config</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Data Volume (GB)</label>
              <input
                type="range"
                min="10"
                max="200"
                value={dataVolume}
                onChange={(e) => setDataVolume(e.target.value)}
                className="range"
              />
              <p>Value: {dataVolume} GB</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Processing Speed</label>
              <div className="flex space-x-2">
                {[1, 2, 3].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setProcessingSpeed(speed)}
                    className={`flex-1 py-1 rounded ${processingSpeed === speed ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Pipeline Type</label>
              <select
                value={pipelineType}
                onChange={(e) => setPipelineType(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Basic ETL</option>
                <option value="Batch Processing">Batch Processing</option>
                <option value="Real-time Analytics">Real-time Analytics</option>
                <option value="Predictive Analytics">Predictive Analytics</option>
              </select>
            </div>
            
            <div className="mb-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn btn-sm btn-ghost text-left w-full flex justify-between items-center"
              >
                <span>Advanced Options</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
              </button>
              
              {showAdvanced && (
                <div className="mt-2 space-y-3 p-3 bg-base-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium">Compression Level</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={compressionLevel}
                      onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                      className="range range-xs"
                    />
                    <div className="flex justify-between text-xs">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium">Parallelism</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={parallelism}
                      onChange={(e) => setParallelism(parseInt(e.target.value))}
                      className="range range-xs"
                    />
                    <div className="flex justify-between text-xs">
                      <span>1 Thread</span>
                      <span>5 Threads</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={cachingEnabled}
                      onChange={(e) => setCachingEnabled(e.target.checked)}
                      className="checkbox checkbox-sm mr-2"
                    />
                    <label className="text-sm">Enable Caching</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={errorSimulation}
                      onChange={(e) => setErrorSimulation(e.target.checked)}
                      className="checkbox checkbox-sm mr-2"
                    />
                    <label className="text-sm">Simulate Errors</label>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={simulatePipeline}
              disabled={isSimulating}
              className="btn btn-primary w-full"
            >
              {isSimulating ? (
                <><RotateCcw className="animate-spin mr-2" /> Simulating...</>
              ) : (
                'Run Pipeline'
              )}
            </button>
            
            {isSimulating && (
              <div className="mt-4 text-center">
                <div className="text-xl font-bold">{elapsedTime}s</div>
                <div className="text-sm text-gray-500">Elapsed Time</div>
              </div>
            )}
          </div>

          {/* Right Output Section (80%) */}
          <div className="w-4/5 p-4">
            <h1 className="text-3xl font-bold mb-4">Data Pipeline Simulation</h1>
            
            {/* Metrics Overview */}
            <MetricsDisplay />
            
            {/* Pipeline Architecture Visualization */}
            <div className="bg-base-200 p-6 rounded-lg mb-4">
              {/* Interactive data flow visualization */}
              <div className="grid grid-cols-12 gap-4">
                {/* First row */}
                <div className="col-span-4">
                  <PipelineComponent {...components.source} />
                </div>
                <div className="col-span-4">
                  <div className="h-40 flex items-center justify-center">
                    <div className={`w-full h-2 ${isSimulating && components.source.state === AnimationStates.PROCESSING ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                <div className="col-span-4">
                  <PipelineComponent {...components.extraction} />
                </div>
                
                {/* Charts row */}
                <div className="col-span-6">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-sm font-medium mb-2">Throughput (GB/s)</div>
                    <ThroughputChart />
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-sm font-medium mb-2">CPU Utilization (%)</div>
                    <CpuChart />
                  </div>
                </div>
                
                {/* Second row */}
                <div className="col-span-4">
                  <div className="h-40 flex items-center justify-center">
                    <div className={`h-full w-2 ${isSimulating && components.extraction.state === AnimationStates.PROCESSING ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                <div className="col-span-4">
                  <PipelineComponent {...components.transformation} />
                </div>
                <div className="col-span-4">
                  <div className="h-40 flex items-center justify-center">
                    <div className={`h-full w-2 ${isSimulating && components.transformation.state === AnimationStates.PROCESSING ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                


                
                {/* Third row */}
                <div className="col-span-4">
                  <PipelineComponent {...components.analytics} />
                </div>
                <div className="col-span-4">
                  <div className="h-40 flex items-center justify-center">
                    <div className={`w-full h-2 ${isSimulating && components.analytics.state === AnimationStates.PROCESSING ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                <div className="col-span-4">
                  <PipelineComponent {...components.warehouse} />
                </div>
              </div>
            </div>
            
            {/* Bottom section with logs */}
            <div className="bg-base-300 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Pipeline Logs</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`
                      px-2 py-1 rounded
                      ${log.type === 'error' ? 'text-red-600 bg-red-100' : ''}
                      ${log.type === 'warning' ? 'text-amber-600 bg-amber-100' : ''}
                      ${log.type === 'success' ? 'text-green-600 bg-green-100' : ''}
                      ${log.type === 'tech' ? 'text-purple-600 bg-purple-100' : ''}
                    `}
                  >
                    {log.message}
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

export default DataPipelineSimulation;