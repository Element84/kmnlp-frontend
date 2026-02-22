export { AreaOfInterest } from './AreaOfInterest';
export type { 
  AreaOfInterest as AreaOfInterestType, 
  AreaOfInterestProps, 
  PolygonPoint, 
  PolygonDrawState 
} from './types';
export {
  pointsToPolygon,
  generateAreaId,
  calculatePolygonArea,
  isValidPolygon,
  getPolygonCenter,
  formatAreaSize
} from './utils';