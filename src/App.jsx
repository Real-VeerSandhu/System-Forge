import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ModelDemo from './pages/Shell';
import About from './pages/About';
import Simulation from './pages/Simulation';
import Test from './pages/Test';
import SystemSimulation from './pages/SystemSimulation';
import DataPipelineSimulation from './pages/DataPipelineSimulation';

const THEME = "light"


function Navbar() {
  // return (
  //   <nav className="w-full bg-white shadow-md py-3 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
  //     <h3 className="text-xl font-bold text-gray-900">My App</h3>
  //     <div className="space-x-4">
  //       <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
  //       <Link to="/model-demo" className="text-gray-700 hover:text-blue-600">Model Demo</Link>
  //       <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
  //       {/* <Link to="/about-page" className="text-gray-700 hover:text-blue-600">About Page</Link> */}
  //       <Link to="/test" className="text-gray-700 hover:text-blue-600">Test</Link>

  //     </div>
  //   </nav>
  // );

  return (
    <nav className="w-full shadow-md py-3 px-6 flex justify-between items-center fixed top-0 left-0 right-0 bg-white z-10">
      <h3 className="text-xl font-bold">System Forge</h3>
      <div className="space-x-4">
        <Link to="/" className=" hover:text-secondary">Home</Link>
        {/* <Link to="/model-demo" className=" hover:text-secondary">Shell</Link> */}
        <Link to="/simulation" className=" hover:text-secondary">Simple Simulation</Link>
        {/* <Link to="/about" className=" hover:text-secondary">Simulation 2</Link> */}
        <Link to="/system-simulation" className=" hover:text-secondary">System Simulation</Link>
        {/* <Link to="/aboutpage" className=" hover:text-secondary">About Page</Link> */}
        <Link to="/data-pipeline-simulation" className=" hover:text-secondary">Data Pipeline Simulation</Link>

      </div>
    </nav>
  );
}


const AboutPage = () => {
  // State to manage inputs
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [dropdownValue, setDropdownValue] = useState("");
  
  // State to manage output after clicking Run button
  const [output, setOutput] = useState({
    name: "",
    text: "",
    sliderValue: 0,
    dropdownValue: "",
  });

  // Handle the Run button click
  const handleRunClick = () => {
    setOutput({
      name: name || "No name entered",
      text: text || "No text entered",
      sliderValue: sliderValue,
      dropdownValue: dropdownValue || "No option selected",
    });
  };

  return (
    <div>

      {/* Main Content Container with Border and Padding */}
      <div className="flex min-h-screen pt-[4%] pb-1 px-2"> {/* Padding from the top and sides */}
        <div className="w-full flex rounded-lg">
          {/* Left Sidebar (20%) with rounded border */}
          <div className="w-1/5 p-4 border-2 border-primary  rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Text Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Write something here..."
              />
            </div>

            {/* Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2">Slider</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(e.target.value)}
                className="range"
              />
              <p>Value: {sliderValue}</p>
            </div>

            {/* Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium py-2s">Dropdown</label>
              <select
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Select an option</option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
                <option value="Option 3">Option 3</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunClick}
              className="btn btn-primary w-full"
            >
              Run
            </button>
          </div>

          {/* Right Output Section (80%) */}
          <div className="w-4/5 p-4">
            <h1 className="text-3xl font-bold mb-4">Your Input Summary</h1>
            <div className="space-y-4">
              <p><strong>Name:</strong> {output.name}</p>
              <p><strong>Text:</strong> {output.text}</p>
              <p><strong>Slider Value:</strong> {output.sliderValue}</p>
              <p><strong>Dropdown Selection:</strong> {output.dropdownValue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>


      {/* Main Content Container with Border and Padding */}
      <div className="flex min-h-screen pt-14 px-4"> {/* Padding from the top and sides */}
        <div className="border-2 border-gray-300 w-full flex rounded-lg">
          {/* Left Sidebar (20%) */}
          <div className="w-1/5 p-4 bg-gray-100">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Text Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Write something here..."
              />
            </div>

            {/* Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Slider</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(e.target.value)}
                className="range"
              />
              <p>Value: {sliderValue}</p>
            </div>

            {/* Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Dropdown</label>
              <select
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Select an option</option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
                <option value="Option 3">Option 3</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunClick}
              className="btn btn-primary w-full"
            >
              Run
            </button>
          </div>

          {/* Right Output Section (80%) */}
          <div className="w-4/5 p-4">
            <h1 className="text-3xl font-bold mb-4">Your Input Summary</h1>
            <div className="space-y-4">
              <p><strong>Name:</strong> {output.name}</p>
              <p><strong>Text:</strong> {output.text}</p>
              <p><strong>Slider Value:</strong> {output.sliderValue}</p>
              <p><strong>Dropdown Selection:</strong> {output.dropdownValue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default function App() {
  return (
    <div data-theme={THEME}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/model-demo" element={<ModelDemo />} />
          <Route path="/simulation" element={<Simulation />} />

          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/system-simulation" element={<SystemSimulation />} />
          {/* <Route path="/aboutpage" element={<AboutPage />} /> */}

          <Route path="/test" element={<Test />} />
          <Route path="/data-pipeline-simulation" element={<DataPipelineSimulation />} />

        </Routes>
      </Router>
    </div>
  );
}


// function LandingPage() {
//   return (
//     <div className="min-h-screen w-screen flex flex-col items-center justify-center px-6 pt-20 text-center">
//       <header className="w-full max-w-4xl mb-10">
//         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Data-Driven Insights</h1>
//         <p className="mt-4 text-md sm:text-lg text-gray-600">
//           Unlock the power of data with our AI-powered analytics platform.
//         </p>
//       </header>
//       <main className="w-full max-w-3xl flex flex-col items-center text-center">
//         <img 
//           src="https://via.placeholder.com/600x300" 
//           alt="Dashboard preview" 
//           className="rounded-lg shadow-lg mb-6 w-full max-w-md sm:max-w-lg"
//         />
//         <p className="text-gray-700 text-md sm:text-lg max-w-2xl">
//           Our platform provides real-time analytics, sentiment analysis, and predictive insights to help you make informed decisions.
//         </p>
//         <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
//           Get Started
//         </button>
//       </main>
//     </div>
//   );
// }

// function ModelDemo() {
//   return <div className="min-h-screen w-screen flex items-center justify-center text-center">Model Demo Page</div>;
// }

// function About() {
//   return (
//   <div className="min-h-screen w-screen flex items-center justify-center text-center">
//     <header className="w-full max-w-4xl mb-10">
//         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">About Page</h1>
//         <p className="mt-4 text-md sm:text-lg text-gray-600">
//           Test page
//         </p>
//         <div className="tooltip" data-tip="hello">
//           <button className="btn">Hover me</button>
//         </div>
//     </header>
//   </div>

// )
// {/* <details className="dropdown">
// <summary className="btn m-1">open or close</summary>
// <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
// <li><a>Item 1</a></li>
// <li><a>Item 2</a></li>
// </ul>
// </details> */}
  
// }

