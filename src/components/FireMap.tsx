"use client"

import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Legend from "@arcgis/core/widgets/Legend";
import LayerList from "@arcgis/core/widgets/LayerList";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import Search from "@arcgis/core/widgets/Search";
import Expand from "@arcgis/core/widgets/Expand";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

export default function FireMap() {
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
        zoom: 10,
        constraints: {
          minZoom: 8,
          maxZoom: 18
        }
      });

      // Active Wildfires Layer
      const activeFiresLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/0",
        title: "Active Wildfires",
        visible: true,
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
        url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFAP_Perimeters_Current/FeatureServer/0",
        title: "Fire Perimeters",
        visible: true,
        opacity: 0.7,
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
      const hotspotLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/1",
        title: "Thermal Hotspots",
        visible: true,
        popupTemplate: {
          title: "Thermal Detection",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "Confidence", label: "Confidence" },
                { fieldName: "AcquisitionDate", label: "Detected" },
                { fieldName: "Temperature", label: "Temperature (K)" }
              ]
            }
          ]
        }
      });

      // Evacuation Zones Layer
      const evacuationZonesLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/USA_Evacuation_Zones/FeatureServer/0",
        title: "Evacuation Zones",
        visible: true,
        opacity: 0.6,
        definitionExpression: "EVACUATION_STATUS IN ('MANDATORY', 'WARNING', 'ADVISORY')",
        popupTemplate: {
          title: "Evacuation Zone",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "EVACUATION_STATUS", label: "Status" },
                { fieldName: "EVACUATION_TYPE", label: "Type" },
                { fieldName: "DATE_UPDATED", label: "Last Updated" }
              ]
            }
          ]
        }
      });

      // Fire Stations Layer
      const fireStationsLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Fire_Stations/FeatureServer/0",
        title: "Fire Stations",
        visible: true,
        popupTemplate: {
          title: "Fire Station: {NAME}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "ADDRESS", label: "Address" },
                { fieldName: "CITY", label: "City" },
                { fieldName: "STATE", label: "State" },
                { fieldName: "ZIP", label: "ZIP" },
                { fieldName: "TELEPHONE", label: "Phone" }
              ]
            }
          ]
        }
      });

      // Red Flag Warnings Layer
      const redFlagLayer = new FeatureLayer({
        url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/2",
        title: "Red Flag Warnings",
        visible: true,
        opacity: 0.4,
        popupTemplate: {
          title: "Red Flag Warning",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "prod_type", label: "Warning Type" },
                { fieldName: "starttime", label: "Start Time" },
                { fieldName: "endtime", label: "End Time" },
                { fieldName: "description", label: "Description" }
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
        redFlagLayer,
        evacuationZonesLayer,
        firePerimetersLayer,
        activeFiresLayer,
        hotspotLayer,
        fireStationsLayer
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
    }
  }, []);

  return (
    <div ref={mapDiv} className="w-full h-full rounded-lg border border-gray-200 overflow-hidden relative" />
  );
} 