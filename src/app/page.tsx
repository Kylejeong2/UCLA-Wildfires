"use client"

import { useState } from 'react';
import Image from "next/image";
import dynamic from 'next/dynamic';

// Dynamic imports for components that use browser APIs
const FireMap = dynamic(() => import('@/components/FireMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  )
});

const AirQuality = dynamic(() => import('@/components/AirQuality'), { ssr: false });
const CampusAlerts = dynamic(() => import('@/components/CampusAlerts'), { ssr: false });
const LiveCameras = dynamic(() => import('@/components/LiveCameras'), { ssr: false });

export default function Home() {
  const [layerVisibility, setLayerVisibility] = useState({
    // Fire Layers
    activeFires: true,
    firePerimeters: true,
    redFlagWarnings: false,
    // hotspots: true,
    // fireWeather: true,
    // fireStations: true,
    
    // Evacuation Layers
    // estimatedEvacTime: false,  // EstimatedGroundEvacuationTime
    // evacuationAreas: false,    // Evacuation_Areas
    currentEvacAreas: true,   // EvacuationAreas
    // watchEvacAreas: false,     // 2024Watch_EvacuationAreas_Public
  });

  const LAYER_LABELS = {
    // Fire Layers
    activeFires: "Active Fires",
    firePerimeters: "Fire Perimeters",
    redFlagWarnings: "Red Flag Warnings",
    // hotspots: "Thermal Hotspots",
    // fireWeather: "Fire Weather",
    // fireStations: "Fire Stations",
    
    // Evacuation Layers
    // estimatedEvacTime: "Evacuation Time Estimates",
    // evacuationAreas: "Evacuation Areas",
    currentEvacAreas: "Current Evacuation Areas",
    // watchEvacAreas: "2024 Watch Areas"
  };

  const toggleLayer = (layer: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-24">
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="flex flex-col">
                <div className="text-white text-lg sm:text-3xl font-bold">UCLA</div>
                <div className="text-white/60 text-[8px] sm:text-xs">*not officially affiliated</div>
              </div>
              <div className="h-6 sm:h-10 w-px bg-white/20"></div>
              <h1 className="text-white text-base sm:text-2xl font-bold">Wildfire Watch</h1>
            </div>

            <div className="flex items-center">
              <a className="text-white text-xs sm:text-base font-medium p-1 sm:p-4 hover:text-white/80 transition-colors hidden sm:block" href="mailto:kylejeong@ucla.edu">
                Request a Feature
              </a>
              <a href="https://www.instagram.com/vestucla/" target="_blank" rel="noopener noreferrer">
                <div className="w-[120px] sm:w-[200px] h-[32px] sm:h-[50px] bg-white/10 rounded-lg flex items-center justify-center gap-1 sm:gap-3 text-xs sm:text-base font-medium border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="hidden sm:block">powered by</span>
                  <Image 
                    src="https://fg5si9hh45.ufs.sh/f/S5FODHw5IM4mVeHOqfYhcQ2vJK1dAe5mOnIjiySl03wFfWDM"
                    alt="UCLA Logo"
                    width={50}
                    height={50}
                    className="object-contain sm:w-[70px] sm:h-[70px]" 
                  />
                </div>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map and Toggles */}
          <div className="lg:col-span-2 space-y-6">
            <FireMap layerVisibility={layerVisibility} />
            
            {/* Layer Toggles */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Layers</h3>
              
              {/* Fire Layers Section */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fire Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(LAYER_LABELS)
                    .filter(([key]) => !key.includes('vac')) // Filter for fire layers
                    .map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={layerVisibility[key as keyof typeof layerVisibility]}
                          onChange={() => toggleLayer(key as keyof typeof layerVisibility)}
                          className="form-checkbox h-4 w-4 text-ucla-blue rounded border-gray-300 focus:ring-ucla-blue"
                        />
                        <label className="text-sm text-gray-700">{label}</label>
                      </div>
                    ))}
                </div>
              </div>

              {/* Evacuation Layers Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Evacuation Zones</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(LAYER_LABELS)
                    .filter(([key]) => key.includes('vac')) // Filter for evacuation layers
                    .map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={layerVisibility[key as keyof typeof layerVisibility]}
                          onChange={() => toggleLayer(key as keyof typeof layerVisibility)}
                          className="form-checkbox h-4 w-4 text-ucla-blue rounded border-gray-300 focus:ring-ucla-blue"
                        />
                        <label className="text-sm text-gray-700">{label}</label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <AirQuality />
            <CampusAlerts />
            {/* <LiveChat /> */}
          </div>
        </div>

        {/* Camera Feeds */}
        <div className="mt-8">
          <LiveCameras />
        </div>
      </div>
    </main>
  );
}
