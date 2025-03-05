const LandingPage = () => {
    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center px-6 pt-20 text-center">
          <header className="w-full max-w-4xl mb-10">
            <h1 className="text-9xl sm:text-4xl font-bold">System Forge</h1>
            <p className="mt-4 text-md sm:text-lg">
            Visualize, simulate, and experiment with large scale software system. 
            </p>
          </header>
          <main className="w-full max-w-3xl flex flex-col items-center text-center">
            {/* <img 
              src="https://via.placeholder.com/600x300" 
              alt="Dashboard preview" 
              className="rounded-lg shadow-lg mb-6 w-full max-w-md sm:max-w-lg"
            /> */}
            <p className=" text-md sm:text-lg max-w-2xl">
            SystemForge is an advanced web-based simulation platform designed to help engineers, researchers, and architects model, test, and refine large-scale software systems. Whether you're designing microservices, distributed databases, or complex cloud architectures, SystemForge provides the tools to visualize, analyze, and optimize system performance before deployment. 
            </p>
            <button className="mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:scale-110 transition">
              Get Started
            </button>
          </main>
        </div>
      );
}

export default LandingPage