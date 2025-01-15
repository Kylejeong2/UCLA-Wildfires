import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface LayerVisibility {
  activeFires: boolean;
  firePerimeters: boolean;
  redFlagWarnings: boolean;
  currentEvacAreas: boolean;
}

const COOKIE_NAME = 'map_layer_visibility';
const COOKIE_EXPIRY = 365; // days

export function useLayerVisibility() {
  // Initialize state from cookie or defaults
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(() => {
    const savedState = Cookies.get(COOKIE_NAME);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Failed to parse layer visibility cookie:', e);
      }
    }
    // Default values if no cookie exists or parsing fails
    return {
      activeFires: true,
      firePerimeters: true,
      redFlagWarnings: true,
      currentEvacAreas: true
    };
  });

  // Update cookie whenever state changes
  useEffect(() => {
    Cookies.set(COOKIE_NAME, JSON.stringify(layerVisibility), {
      expires: COOKIE_EXPIRY,
      sameSite: 'strict'
    });
  }, [layerVisibility]);

  // Toggle handler for individual layers
  const toggleLayer = (layerName: keyof LayerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  return {
    layerVisibility,
    toggleLayer
  };
} 