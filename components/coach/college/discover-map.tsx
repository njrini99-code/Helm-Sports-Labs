'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
// @ts-expect-error - react-simple-maps doesn't have type definitions
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

export interface StateRecruitData {
  code: string;
  name: string;
  recruitCount: number;
  byYear: Record<string, number>;
}

interface DiscoverMapProps {
  states: StateRecruitData[];
  selectedState: string | null;
  onSelect: (stateCode: string) => void;
  onClearSelection?: () => void;
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const STATE_NAME_TO_CODE: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

export function DiscoverMap({ states, selectedState, onSelect }: DiscoverMapProps) {
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const stateData = useMemo(() => {
    const map = new Map<string, StateRecruitData>();
    states.forEach((s) => map.set(s.code, s));
    return map;
  }, [states]);

  const maxCount = useMemo(
    () => states.length === 0 ? 1 : Math.max(...states.map((s) => s.recruitCount || 1), 1),
    [states]
  );

  const getFill = (code: string) => {
    const data = stateData.get(code);
    if (!data || data.recruitCount === 0) return '#f1f5f9'; // slate-100
    const intensity = Math.max(0.15, data.recruitCount / maxCount);
    // Emerald gradient: light (#d1fae5) to dark (#059669)
    const r = Math.round(209 - intensity * 130);
    const g = Math.round(250 - intensity * 100);
    const b = Math.round(229 - intensity * 124);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hoveredData = hovered ? stateData.get(hovered) : null;

  return (
    <div className="relative">
      {/* Map Container */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white border border-slate-100">
        <ComposableMap 
          projection="geoAlbersUsa" 
          className="w-full"
          height={340}
          projectionConfig={{
            scale: 1050,
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const code = STATE_NAME_TO_CODE[geo.properties.name as string];
                const isSelected = code === selectedState;
                const isHovered = code === hovered;
                const data = code ? stateData.get(code) : null;
                const hasData = data && data.recruitCount > 0;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e: any) => {
                      if (code && hasData) {
                        setHovered(code);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseMove={(e: any) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => code && hasData && onSelect(code)}
                    style={{
                      default: {
                        fill: code ? getFill(code) : '#f1f5f9',
                        stroke: isSelected ? '#059669' : '#e2e8f0',
                        strokeWidth: isSelected ? 2 : 0.5,
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      },
                      hover: {
                        fill: hasData ? '#6ee7b7' : '#f1f5f9',
                        stroke: hasData ? '#059669' : '#e2e8f0',
                        strokeWidth: hasData ? 1.5 : 0.5,
                        outline: 'none',
                        cursor: hasData ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: code ? getFill(code) : '#f1f5f9',
                        stroke: '#059669',
                        strokeWidth: 2,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      {/* Tooltip */}
      {hovered && hoveredData && hoveredData.recruitCount > 0 && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{left: tooltipPos.x + 12, 
            top: tooltipPos.y - 12,
          }}
        >
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-2xl shadow-lg text-xs font-medium flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {hoveredData.name} — {hoveredData.recruitCount} recruits
          </div>
        </div>
)}
    </div>
  );
}
