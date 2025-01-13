"use client"

import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import Legend from "@arcgis/core/widgets/Legend";
import LayerList from "@arcgis/core/widgets/LayerList";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import Expand from "@arcgis/core/widgets/Expand";
import Home from "@arcgis/core/widgets/Home";
import Zoom from "@arcgis/core/widgets/Zoom";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import Search from "@arcgis/core/widgets/Search";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Compass from "@arcgis/core/widgets/Compass";
import ResizeObserver from 'resize-observer-polyfill';

// Polyfill ResizeObserver if it doesn't exist
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}

interface FireMapProps {
  layerVisibility: {
    // Fire Layers
    activeFires: boolean;
    firePerimeters: boolean;
    redFlagWarnings: boolean;
    // hotspots: boolean;
    // fireWeather: boolean;
    // fireStations: boolean;
    
    // Evacuation Layers
    // estimatedEvacTime: boolean;  // EstimatedGroundEvacuationTime
    // evacuationAreas: boolean;    // Evacuation_Areas
    currentEvacAreas: boolean;   // EvacuationAreas
    // watchEvacAreas: boolean;     // 2024Watch_EvacuationAreas_Public
  };
}

export default function FireMap({ layerVisibility }: FireMapProps) {
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({
      basemap: "hybrid"
    });

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [-118.4452, 34.0689], // UCLA coordinates
      zoom: 11,
      constraints: {
        minZoom: 10,
        maxZoom: 18,
        rotationEnabled: false
      },
      navigation: {
        mouseWheelZoomEnabled: true,
        browserTouchPanEnabled: true,
        momentumEnabled: true
      },
      ui: {
        components: ["zoom", "compass"]
      }
    });

    // Configure map caching
    if (typeof window !== 'undefined') {
      // Enable local caching for basemap tiles
      (map.basemap as any).baseLayers.items.forEach((layer: any) => {
        if (layer.capabilities?.exportTiles) {
          layer.capabilities.exportTiles = true;
        }
      });
    }

    // // Enable touch interactions but don't block default behaviors
    // view.on("drag", (event) => {
    //   // Allow touch events to propagate
    //   if (event.native?.touches) {
    //     event.stopPropagation();
    //   }
    // });

    // Prevent default touch behavior that might close mobile tabs
    mapDiv.current.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Active Wildfires Layer
    const activeFiresLayer = new FeatureLayer({
      url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/0",
      title: "Active Wildfires",
      visible: layerVisibility.activeFires,
      popupTemplate: {
        title: "Wildfire: {IncidentName}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              { fieldName: "FireCause", label: "Cause" },
              { fieldName: "FireDiscoveryDateTime", label: "Discovered" },
              { fieldName: "PercentContained", label: "Containment" },
              { fieldName: "DailyAcres", label: "Size (Acres)" },
              { fieldName: "FireBehaviorGeneral", label: "Behavior" },
              { fieldName: "IncidentManagementOrganization", label: "Managing Organization" }
            ]
          }
        ]
      },
      definitionExpression: "FireDiscoveryDateTime >= TIMESTAMP '2024-01-01 00:00:00'"
    });

    // Fire Perimeter Layer
    const firePerimetersLayer = new FeatureLayer({
      url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/1",
      title: "Fire Perimeters",
      visible: layerVisibility.firePerimeters,
      opacity: 0.7,
      renderer: new UniqueValueRenderer({
        field: "IncidentName",
        defaultSymbol: new SimpleFillSymbol({
          color: [139, 0, 0, 0.7],
          outline: {
            color: [139, 0, 0],
            width: 2
          }
        })
      }),
      popupTemplate: {
        title: "Fire Perimeter: {IncidentName}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              { fieldName: "GISAcres", label: "Area (Acres)" },
              { fieldName: "PercentContained", label: "Containment" },
              { fieldName: "FireCause", label: "Cause" },
              { fieldName: "DateCurrent", label: "Last Updated" }
            ]
          }
        ]
      }
    });

    // Current Evacuation Areas Layer
    const currentEvacAreasLayer = new FeatureLayer({
      url: "https://services5.arcgis.com/bz1uwWPKUInZBK94/arcgis/rest/services/California_Combined_Statewide_Evacuation_Public_View/FeatureServer/0?f=json",
      title: "Current Evacuation Areas",
      visible: layerVisibility.currentEvacAreas,
      opacity: 0.7,
      renderer: new UniqueValueRenderer({
        field: "EVACTYPE",
        defaultSymbol: new SimpleFillSymbol({
          color: [255, 215, 0, 0.3],
          outline: {
            color: [255, 215, 0],
            width: 2
          }
        })
      }),
      popupTemplate: {
        title: "Current Evacuation Area",
        content: [
          {
            type: "fields",
            fieldInfos: [
              { fieldName: "EVACTYPE", label: "Type" },
              { fieldName: "AGENCY", label: "Agency" },
              { fieldName: "DESCRIPTION", label: "Description" }
            ]
          }
        ]
      }
    });

    // Red Flag Warnings Layer
    const redFlagWarningsLayer = new FeatureLayer({
      url: "https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/NWS_Red_Flag_Warning_CAL_FIRE_Public/FeatureServer/0",
      title: "Red Flag Warnings",
      visible: layerVisibility.redFlagWarnings,
      opacity: 0.7,
      renderer: new UniqueValueRenderer({
        field: "Status",
        defaultSymbol: new SimpleFillSymbol({
          color: [255, 0, 0, 0.2],
          outline: {
            color: [255, 0, 0],
            width: 2
          }
        })
      }),
      popupTemplate: {
        title: "Red Flag Warning",
        content: [
          {
            type: "fields",
            fieldInfos: [
              { fieldName: "Status", label: "Status" },
              { fieldName: "Effective", label: "Start Time" },
              { fieldName: "Expires", label: "End Time" },
              { fieldName: "Event", label: "Event Type" }
            ]
          }
        ]
      }
    });

    // Add UCLA marker
    const uclaPoint = new Point({
      longitude: -118.4452,
      latitude: 34.0689
    });

    const uclaMarker = new Graphic({
      geometry: uclaPoint,
      symbol: new SimpleMarkerSymbol({
        color: "#2563eb",
        size: 12,
        outline: {
          color: "white",
          width: 2
        }
      }),
      popupTemplate: {
        title: "UCLA Campus",
        content: "Main campus location"
      }
    });

    // Add layers to map in specific order
    map.addMany([
      redFlagWarningsLayer,
      currentEvacAreasLayer,
      firePerimetersLayer,
      activeFiresLayer,
    ]);
    view.graphics.add(uclaMarker);

    // Wait for both the view and basemap to be ready
    Promise.all([view.when(), map.basemap.load()]).then(() => {
      // Position UI controls
      view.padding = {
        top: 15,
        right: 15,
        bottom: 30,
        left: 15
      };

      // Add zoom widget
      const zoom = new Zoom({
        view: view
      });
      view.ui.add(zoom, "top-left");

      // Add home widget
      const home = new Home({
        view: view
      });
      view.ui.add(home, "top-left");

      // Add compass widget
      const compass = new Compass({
        view: view
      });
      view.ui.add(compass, "top-left");

      // Add search widget
      const search = new Search({
        view: view,
        popupEnabled: true,
        includeDefaultSources: true
      });
      const searchExpand = new Expand({
        view: view,
        content: search,
        expanded: false,
        expandIcon: "search",
        expandTooltip: "Search locations"
      });
      view.ui.add(searchExpand, "top-right");

      // Add fullscreen widget
      const fullscreen = new Fullscreen({
        view: view
      });
      view.ui.add(fullscreen, "top-right");

      // Add basemap toggle
      const basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "topo-vector"
      });
      view.ui.add(basemapToggle, "top-right");

      // Add scale bar
      const scaleBar = new ScaleBar({
        view: view,
        unit: "dual"
      });
      view.ui.add(scaleBar, "bottom-left");

      // Add legend with custom styling
      const legend = new Legend({
        view: view,
        style: {
          type: "card",
          layout: "side-by-side"
        }
      });
      const legendExpand = new Expand({
        view: view,
        content: legend,
        expanded: false,
        expandIcon: "legend",
        expandTooltip: "Show Legend",
        group: "bottom-right"
      });
      view.ui.add(legendExpand, "bottom-right");

      // Add layer list with checkboxes
      const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: (event) => {
          const item = event.item;
          item.panel = {
            content: "legend",
            open: true
          };
        }
      });
      const layerListExpand = new Expand({
        view: view,
        content: layerList,
        expanded: false,
        expandIcon: "layers",
        expandTooltip: "Toggle Layers",
        group: "bottom-right"
      });
      view.ui.add(layerListExpand, "bottom-right");
    }).catch(error => {
      console.error("Error loading map:", error);
    });

    // Query for fires near UCLA
    activeFiresLayer.when(() => {
      const query = activeFiresLayer.createQuery();
      query.where = "1=1";
      query.outFields = ["*"];
      query.returnGeometry = true;
      query.distance = 50;
      query.units = "miles";
      query.geometry = uclaPoint;
      
      activeFiresLayer.queryFeatures(query).then((results) => {
        if (results.features.length > 0) {
          console.log(`Found ${results.features.length} fires within 50 miles of UCLA`);
        }
      });
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [layerVisibility]);

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-gray-200 overflow-hidden relative">
      <div ref={mapDiv} className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
      <style jsx global>{`
        .esri-ui {
          z-index: 40 !important;
        }
        .esri-expand__container {
          background-color: white !important;
          color: #6b7280 !important;
        }
        .esri-widget {
          background-color: white !important;
          color: #6b7280 !important;
        }
        .esri-widget--button {
          background-color: white !important;
          color: #6b7280 !important;
          border: 1px solid #e5e7eb !important;
        }
        .esri-widget--button:hover {
          background-color: #f3f4f6 !important;
          color: #374151 !important;
        }
        .esri-popup {
          z-index: 50 !important;
        }
        .esri-view-surface {
          outline: none !important;
        }
      `}</style>
    </div>
  );
} 