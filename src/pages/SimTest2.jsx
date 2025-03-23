import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash, Play, Pause, AlertTriangle } from 'lucide-react';

const DataPipelineSimulation = () => {
  // State for pipeline configuration
  const [dataSources, setDataSources] = useState([
    { id: 1, name: 'Source 1', dataRate: 50, enabled: true }
  ]);
  const [cores, setCores] = useState([
    { id: 1, speed: 50, utilization: 0, enabled: true }
  ]);
  const [batchSize, setBatchSize] = useState(50);
  const [bufferSize, setBufferSize] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [processingSpeed, setProcessingSpeed] = useState(0);
  const [systemLoad, setSystemLoad] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [simulationTime, setSimulationTime] = useState(0);
  
  const logEndRef = useRef(null);

  // Scroll to bottom of logs when new logs are added
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Add log message
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { id: Date.now(), message, timestamp, type }]);
    
    // Keep only the most recent 100 logs to prevent memory issues
    if (logs.length > 100) {
      setLogs(prevLogs => prevLogs.slice(-100));
    }
  };

  // Calculate processing speed and system load
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Increment simulation time
        setSimulationTime(prevTime => prevTime + 1);
        
        // Calculate total input data rate
        const totalDataRate = dataSources
          .filter(source => source.enabled)
          .reduce((sum, source) => sum + source.dataRate, 0);
        
        // Calculate total processing capacity
        const enabledCores = cores.filter(core => core.enabled);
        const totalProcessingCapacity = enabledCores.reduce((sum, core) => sum + core.speed, 0);
        
        // Calculate new processing speed and load
        let newProcessingSpeed = Math.min(totalDataRate, totalProcessingCapacity);
        
        // Adjust for batch size and buffer efficiency
        const batchEfficiency = batchSize / 100; // Higher batch size = more efficiency, up to a point
        const bufferEfficiency = Math.min(bufferSize / 100, 1.5); // Diminishing returns after certain point
        newProcessingSpeed = newProcessingSpeed * batchEfficiency * bufferEfficiency;
        
        // Calculate load on each core
        const newCores = [...cores];
        if (enabledCores.length > 0) {
          const loadPerCore = totalDataRate / enabledCores.length;
          
          newCores.forEach(core => {
            if (core.enabled) {
              // Calculate utilization percentage (capped at 100%)
              core.utilization = Math.min(Math.round((loadPerCore / core.speed) * 100), 100);
            } else {
              core.utilization = 0;
            }
          });
        }
        
        // Set new state
        setCores(newCores);
        setProcessingSpeed(Math.round(newProcessingSpeed));
        
        // Calculate overall system load
        const newSystemLoad = enabledCores.length > 0 
          ? Math.round(totalDataRate / totalProcessingCapacity * 100)
          : 0;
        
        setSystemLoad(newSystemLoad);
        
        // Update performance history
        setPerformanceHistory(prevHistory => {
          const newDataPoint = {
            time: simulationTime,
            processingSpeed: Math.round(newProcessingSpeed),
            systemLoad: newSystemLoad,
            activeDataSources: dataSources.filter(s => s.enabled).length,
            activeCores: enabledCores.length
          };
          
          // Keep only the most recent 50 data points
          const updatedHistory = [...prevHistory, newDataPoint].slice(-50);
          return updatedHistory;
        });
        
        // Generate alerts based on system load
        if (newSystemLoad > 90) {
          addLog("CRITICAL: System overloaded! Add more cores or reduce data input.", "error");
          setAlerts(prev => {
            const newAlert = { id: Date.now(), message: "CRITICAL: System overloaded! Add more cores or reduce data input.", type: "critical" };
            return [...prev, newAlert].slice(-3);
          });
        } else if (newSystemLoad > 70 && Math.random() > 0.7) { // Randomize to prevent spam
          addLog("WARNING: High system load detected.", "warning");
          setAlerts(prev => {
            const newAlert = { id: Date.now(), message: "WARNING: High system load detected.", type: "warning" };
            return [...prev, newAlert].slice(-3);
          });
        }
        
        // Add occasional logs
        if (simulationTime % 5 === 0) {
          addLog(`Processing data at ${Math.round(newProcessingSpeed)} MB/s with system load of ${newSystemLoad}%`);
        }
        
        // Random events to make logs more interesting
        if (Math.random() > 0.9) {
          const randomEvents = [
            "Data batch processing completed successfully.",
            "Buffer management optimizing flow.",
            "Data compression ratio optimized.",
            "Rebalancing workload across cores.",
            "Checking data integrity - all packets valid."
          ];
          addLog(randomEvents[Math.floor(Math.random() * randomEvents.length)]);
        }
      }, 1000);
      
      addLog("Simulation started", "success");
      
      return () => {
        clearInterval(interval);
        addLog("Simulation stopped", "info");
      };
    }
  }, [isRunning, cores, dataSources, batchSize, bufferSize, simulationTime]);

  // Add a new data source
  const addDataSource = () => {
    if (dataSources.length < 3) {
      const newId = Math.max(...dataSources.map(source => source.id), 0) + 1;
      const newSource = { 
        id: newId, 
        name: `Source ${newId}`, 
        dataRate: 50, 
        enabled: true 
      };
      setDataSources([...dataSources, newSource]);
      addLog(`Added new data source: ${newSource.name}`);
    }
  };

  // Remove a data source
  const removeDataSource = (sourceId) => {
    const sourceToRemove = dataSources.find(source => source.id === sourceId);
    if (sourceToRemove) {
      setDataSources(dataSources.filter(source => source.id !== sourceId));
      addLog(`Removed data source: ${sourceToRemove.name}`, "info");
      
      // If the removed source was selected, clear selection
      if (selectedItem && itemType === 'source' && selectedItem.id === sourceId) {
        setSelectedItem(null);
        setItemType(null);
      }
    }
  };

  // Add a new core
  const addCore = () => {
    if (cores.length < 5) {
      const newId = Math.max(...cores.map(core => core.id), 0) + 1;
      const newCore = { 
        id: newId, 
        speed: 50, 
        utilization: 0, 
        enabled: true 
      };
      setCores([...cores, newCore]);
      addLog(`Added new processing core: Core ${newCore.id}`);
    }
  };

  // Remove a core
  const removeCore = (coreId) => {
    const coreToRemove = cores.find(core => core.id === coreId);
    if (coreToRemove) {
      setCores(cores.filter(core => core.id !== coreId));
      addLog(`Removed processing core: Core ${coreToRemove.id}`, "info");
      
      // If the removed core was selected, clear selection
      if (selectedItem && itemType === 'core' && selectedItem.id === coreId) {
        setSelectedItem(null);
        setItemType(null);
      }
    }
  };

  // Handle configuration panel updates
  const handleConfigUpdate = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (itemType === 'source') {
      const updatedSources = dataSources.map(source => 
        source.id === selectedItem.id 
          ? { ...source, [name]: type === 'checkbox' ? checked : Number(value) }
          : source
      );
      setDataSources(updatedSources);
      
      if (name === 'enabled') {
        addLog(`${selectedItem.name} ${checked ? 'enabled' : 'disabled'}`, checked ? 'success' : 'info');
      } else if (name === 'dataRate') {
        addLog(`${selectedItem.name} data rate updated to ${value} MB/s`);
      }
    } else if (itemType === 'core') {
      const updatedCores = cores.map(core => 
        core.id === selectedItem.id 
          ? { ...core, [name]: type === 'checkbox' ? checked : Number(value) }
          : core
      );
      setCores(updatedCores);
      
      if (name === 'enabled') {
        addLog(`Core ${selectedItem.id} ${checked ? 'enabled' : 'disabled'}`, checked ? 'success' : 'info');
      } else if (name === 'speed') {
        addLog(`Core ${selectedItem.id} speed updated to ${value} MB/s`);
      }
    }
  };

  // Get color based on utilization
  const getUtilizationColor = (utilization) => {
    if (utilization > 90) return "bg-red-500";
    if (utilization > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get color based on system load
  const getSystemLoadColor = (load) => {
    if (load > 90) return "text-red-500";
    if (load > 70) return "text-yellow-500";
    return "text-green-500";
  };

  // Handle selecting an item for configuration
  const selectItem = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
  };

  // Toggle simulation running state
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  // Handle global setting changes
  const handleGlobalSettingChange = (setting, value) => {
    if (setting === 'batchSize') {
      setBatchSize(Number(value));
      addLog(`Batch size updated to ${value}`);
    } else if (setting === 'bufferSize') {
      setBufferSize(Number(value));
      addLog(`Buffer size updated to ${value}`);
    }
  };

  // Render the configuration panel
  const renderConfigPanel = () => {
    if (!selectedItem) return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Configuration</h3>
        <p>Click on a data source or core to configure it.</p>
      </div>
    );

    if (itemType === 'source') {
      return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Configure Data Source</h3>
            <button 
              onClick={() => removeDataSource(selectedItem.id)} 
              className="btn btn-sm btn-error"
              title="Remove this data source"
            >
              <Trash size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={selectedItem.name}
                onChange={handleConfigUpdate}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Rate (MB/s)</label>
              <input
                type="range"
                name="dataRate"
                min="10"
                max="100"
                value={selectedItem.dataRate}
                onChange={handleConfigUpdate}
                className="range w-full"
              />
              <p className="text-sm mt-1">{selectedItem.dataRate} MB/s</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enabled"
                checked={selectedItem.enabled}
                onChange={handleConfigUpdate}
                className="checkbox mr-2"
              />
              <label className="text-sm font-medium">Enabled</label>
            </div>
          </div>
        </div>
      );
    }

    if (itemType === 'core') {
      return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Configure Processing Core</h3>
            <button 
              onClick={() => removeCore(selectedItem.id)} 
              className="btn btn-sm btn-error"
              title="Remove this core"
            >
              <Trash size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Processing Speed (MB/s)</label>
              <input
                type="range"
                name="speed"
                min="10"
                max="100"
                value={selectedItem.speed}
                onChange={handleConfigUpdate}
                className="range w-full"
              />
              <p className="text-sm mt-1">{selectedItem.speed} MB/s</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enabled"
                checked={selectedItem.enabled}
                onChange={handleConfigUpdate}
                className="checkbox mr-2"
              />
              <label className="text-sm font-medium">Enabled</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Utilization</label>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getUtilizationColor(selectedItem.utilization)}`} 
                  style={{ width: `${selectedItem.utilization}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{selectedItem.utilization}%</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen pt-[4%] pb-1 px-2 bg-gray-50">
      <div className="w-full flex rounded-lg">
        {/* Left Sidebar */}
        <div className="w-1/5 p-4 border-2 border-primary rounded-lg bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary">Pipeline Configuration</h2>
          
          {/* Data Sources */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Data Sources ({dataSources.length}/3)</label>
              <button 
                onClick={addDataSource} 
                disabled={dataSources.length >= 3}
                className="btn btn-xs btn-primary"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {dataSources.map(source => (
                <div 
                  key={source.id}
                  onClick={() => selectItem(source, 'source')}
                  className={`p-2 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    selectedItem?.id === source.id && itemType === 'source' ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{source.name}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDataSource(source.id);
                      }} 
                      className="text-red-500 hover:text-red-700"
                      title="Remove this data source"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                  <p className="text-xs">{source.dataRate} MB/s</p>
                  <p className={`text-xs ${source.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cores */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Processing Cores ({cores.length}/5)</label>
              <button 
                onClick={addCore} 
                disabled={cores.length >= 5}
                className="btn btn-xs btn-primary"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {cores.map(core => (
                <div 
                  key={core.id}
                  onClick={() => selectItem(core, 'core')}
                  className={`p-2 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    selectedItem?.id === core.id && itemType === 'core' ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Core {core.id}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCore(core.id);
                      }} 
                      className="text-red-500 hover:text-red-700"
                      title="Remove this core"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                  <p className="text-xs">{core.speed} MB/s</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${getUtilizationColor(core.utilization)}`} 
                      style={{ width: `${core.utilization}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Global Settings */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Batch Size</label>
            <input
              type="range"
              min="10"
              max="200"
              value={batchSize}
              onChange={(e) => handleGlobalSettingChange('batchSize', e.target.value)}
              className="range w-full"
            />
            <p className="text-xs mt-1">Batch Size: {batchSize}</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Buffer Size</label>
            <input
              type="range"
              min="10"
              max="200"
              value={bufferSize}
              onChange={(e) => handleGlobalSettingChange('bufferSize', e.target.value)}
              className="range w-full"
            />
            <p className="text-xs mt-1">Buffer Size: {bufferSize}</p>
          </div>
          
          {/* Run Button */}
          <button 
            onClick={toggleSimulation} 
            className={`btn ${isRunning ? 'btn-error' : 'btn-primary'} w-full mb-4 flex items-center justify-center`}
          >
            {isRunning ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
            {isRunning ? 'Stop' : 'Run'} Simulation
          </button>
        </div>
        
        {/* Right Content Section */}
        <div className="w-4/5 p-4">
          <h1 className="text-3xl font-bold mb-4 text-primary">Data Pipeline Simulation</h1>
          
          {/* Status Panel */}
          <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Pipeline Status</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium">Processing Speed</p>
                <p className="text-2xl font-bold">{processingSpeed} MB/s</p>
              </div>
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium">System Load</p>
                <p className={`text-2xl font-bold ${getSystemLoadColor(systemLoad)}`}>
                  {systemLoad}%
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium">Active Components</p>
                <p className="text-2xl font-bold">
                  {dataSources.filter(s => s.enabled).length} Sources, {cores.filter(c => c.enabled).length} Cores
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium">Simulation Time</p>
                <p className="text-2xl font-bold">{simulationTime}s</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Pipeline Visualization */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Pipeline Visualization</h3>
                <div className="relative h-64 border rounded-lg p-4 bg-gray-50">
                  {/* Data Sources */}
                  <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col justify-around p-2">
                    {dataSources.map((source) => (
                      <div 
                        key={source.id}
                        className={`h-12 rounded-lg flex items-center justify-center transition-colors 
                          ${source.enabled ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      >
                        {source.name}
                      </div>
                    ))}
                  </div>
                  
                  {/* Data Flow Lines */}
                  <div className="absolute left-24 right-24 top-0 bottom-0 flex items-center justify-center">
                    {isRunning && (
                      <div className="w-full h-1/2 relative">
                        {/* Animated data flow */}
                        <div className="absolute inset-0 flex items-center">
                          <div className="h-0.5 w-full bg-gray-300 relative">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i}
                                className="absolute h-2 w-2 rounded-full bg-blue-500"
                                style={{ 
                                  left: `${(i * 20 + (Date.now() / 50) % 100) % 100}%`,
                                  animationName: 'flowAnimation',
                                  animationDuration: '2s',
                                  animationIterationCount: 'infinite',
                                  animationTimingFunction: 'linear'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Buffer */}
                        <div className="absolute right-0 -top-4 bottom-4 w-10 flex items-center">
                          <div className="h-8 w-8 rounded-full border-2 border-orange-500 flex items-center justify-center bg-white">
                            <span className="text-xs">BUF</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Processing Cores */}
                  <div className="absolute right-0 top-0 bottom-0 w-24 flex flex-col justify-around p-2">
                    {cores.map(core => (
                      <div 
                        key={core.id}
                        className={`h-8 rounded-lg flex items-center justify-center transition-colors 
                          ${core.enabled 
                            ? getUtilizationColor(core.utilization) + ' text-white' 
                            : 'bg-gray-200'}`}
                      >
                        Core {core.id} ({core.utilization}%)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Performance Charts */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <LineChart data={performanceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }} 
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'MB/s', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        domain={[0, 100]}
                        label={{ value: 'Load %', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="processingSpeed" 
                        name="Processing Speed" 
                        stroke="#4299e1" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="systemLoad" 
                        name="System Load" 
                        stroke="#f56565" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {/* Configuration Panel */}
              {renderConfigPanel()}
              
              {/* Alerts */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center mb-2">
                  <AlertTriangle size={20} className="mr-2 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Alerts</h3>
                </div>
                <div className="space-y-2">
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <div 
                        key={alert.id}
                        className={`p-2 rounded-lg ${
                          alert.type === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {alert.message}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No alerts at this time.</p>
                  )}
                </div>
              </div>
              
              {/* System Logs */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2">System Logs</h3>
                <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-900 text-gray-100 font-mono text-xs">
                  {logs.map(log => (
                    <div 
                      key={log.id} 
                      className={`mb-1 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'warning' ? 'text-yellow-400' : 
                        log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                      }`}
                    >
                      [{log.timestamp}] {log.message}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPipelineSimulation;