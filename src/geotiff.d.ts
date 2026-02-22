declare module 'geotiff' {
    export interface GeoTIFFImage {
      getWidth(): number;
      getHeight(): number;
      getBoundingBox(): [number, number, number, number];
      readRasters(options?: any): Promise<any>;
    }
  
    export interface GeoTIFF {
      getImage(index?: number): Promise<GeoTIFFImage>;
    }
  
    export function fromArrayBuffer(
      arrayBuffer: ArrayBuffer
    ): Promise<GeoTIFF>;
  
    export function fromUrl(
      url: string,
      options?: any
    ): Promise<GeoTIFF>;
  
    export function fromBlob(
      blob: Blob
    ): Promise<GeoTIFF>;
  }