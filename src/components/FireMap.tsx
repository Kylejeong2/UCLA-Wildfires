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
import Search from "@arcgis/core/widgets/Search";
import Expand from "@arcgis/core/widgets/Expand";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

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
    if (mapDiv.current) {
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
          maxZoom: 18
        }
      });

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
            color: [139, 0, 0, 0.7], // Darker red
            outline: {
              color: [139, 0, 0], // Matching outline
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

      // MODIS Thermal Hotspots
    //   const hotspotLayer = new FeatureLayer({
    //     url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/1",
    //     title: "Thermal Hotspots",
    //     visible: layerVisibility.hotspots,
    //     popupTemplate: {
    //       title: "Thermal Detection",
    //       content: [
    //         {
    //           type: "fields",
    //           fieldInfos: [
    //             { fieldName: "Confidence", label: "Confidence" },
    //             { fieldName: "AcquisitionDate", label: "Detected" },
    //             { fieldName: "Temperature", label: "Temperature (K)" }
    //           ]
    //         }
    //       ]
    //     }
    //   });

      // Fire Weather Warnings Layer
    //   const fireWeatherLayer = new FeatureLayer({
    //     url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer/0",
    //     title: "Fire Weather Warnings",
    //     visible: layerVisibility.fireWeather,
    //     opacity: 0.6,
    //     renderer: new UniqueValueRenderer({
    //       field: "prod_type",
    //       defaultSymbol: new SimpleFillSymbol({
    //         color: [255, 140, 0, 0.2],
    //         outline: {
    //           color: [255, 140, 0],
    //           width: 1.5
    //         }
    //       }),
    //       uniqueValueInfos: [
    //         {
    //           value: "Fire Weather Watch",
    //           symbol: new SimpleFillSymbol({
    //             color: [255, 140, 0, 0.2],
    //             outline: {
    //               color: [255, 140, 0],
    //               width: 1.5
    //             }
    //           })
    //         },
    //         {
    //           value: "Red Flag Warning",
    //           symbol: new SimpleFillSymbol({
    //             color: [255, 0, 0, 0.2],
    //             outline: {
    //               color: [255, 0, 0],
    //               width: 1.5
    //             }
    //           })
    //         }
    //       ]
    //     }),
    //     popupTemplate: {
    //       title: "{prod_type}",
    //       content: [
    //         {
    //           type: "fields",
    //           fieldInfos: [
    //             { fieldName: "prod_type", label: "Type" },
    //             { fieldName: "starttime", label: "Start Time" },
    //             { fieldName: "endtime", label: "End Time" },
    //             { fieldName: "description", label: "Description" }
    //           ]
    //         }
    //       ]
    //     },
    //     definitionExpression: "prod_type IN ('Fire Weather Watch', 'Red Flag Warning')"
    //   });

      // Fire Stations Layer
    //   const fireStationsLayer = new FeatureLayer({
    //     url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Fire_Stations/FeatureServer/0",
    //     title: "Fire Stations",
    //     visible: layerVisibility.fireStations,
    //     popupTemplate: {
    //       title: "Fire Station: {NAME}",
    //       content: [
    //         {
    //           type: "fields",
    //           fieldInfos: [
    //             { fieldName: "ADDRESS", label: "Address" },
    //             { fieldName: "CITY", label: "City" },
    //             { fieldName: "STATE", label: "State" },
    //             { fieldName: "ZIP", label: "ZIP" },
    //             { fieldName: "TELEPHONE", label: "Phone" }
    //           ]
    //         }
    //       ]
    //     }
    //   });

      // Evacuation Areas Layer
    //   const evacuationAreasLayer = new FeatureLayer({
    //     url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Evacuation_Areas/FeatureServer/261",
    //     title: "Evacuation Areas",
    //     visible: layerVisibility.evacuationAreas,
    //     opacity: 0.7,
    //     renderer: new UniqueValueRenderer({
    //       field: "EVACTYPE",
    //       defaultSymbol: new SimpleFillSymbol({
    //         color: [255, 0, 0, 0.3],
    //         outline: {
    //           color: [255, 0, 0],
    //           width: 2
    //         }
    //       })
    //     }),
    //     popupTemplate: {
    //       title: "Evacuation Area",
    //       content: [
    //         {
    //           type: "fields",
    //           fieldInfos: [
    //             { fieldName: "EVACTYPE", label: "Type" },
    //             { fieldName: "AGENCY", label: "Agency" },
    //             { fieldName: "DESCRIPTION", label: "Description" }
    //           ]
    //         }
    //       ]
    //     }
    //   });

      // 2024 Watch Evacuation Areas Layer
    //   const watchEvacAreasLayer = new FeatureLayer({
    //     url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/2024Watch_EvacuationAreas_Public/FeatureServer/0",
    //     title: "2024 Watch Evacuation Areas",
    //     visible: layerVisibility.watchEvacAreas,
    //     opacity: 0.7,
    //     renderer: new UniqueValueRenderer({
    //       field: "EVACTYPE",
    //       defaultSymbol: new SimpleFillSymbol({
    //         color: [255, 165, 0, 0.3],
    //         outline: {
    //           color: [255, 165, 0],
    //           width: 2
    //         }
    //       })
    //     }),
    //     popupTemplate: {
    //       title: "Watch Evacuation Area",
    //       content: [
    //         {
    //           type: "fields",
    //           fieldInfos: [
    //             { fieldName: "EVACTYPE", label: "Type" },
    //             { fieldName: "AGENCY", label: "Agency" },
    //             { fieldName: "DESCRIPTION", label: "Description" }
    //           ]
    //         }
    //       ]
    //     }
    //   });

      // Estimated Ground Evacuation Time Layer
    //   const evacTimeLayer = new FeatureLayer({
    //     url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/EstimatedGroundEvacuationTime/FeatureServer/0",
    //     title: "Estimated Evacuation Time",
    //     visible: layerVisibility.estimatedEvacTime,
    //     opacity: 0.7,
    //     renderer: new UniqueValueRenderer({
    //       field: "EvacTime",
    //       defaultSymbol: new SimpleFillSymbol({
    //         color: [0, 0, 255, 0.3],
    //         outline: {
    //           color: [0, 0, 255],
    //           width: 1
    //         }
    //       })
    //     }),
    //     popupTemplate: {
    //       title: "Evacuation Time Estimate",
    //       content: [
    //         {
    //           type: "fields",
    //           fieldInfos: [
    //             { fieldName: "EvacTime", label: "Evacuation Time (minutes)" },
    //             { fieldName: "RoadClass", label: "Road Class" }
    //           ]
    //         }
    //       ]
    //     }
    //   });

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
        // fireWeatherLayer,
        // evacTimeLayer,
        // evacuationAreasLayer,
        redFlagWarningsLayer,
        currentEvacAreasLayer,
        // watchEvacAreasLayer,
        firePerimetersLayer,
        activeFiresLayer,
        // hotspotLayer,
        // fireStationsLayer
      ]);
      view.graphics.add(uclaMarker);

      // Position UI controls
      view.padding = {
        top: 15,
        right: 15,
        bottom: 15,
        left: 15
      };

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
        group: "top-left"
      });
      view.ui.add(legendExpand, "bottom-left");

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
        group: "top-left"
      });
      view.ui.add(layerListExpand, "top-left");

      // Add basemap toggle
      const basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "topo-vector"
      });
      view.ui.add(basemapToggle, "top-right");

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

      // Update layer visibility when props change
      return () => {
        if (map) {
          map.destroy();
        }
      };
    }
  }, [layerVisibility]); // Add layerVisibility to dependency array

  return (
    <div className="w-full h-[600px] rounded-lg border border-gray-200 overflow-hidden relative">
      <div ref={mapDiv} className="w-full h-full" />
    </div>
  );
} 