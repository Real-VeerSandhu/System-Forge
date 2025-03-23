import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SimChat() {
  const [numCores, setNumCores] = useState(1);
  const [numSources, setNumSources] = useState(1);
  const [coreLoad, setCoreLoad] = useState(Array(5).fill(0));
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    if (isRunning) {
      let interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            return 100;
          }
          return prev + (numSources / numCores) * 2 + Math.random() * 2;
        });

        setCoreLoad((prev) =>
          prev.map((_, i) => (i < numCores ? Math.random() * 100 : 0))
        );
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isRunning, numCores, numSources]);
  
  return (
    <div className="flex flex-col min-h-screen p-4">
      {/* Controls */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium py-2">Parallelism (Cores)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={numCores}
            onChange={(e) => setNumCores(parseInt(e.target.value))}
            className="range"
          />
          <p>{numCores} Cores</p>
        </div>
        <div>
          <label className="block text-sm font-medium py-2">Data Sources</label>
          <input
            type="range"
            min="1"
            max="3"
            value={numSources}
            onChange={(e) => setNumSources(parseInt(e.target.value))}
            className="range"
          />
          <p>{numSources} Sources</p>
        </div>
        <Button onClick={() => setIsRunning(true)} className="btn btn-primary mt-auto">
          Start Simulation
        </Button>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2 mb-4" />
      <p>{progress.toFixed(1)}% Completed</p>

      {/* Core Load Status */}
      <div className="grid grid-cols-5 gap-4 mt-4">
        {coreLoad.map((load, index) => (
          <Card key={index} className={`p-4 ${load > 80 ? "bg-red-500" : load > 50 ? "bg-yellow-400" : "bg-green-400"}`}>
            <CardContent>
              <p>Core {index + 1}</p>
              <p>Load: {load.toFixed(1)}%</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
