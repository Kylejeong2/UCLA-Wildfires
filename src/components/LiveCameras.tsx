"use client"

import { useState } from 'react';

interface Camera {
  id: string;
  name: string;
  url: string;
  location: string;
}

// UCLA area cameras from AlertCalifornia
const UCLA_CAMERAS: Camera[] = [
  {
    id: "baldwin-hills-1",
    name: "Baldwin Hills 1",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-BaldwinHills1", 
    location: "Baldwin Hills - Southeast of UCLA"
  },
  {
    id: "baldwin-hills-2",
    name: "Baldwin Hills 2",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-BaldwinHills2", 
    location: "Baldwin Hills - Southeast View"
  },
  {
    id: "bel-air-ridge-1",
    name: "Bel Air Ridge 1",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-BelAirRidge1", 
    location: "Bel Air - Northeast of UCLA"
  },
  {
    id: "bel-air-ridge-2",
    name: "Bel Air Ridge 2",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-BelAirRidge2", 
    location: "Bel Air - Eastern View"
  },
  {
    id: "hollywood-1",
    name: "Hollywood 1",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-Hollywood1", 
    location: "Hollywood Hills - North View"
  },
  {
    id: "hollywood-2",
    name: "Hollywood 2",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-Hollywood2", 
    location: "Hollywood Hills - Northeast View"
  },
  {
    id: "mt-lee-n",
    name: "Mt. Lee N",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-MtLeeN", 
    location: "Mount Lee - North View"
  },
  {
    id: "mt-lee-s",
    name: "Mt. Lee S",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-MtLeeS", 
    location: "Mount Lee - South View"
  },
  {
    id: "star-mtn-1",
    name: "Star Mountain 1",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-Briar1", 
    location: "Star Mountain - Northwest View"
  },
  {
    id: "star-mtn-2",
    name: "Star Mountain 2",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-Briar2", 
    location: "Star Mountain - Northeast View"
  },
  {
    id: "wilshire-1",
    name: "Wilshire 1",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-Wilshire1", 
    location: "Wilshire Corridor - West View"
  },
  {
    id: "wilshire-2",
    name: "Wilshire 2",
    url: "https://cameras.alertcalifornia.org/?pos=34.0908_-118.4192_12&id=Axis-Wilshire2", 
    location: "Wilshire Corridor - East View"
  },
  {
    id: "topanga-1",
    name: "Topanga 1",
    url: "https://cameras.alertcalifornia.org/?pos=34.0905_-118.5257_12&id=Axis-TopangaCanyon1",
    location: "Topanga - Northwest of UCLA"
  },
  {
    id: "topanga-2",
    name: "Topanga 2",
    url: "https://cameras.alertcalifornia.org/?pos=34.0905_-118.5257_12&id=Axis-TopangaCanyon2",
    location: "Topanga - Northwest of UCLA"
  }
];

export default function LiveCameras() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Live Camera Feeds</h2>
        <a 
          href="https://cameras.alertcalifornia.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Powered by AlertCalifornia
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {UCLA_CAMERAS.map((camera) => (
          <div 
            key={camera.id}
            className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden group cursor-pointer"
            onClick={() => setSelectedCamera(camera)}
          >
            <iframe
              src={camera.url}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {camera.name}
              </div>
              <div className="text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                {camera.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-screen view */}
      {selectedCamera && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setSelectedCamera(null)}
        >
          <div className="w-full max-w-5xl p-4">
            <div className="relative aspect-video">
              <iframe
                src={selectedCamera.url}
                className="w-full h-full rounded-lg border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-white">
              <h3 className="text-xl font-bold">{selectedCamera.name}</h3>
              <p className="text-white/80">{selectedCamera.location}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 