import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCadastre } from '../../context/CadastreContext';

interface LeafletMapWidgetProps {
  height?: string;
  showControls?: boolean;
  interactive?: boolean;
  onParcelSelect?: (parcelId: string) => void;
}

export const LeafletMapWidget: React.FC<LeafletMapWidgetProps> = ({
  height = '100%',
  showControls = true,
  interactive = true,
  onParcelSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { parcels, selectedParcelId, setSelectedParcelId, isDark } = useCadastre();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet default marker icons in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const selectedP = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
    const initialCenter: [number, number] = [selectedP?.latitude || 12.9716, selectedP?.longitude || 77.5946];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 17,
      zoomControl: showControls,
      attributionControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    });
    mapInstanceRef.current = map;

    // Base Tile Layer (Reliable CartoDB tiles for both Dark & Light mode)
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      maxNativeZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    // Render Parcels
    const features: any = {
      type: 'FeatureCollection',
      features: parcels.map((p) => ({
        ...p.boundaryGeoJSON,
        id: p.id,
        properties: {
          id: p.id,
          ulpin: p.ulpin,
          localId: p.localParcelId,
          landUse: p.landUse,
          area: p.areaSqM,
          name: p.locationName,
        },
      })),
    };

    const geoLayer = L.geoJSON(features, {
      style: (feature) => {
        const isSelected = feature?.id === selectedParcelId;
        return {
          color: isSelected ? '#0284c7' : '#475569',
          weight: isSelected ? 3 : 1.5,
          opacity: 0.9,
          fillColor: isSelected ? '#0284c7' : '#94a3b8',
          fillOpacity: isSelected ? 0.35 : 0.15,
        };
      },
      onEachFeature: (feature, layer) => {
        if (!interactive) return;

        layer.on({
          click: () => {
            if (feature.id) {
              setSelectedParcelId(feature.id);
              onParcelSelect?.(feature.id);
            }
          },
          mouseover: (e) => {
            const l = e.target;
            if (feature.id !== selectedParcelId) {
              l.setStyle({ fillOpacity: 0.3, weight: 2, color: '#38bdf8' });
            }
          },
          mouseout: (e) => {
            const l = e.target;
            if (feature.id !== selectedParcelId) {
              l.setStyle({ fillOpacity: 0.15, weight: 1.5, color: '#475569' });
            }
          },
        });

        // Tooltip
        layer.bindTooltip(
          `<strong>${feature.properties.localId}</strong><br/>ULPIN: ${feature.properties.ulpin}<br/>${feature.properties.area} m² (${feature.properties.landUse})`,
          { className: 'cadastre-tooltip font-sans text-xs', sticky: true }
        );
      },
    }).addTo(map);
    geojsonLayerRef.current = geoLayer;

    // Building marker on selected parcel
    if (selectedP) {
      const pinIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg text-white font-bold text-xs"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([selectedP.latitude, selectedP.longitude], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${selectedP.localParcelId}</b><br/>${selectedP.locationName}`);
    }

    return () => {
      map.remove();
    };
  }, [parcels, selectedParcelId, isDark, interactive, showControls]);

  // Pan to parcel when selectedParcelId changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const p = parcels.find((item) => item.id === selectedParcelId);
    if (p) {
      mapInstanceRef.current.setView([p.latitude, p.longitude], 17, { animate: true });
    }
  }, [selectedParcelId, parcels]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
