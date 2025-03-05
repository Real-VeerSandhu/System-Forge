import { useState } from 'react';


const Shell = () => {
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
}

export default Shell