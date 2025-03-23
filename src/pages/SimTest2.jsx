import React, { useState, useEffect, useRef } from 'react';

const DataPipelineSimulationTest = () => {
  // State for user configurable inputs
  const [dataSources, setDataSources] = useState(1);
  const [cores, setCores] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCore, setSelectedCore] = useState(null);
  const [coreSettings, setCoreSettings] = useState([
    { id: 0, efficiency: 50, heatLevel: 0, load: 0, dataProcessed: 0 }
  ]);
  const [sourceSettings, setSourceSettings] = useState([
    { id: 0, dataSize: 100, dataRate: 50, complexity: 30 }
  ]);
  const [simulationStats, setSimulationStats] = useState({
    totalProcessed: 0,
    averageLoad: 0,
    timeRemaining: 0,
    overallEfficiency: 0,
    alerts: []
  });
  
  // Refs for animation and timing
  const animationRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const simulationStartTimeRef = useRef(0);
  const totalSimTime = 30000; // 30 seconds total simulation time
  
  // Initialize settings when cores or data sources change
  useEffect(() => {
    // Initialize core settings
    const newCoreSettings = Array.from({ length: cores }, (_, i) => {
      return i < coreSettings.length 
        ? coreSettings[i] 
        : { id: i, efficiency: 50, heatLevel: 0, load: 0, dataProcessed: 0 };
    });
    setCoreSettings(newCoreSettings);
    
    // Initialize data source settings
    const newSourceSettings = Array.from({ length: dataSources }, (_, i) => {
      return i < sourceSettings.length 
        ? sourceSettings[i] 
        : { id: i, dataSize: 100, dataRate: 50, complexity: 30 };
    });
    setSourceSettings(newSourceSettings);
    
  }, [cores, dataSources]);

  // Update core setting
  const updateCoreSetting = (id, setting, value) => {
    setCoreSettings(prevSettings => 
      prevSettings.map(core => 
        core.id === id ? { ...core, [setting]: value } : core
      )
    );
  };
  
  // Update source setting
  const updateSourceSetting = (id, setting, value) => {
    setSourceSettings(prevSettings => 
      prevSettings.map(source => 
        source.id === id ? { ...source, [setting]: value } : source
      )
    );
  };
  
  // Start simulation
  const startSimulation = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    simulationStartTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();
    
    // Reset core stats
    setCoreSettings(prev => 
      prev.map(core => ({ ...core, load: 0, dataProcessed: 0, heatLevel: 0 }))
    );
    
    // Reset simulation stats
    setSimulationStats({
      totalProcessed: 0,
      averageLoad: 0,
      timeRemaining: totalSimTime / 1000,
      overallEfficiency: 0,
      alerts: []
    });
    
    // Start the animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(updateSimulation);
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (!isRunning) return;
    
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  // Update simulation state
  const updateSimulation = () => {
    const now = Date.now();
    const elapsedSinceStart = now - simulationStartTimeRef.current;
    const deltaTime = now - lastUpdateTimeRef.current;
    
    // Update progress based on elapsed time
    const newProgress = Math.min(100, (elapsedSinceStart / totalSimTime) * 100);
    setProgress(newProgress);
    
    // Stop if simulation is complete
    if (newProgress >= 100) {
      stopSimulation();
      return;
    }
    
    // Update simulation state (only every ~50ms for performance)
    if (deltaTime >= 50) {
      lastUpdateTimeRef.current = now;
      
      // Calculate total data input based on all sources
      const totalDataInput = sourceSettings.reduce((total, source) => {
        return total + (source.dataRate * source.dataSize / 5000) * deltaTime;
      }, 0);
      
      // Distribute data to cores based on their settings
      const totalEfficiency = coreSettings.reduce((sum, core) => sum + core.efficiency, 0);
      const dataPerEfficiencyUnit = totalDataInput / Math.max(1, totalEfficiency);
      
      // Update each core's stats
      const updatedCores = coreSettings.map(core => {
        // Calculate how much data this core should process
        const dataForThisCore = core.efficiency * dataPerEfficiencyUnit;
        
        // Add some randomness to the load (more significant fluctuations)
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        
        // Calculate the load based on data and core efficiency
        let loadFactor = 0;
        sourceSettings.forEach(source => {
          loadFactor += source.complexity / 30;
        });
        
        const rawLoad = (dataForThisCore * loadFactor) / (core.efficiency / 40);
        const load = Math.min(100, Math.max(5, rawLoad * randomFactor));
        
        // Calculate heat level based on load over time
        const heatChange = (load > 70 ? (load - 70) / 10 : -3) * (deltaTime / 1000);
        const heatLevel = Math.min(100, Math.max(0, core.heatLevel + heatChange));
        
        return {
          ...core,
          load: load,
          heatLevel: heatLevel,
          dataProcessed: core.dataProcessed + dataForThisCore
        };
      });
      
      // Update cores state
      setCoreSettings(updatedCores);
      
      // Generate alerts
      const newAlerts = [];
      updatedCores.forEach(core => {
        if (core.load > 90) {
          newAlerts.push(`Core ${core.id + 1} is at critical load (${Math.round(core.load)}%)!`);
        } else if (core.heatLevel > 80) {
          newAlerts.push(`Core ${core.id + 1} is overheating (${Math.round(core.heatLevel)}%)!`);
        }
      });
      
      // Update overall stats
      const totalProcessed = updatedCores.reduce((sum, core) => sum + core.dataProcessed, 0);
      const averageLoad = updatedCores.reduce((sum, core) => sum + core.load, 0) / cores;
      const timeRemaining = ((100 - newProgress) / 100) * (totalSimTime / 1000);
      
      const totalDataSize = sourceSettings.reduce((sum, source) => sum + source.dataSize, 0);
      const overallEfficiency = totalProcessed / Math.max(1, (elapsedSinceStart / 1000) * totalDataSize / 30) * 100;
      
      setSimulationStats({
        totalProcessed: Math.round(totalProcessed),
        averageLoad: Math.round(averageLoad),
        timeRemaining: Math.round(timeRemaining),
        overallEfficiency: Math.min(100, Math.round(overallEfficiency)),
        alerts: [...new Set([...simulationStats.alerts, ...newAlerts])].slice(-3) // Keep latest 3 unique alerts
      });
    }
    
    // Continue animation loop if still running
    if (isRunning) {
      animationRef.current = requestAnimationFrame(updateSimulation);
    }
  };
  
  // Get color based on load percentage
  const getLoadColor = (load) => {
    if (load < 50) return 'bg-green-500';
    if (load < 75) return 'bg-yellow-500';
    if (load < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Get color based on heat level
  const getHeatColor = (heat) => {
    if (heat < 40) return 'bg-blue-500';
    if (heat < 70) return 'bg-yellow-500';
    if (heat < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen pt-16 pb-1 px-2">
      <div className="w-full flex rounded-lg">
        {/* Left Sidebar (25%) */}
        <div className="w-1/4 p-4 border-2 border-primary rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Pipeline Configuration</h2>
          
          {/* Data Source Configuration */}
          <div className="mb-4">
            <label className="block text-sm font-medium py-2">Number of Data Sources</label>
            <input 
              type="range" 
              min="1" 
              max="3" 
              value={dataSources} 
              onChange={(e) => setDataSources(parseInt(e.target.value))} 
              className="range"
              disabled={isRunning}
            />
            <p>Sources: {dataSources}</p>
          </div>
          
          {/* Source Settings */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Source Settings</h3>
            {sourceSettings.map(source => (
              <div key={source.id} className="mb-2 p-2 border rounded">
                <p className="font-medium">Source {source.id + 1}</p>
                
                <div className="mb-1">
                  <label className="block text-xs">Data Size</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="200" 
                    value={source.dataSize} 
                    onChange={(e) => updateSourceSetting(source.id, 'dataSize', parseInt(e.target.value))} 
                    className="range range-xs"
                    disabled={isRunning}
                  />
                  <p className="text-xs">{source.dataSize} MB</p>
                </div>
                
                <div className="mb-1">
                  <label className="block text-xs">Data Rate</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={source.dataRate} 
                    onChange={(e) => updateSourceSetting(source.id, 'dataRate', parseInt(e.target.value))} 
                    className="range range-xs"
                    disabled={isRunning}
                  />
                  <p className="text-xs">{source.dataRate} MB/s</p>
                </div>
                
                <div className="mb-1">
                  <label className="block text-xs">Complexity</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={source.complexity} 
                    onChange={(e) => updateSourceSetting(source.id, 'complexity', parseInt(e.target.value))} 
                    className="range range-xs"
                    disabled={isRunning}
                  />
                  <p className="text-xs">{source.complexity}%</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Parallel Processing Configuration */}
          <div className="mb-4">
            <label className="block text-sm font-medium py-2">Number of Processing Cores</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={cores} 
              onChange={(e) => setCores(parseInt(e.target.value))} 
              className="range"
              disabled={isRunning}
            />
            <p>Cores: {cores}</p>
          </div>
          
          {/* Run Button */}
          <button 
            onClick={isRunning ? stopSimulation : startSimulation} 
            className={`btn w-full ${isRunning ? 'btn-error' : 'btn-primary'}`}
          >
            {isRunning ? 'Stop Simulation' : 'Run Simulation'}
          </button>
        </div>
        
        {/* Right Output Section (75%) */}
        <div className="w-3/4 p-4">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-bold">Data Pipeline Simulation</h1>
            
            {/* Overall Status */}
            <div className="text-right">
              <p><strong>Status:</strong> {isRunning ? 'Running' : 'Stopped'}</p>
              <p><strong>Progress:</strong> {Math.round(progress)}%</p>
              <p><strong>Time Remaining:</strong> {simulationStats.timeRemaining}s</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Core visualization and status */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Processing Cores Status</h2>
            
            <div className={`grid grid-cols-${Math.min(cores, 5)} gap-4`}>
              {coreSettings.map(core => (
                <div 
                  key={core.id} 
                  className={`p-3 border rounded-lg cursor-pointer ${selectedCore === core.id ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => setSelectedCore(core.id)}
                >
                  <h3 className="font-semibold mb-2">Core {core.id + 1}</h3>
                  
                  {/* Load Bar */}
                  <div className="mb-2">
                    <label className="text-xs block">Load:</label>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${getLoadColor(core.load)} h-3 rounded-full transition-all duration-300`} 
                        style={{ width: `${core.load}%` }}
                      ></div>
                    </div>
                    <p className="text-xs">{Math.round(core.load)}%</p>
                  </div>
                  
                  {/* Heat Level */}
                  <div className="mb-2">
                    <label className="text-xs block">Heat:</label>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`${getHeatColor(core.heatLevel)} h-3 rounded-full transition-all duration-500`} 
                        style={{ width: `${core.heatLevel}%` }}
                      ></div>
                    </div>
                    <p className="text-xs">{Math.round(core.heatLevel)}%</p>
                  </div>
                  
                  <p className="text-xs"><strong>Data:</strong> {Math.round(core.dataProcessed)} MB</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Core Configuration (when a core is selected) */}
          {selectedCore !== null && (
            <div className="border p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Core {selectedCore + 1} Configuration</h3>
              
              <div className="mb-2">
                <label className="block text-sm">Processing Efficiency</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={coreSettings[selectedCore]?.efficiency || 50} 
                  onChange={(e) => updateCoreSetting(selectedCore, 'efficiency', parseInt(e.target.value))} 
                  className="range"
                  disabled={isRunning}
                />
                <p>Efficiency: {coreSettings[selectedCore]?.efficiency || 50}%</p>
                <p className="text-xs text-gray-500">Higher efficiency means faster processing but may generate more heat</p>
              </div>
            </div>
          )}
          
          {/* Simulation Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <p><strong>Total Data Processed:</strong> {simulationStats.totalProcessed} MB</p>
              <p><strong>Average Core Load:</strong> {simulationStats.averageLoad}%</p>
              <p><strong>Overall Efficiency:</strong> {simulationStats.overallEfficiency}%</p>
            </div>
            
            {/* Alerts Section */}
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Alerts</h3>
              {simulationStats.alerts.length > 0 ? (
                <ul className="text-sm">
                  {simulationStats.alerts.map((alert, index) => (
                    <li key={index} className="text-red-500 mb-1">{alert}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No alerts</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPipelineSimulationTest;