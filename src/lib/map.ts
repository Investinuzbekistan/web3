/**
 * Shared projection for the region map.
 *
 * Both the full map panel and the overview's miniature draw the same features,
 * so the projection lives here rather than being set up twice with two chances
 * to disagree about the fit.
 */
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';

import type { GeoCollection } from './state.svelte';
import { VIZ } from './shared/viz-palette';

export interface ProjectedRegion {
  id: string;
  d: string;
  centroid: [number, number];
}

export function projectRegions(
  geo: GeoCollection | null,
  width: number,
  height: number,
): ProjectedRegion[] {
  if (!geo) return [];
  const collection = geo as unknown as {
    type: 'FeatureCollection';
    features: Feature<Geometry, GeoJsonProperties>[];
  };
  const projection = geoMercator().fitSize([width, height], collection);
  const path = geoPath(projection);
  return collection.features.map((feature) => ({
    id: String(feature.id),
    d: path(feature) ?? '',
    centroid: path.centroid(feature) as [number, number],
  }));
}

const ramp = VIZ.light.sequential;

/** Sequential shade for a value within [min, max]; grey when there is no value. */
export function shadeFor(value: number | undefined, min: number, max: number): string {
  if (value === undefined || max <= min) return '#EEF1F4';
  const t = (value - min) / (max - min);
  return ramp[Math.min(ramp.length - 1, Math.floor(t * ramp.length))] as string;
}

/** True once the fill is dark enough that black label text would fail. */
export const onDark = (hex: string): boolean => ramp.indexOf(hex) >= 4;
