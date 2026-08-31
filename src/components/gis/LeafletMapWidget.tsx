import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCadastre } from '../../context/CadastreContext';

interface LeafletMapWidgetProps {
  height?: string;
  showControls?: boolean;
  interactive?: boolean;
  showBoundaries?: boolean;
  onParcelSelect?: (parcelId: string) => void;
}

export const LeafletMapWidget: React.FC<LeafletMapWidgetProps> = ({
  height = '100%',
  showControls = true,
  interactive = true,
  showBoundaries = false,
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

    // Base Tile Layer (Free, zero-API-key tile providers)
    const tileUrl = isDark
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Optional Parcel Polygon Boundaries (Disabled by default)
    if (showBoundaries) {
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
                setSelectedParcelId(String(feature.id));
                onParcelSelect?.(String(feature.id));
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
    }

    // Property Pin Markers for all parcels
    parcels.forEach((p) => {
      const isSelected = p.id === selectedParcelId;
      const pinIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `<div class="flex items-center justify-center ${
          isSelected ? 'w-8 h-8 bg-blue-600 ring-4 ring-blue-500/30' : 'w-7 h-7 bg-slate-700 hover:bg-blue-500'
        } rounded-full border-2 border-white shadow-lg text-white font-bold text-xs transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 22 12"></polyline></svg></div>`,
        iconSize: isSelected ? [32, 32] : [28, 28],
        iconAnchor: isSelected ? [16, 16] : [14, 14],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${p.localParcelId}</b><br/>ULPIN: ${p.ulpin}<br/>${p.locationName}`);

      if (interactive) {
        marker.on('click', () => {
          setSelectedParcelId(p.id);
          onParcelSelect?.(p.id);
        });
      }
    });

    return () => {
      map.remove();
    };
  }, [parcels, selectedParcelId, isDark, interactive, showControls, showBoundaries]);

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