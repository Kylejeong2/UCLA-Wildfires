import Image from "next/image";
import dynamic from "next/dynamic";
// import LiveChat from "../components/LiveChat";
import CampusAlerts from "../components/CampusAlerts";
import AirQuality from "../components/AirQuality";
import LiveCameras from "../components/LiveCameras";

// Dynamically load map component to prevent SSR issues
const FireMap = dynamic(() => import("../components/FireMap"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="text-white text-2xl font-bold">UCLA</div>
              <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
              <h1 className="text-white text-2xl font-bold">Wildfire Watch</h1>
            </div>

            <div className="flex items-center">
              <a className="text-white text-sm font-medium p-4" href="mailto:kylejeong@ucla.edu">
                Request a Feature
              </a>
              <a href="https://www.instagram.com/vestucla/" target="_blank" rel="noopener noreferrer">
                <div className="w-[160px] h-[40px] bg-white/10 rounded-lg flex items-center justify-center gap-2 text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                  <span>powered by</span>
                  <Image 
                    src="https://fg5si9hh45.ufs.sh/f/S5FODHw5IM4mVeHOqfYhcQ2vJK1dAe5mOnIjiySl03wFfWDM"
                    alt="UCLA Logo"
                    width={50}
                    height={50}
                    className="object-contain" 
                  />
                </div>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map and Alerts - Full width on mobile */}
          <div className="lg:col-span-8 space-y-6">
            {/* Fire Map */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h2 className="text-xl font-bold text-gray-800">Live Fire Map</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <p className="text-sm text-gray-500">Via https://www.fire.ca.gov/</p>
                  <div className="text-sm text-gray-500">
                    Showing active fires around UCLA
                  </div>
                </div>
              </div>
              <div className="h-[400px] sm:h-[600px] rounded-lg overflow-hidden border border-gray-100">
                <FireMap />
              </div>
            </div>
          </div>

          {/* Right Column - Full width on mobile */}
          <div className="lg:col-span-4 space-y-6">
            {/* Air Quality Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <AirQuality />
            </div>

            {/* Campus Alerts */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h2 className="text-xl font-bold text-gray-800">Campus Alerts</h2>
                <a 
                  href="https://bso.ucla.edu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Bruins Safe Online
                </a>
              </div>
              <CampusAlerts />
            </div>
          </div>

          {/* Bottom Row - Camera Feeds */}
          <div className="col-span-1 lg:col-span-12">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <LiveCameras />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
