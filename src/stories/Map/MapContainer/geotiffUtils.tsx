import { fromUrl } from "geotiff";
import * as d3 from "d3";
import { MapViewport } from "./types";
import { getD3ColorScheme } from "../MapControls/LegendContents";
import * as proj4Module from "proj4";
import { calculateViewportFromCOG } from "./viewport-utils";

// proj4 default export workaround
const proj4 = (proj4Module as any).default || proj4Module;

/**
 * Extract nodata value from GeoTIFF image metadata
 * @param image - GeoTIFF image object
 * @returns nodata value or null if not found
 */
const extractNodataValue = (image: any): number | null => {
  try {
    const fileDirectory = image.fileDirectory;

    // Check for standard TIFF nodata tag (GDAL_NODATA)
    if (fileDirectory?.GDAL_NODATA !== undefined) {
      const nodataValue = parseFloat(fileDirectory.GDAL_NODATA);
      if (!isNaN(nodataValue)) {
        return nodataValue;
      }
    }

    // Check GDAL metadata for nodata value
    const gdalMetadata = fileDirectory?.GDAL_METADATA;
    if (gdalMetadata && typeof gdalMetadata === "string") {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gdalMetadata, "text/xml");
        const items = xmlDoc.getElementsByTagName("Item");

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const name = item.getAttribute("name");
          const value = item.textContent;

          if (
            name &&
            (name.toLowerCase().includes("nodata") ||
              name.toLowerCase().includes("_fillvalue"))
          ) {
            const nodataValue = parseFloat(value || "");
            if (!isNaN(nodataValue)) {
              console.log(
                `Found nodata value in GDAL metadata (${name}):`,
                nodataValue
              );

              return nodataValue;
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse GDAL metadata for nodata:", error);
      }
    }

    // Check for common nodata values by examining the data statistics
    // This is a fallback that could be implemented later if needed
    console.log("No nodata value found in GeoTIFF metadata");

    return null;
  } catch (error) {
    console.error("Error extracting nodata value:", error);
    return null;
  }
};

interface LoadCOGParams {
  cogUrl: string;
  viewport: MapViewport;
  setCogLoading: (loading: boolean) => void;
  setCogError: (error: string | null) => void;
  onViewportChange: (viewport: MapViewport) => void;
  setCogSource: (source: any) => void;
  cancelled: React.MutableRefObject<boolean>;
  setCogDataRange?: (range: { min: number; max: number } | null) => void;
  colorScheme?: string;
}

export const loadCOG = async (
  cogUrl: string,
  viewport: MapViewport,
  setCogLoading: (loading: boolean) => void,
  setCogError: (error: string | null) => void,
  onViewportChange: (viewport: MapViewport) => void,
  setCogSource: (source: any) => void,
  cancelled: React.MutableRefObject<boolean>,
  setCogDataRange?: (range: { min: number; max: number } | null) => void,
  colorScheme: string = "inferno",
  legendMin?: number,
  legendMax?: number
) => {
  console.log("Loading COG from URL:", cogUrl);

  setCogLoading(true);
  setCogError(null);

  try {
    // Use remote reading for Cloud Optimized GeoTIFFs instead of loading entire file
    // This reads only the TIFF headers and directory structure remotely
    const tiff = await fromUrl(cogUrl);

    if (cancelled.current) return;

    const image = await tiff.getImage();

    // Only read metadata initially, not the full raster data
    if (cancelled.current) return;

    // Get image metadata
    const width = image.getWidth();
    const height = image.getHeight();
    const bbox = image.getBoundingBox();
    const geoKeys = (image as any).getGeoKeys(); // GeoKeys not in types
    console.log("GeoKeys:", geoKeys);

    // Get additional metadata
    const fileDirectory = (image as any).fileDirectory;
    const origin = (image as any).getOrigin?.() || null;
    const resolution = (image as any).getResolution?.() || null;
    const gdalMetadata = fileDirectory?.GDAL_METADATA || null;

    // Parse GDAL metadata XML to JSON
    let gdalMetadataJson: Record<string, any> = {};
    if (gdalMetadata && typeof gdalMetadata === "string") {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gdalMetadata, "text/xml");
        const items = xmlDoc.getElementsByTagName("Item");

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const name = item.getAttribute("name");
          const value = item.textContent;
          if (name && value !== null) {
            gdalMetadataJson[name] = value;
          }
        }
      } catch (error) {
        console.error("Failed to parse GDAL metadata XML:", error);
      }
    }

    const nodataValue = extractNodataValue(image);
    console.log("Extracted nodata value:", nodataValue);

    // Check for scale/offset metadata that might explain the 100x factor
    const sampleFormat = fileDirectory?.SampleFormat;
    const bitsPerSample = fileDirectory?.BitsPerSample;

    // Look for scale factors in various metadata locations
    const possibleScaleKeys = [
      "SCALE",
      "scale_factor",
      "NETCDF_DIM_scale_factor",
      "Scale",
      "SCALE_FACTOR",
      "scaling_factor",
      "scale",
      "Scale_Factor",
    ];
    const possibleOffsetKeys = [
      "OFFSET",
      "add_offset",
      "NETCDF_DIM_add_offset",
      "Offset",
      "ADD_OFFSET",
      "offset",
      "Offset_Value",
    ];

    let foundScale = null;
    let foundOffset = null;

    for (const key of possibleScaleKeys) {
      if (gdalMetadataJson?.[key]) {
        foundScale = gdalMetadataJson[key];
        break;
      }
    }

    for (const key of possibleOffsetKeys) {
      if (gdalMetadataJson?.[key]) {
        foundOffset = gdalMetadataJson[key];
        break;
      }
    }
    // console.log("=== Data Type Debug Info ===");
    //     console.log("Sample Format:", sampleFormat);
    //     console.log("Bits Per Sample:", bitsPerSample);
    //     console.log("Found Scale Factor:", foundScale);
    //     console.log("Found Offset:", foundOffset);
    //     console.log("File Directory:", fileDirectory);
    //     console.log("GDAL Metadata:", gdalMetadataJson);
    //     console.log("===============================");

    // // Console log all metadata
    // console.log("=== GeoTIFF Metadata ===");
    // console.log("Width:", width);
    // console.log("Height:", height);
    // console.log("Bounding Box:", bbox);
    // console.log("Origin:", origin);
    // console.log("Resolution:", resolution);
    // console.log("GeoKeys:", geoKeys);
    // console.log("File Directory:", fileDirectory);
    // console.log("Sample Format:", fileDirectory?.SampleFormat);
    // console.log("Bits Per Sample:", fileDirectory?.BitsPerSample);
    // console.log("Samples Per Pixel:", fileDirectory?.SamplesPerPixel);
    // console.log("Photometric Interpretation:", fileDirectory?.PhotometricInterpretation);
    // console.log("GDAL Metadata (raw):", gdalMetadata);
    // console.log("GDAL Metadata (parsed JSON):", gdalMetadataJson);
    // console.log("========================");
    // Validate bounding box coordinates
    if (!bbox || bbox.length !== 4) {
      throw new Error("Invalid bounding box from GeoTIFF");
    }

    const [minX, minY, maxX, maxY] = bbox;
    // console.log("=== Coordinate Debug ===");
    // console.log("Raw bbox:", bbox);
    // console.log(
    //   "Parsed: minX:",
    //   minX,
    //   "minY:",
    //   minY,
    //   "maxX:",
    //   maxX,
    //   "maxY:",
    //   maxY
    // );
    // console.log("Width x Height:", width, "x", height);
    // console.log("=======================");

    // Assume all COGs are in EPSG:3857 (Web Mercator)
    // Convert bbox from EPSG:3857 to EPSG:4326 (lat/lon) for MapLibre

    const bottomLeft = proj4("EPSG:3857", "EPSG:4326", [minX, minY]);
    const topRight = proj4("EPSG:3857", "EPSG:4326", [maxX, maxY]);

    // MapLibre expects coordinates in [top-left, top-right, bottom-right, bottom-left] order

    const coordinates = [
      [bottomLeft[0], topRight[1]], // Top-Left (minX, maxY)
      [topRight[0], topRight[1]], // Top-Right (maxX, maxY)
      [topRight[0], bottomLeft[1]], // Bottom-Right (maxX, minY)
      [bottomLeft[0], bottomLeft[1]], // Bottom-Left (minX, minY)
    ];
    // console.log("=== Coordinate Debug ===");
    // console.log("Raw bbox:", bbox);
    // console.log("Bottom Left (lat/lon):", bottomLeft);
    // console.log("Top Right (lat/lon):", topRight);
    // console.log("Coordinates for MapLibre:", coordinates);
    // Remote reading optimization: Only read the data we need at the resolution we need
    // Instead of loading the entire TIFF into memory, we read at a limited resolution
    const maxDisplaySize = 2048; // Limit display resolution to prevent memory issues
    const readWidth = Math.min(width, maxDisplaySize);
    const readHeight = Math.min(height, maxDisplaySize);

    // Read raster data at potentially reduced resolution with resampling
    // This significantly reduces memory usage for large COGs
    const rasters = await image.readRasters({
      width: readWidth,
      height: readHeight,
      resampleMethod: "bilinear",
    });

    if (cancelled.current) return;

    // Create canvas to render the COG data
    const canvas = document.createElement("canvas");
    canvas.width = readWidth;
    canvas.height = readHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const imageData = ctx.createImageData(readWidth, readHeight);
      const data = imageData.data;
      let rasterData: any = rasters[0];

      // Apply scale/offset correction from GDAL metadata
      const scaleFromMetadata = parseFloat(foundScale) || null;
      const offsetFromMetadata = parseFloat(foundOffset) || null;

      if (scaleFromMetadata) {
        console.log(`Applying scale factor: ${scaleFromMetadata}`);

        rasterData = rasterData.map(
          (value: number) => value * scaleFromMetadata
        );
      }

      if (offsetFromMetadata) {
        console.log(`Applying offset: ${offsetFromMetadata}`);

        rasterData = rasterData.map(
          (value: number) => value + offsetFromMetadata
        );
      }

      // Use legend min/max if provided, otherwise compute from raster data
      let min: number;
      let max: number;

      if (legendMin !== undefined && legendMax !== undefined) {
        min = legendMin;
        max = legendMax;
        console.log(`Using API legend range: min=${min}, max=${max}`);
      } else {
        // Fallback: compute min/max for scaling
        min = Infinity;
        max = -Infinity;
        for (let i = 0; i < rasterData.length; i++) {
          const value = rasterData[i];
          if (value === nodataValue) continue;
          if (value < min) min = value;
          if (value > max) max = value;
        }
        console.log(`Computed raster data range: min=${min}, max=${max}`);
      }

      // Store the actual data range for the legend
      if (setCogDataRange) {
        setCogDataRange({ min, max });
      }

      // ✅ Use d3 color scale with dynamic color scheme
      const colorInterpolator = getD3ColorScheme(colorScheme);
      const colorScale = d3
        .scaleSequential(colorInterpolator)
        .domain([min, max]);

      for (let y = 0; y < readHeight; y++) {
        for (let x = 0; x < readWidth; x++) {
          const srcIdx = y * readWidth + x;
          const pixelIndex = (y * readWidth + x) * 4;
          const value = rasterData[srcIdx];
          const colorValue = d3.color(colorScale(value));
          const rgbColor = colorValue?.rgb();

          if (value === nodataValue || isNaN(value)) {
            data[pixelIndex + 3] = 0; // Fully transparent
          } else {
            const r = rgbColor?.r ?? 0;
            const g = rgbColor?.g ?? 0;
            const b = rgbColor?.b ?? 0;
            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b;
            data[pixelIndex + 3] = 255; // Fully opaque
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to blob URL instead of data URL
      canvas.toBlob((blob) => {
        if (blob && !cancelled.current) {
          const url = URL.createObjectURL(blob);

          // Create source configuration
          const source = {
            type: "image",
            url: url,
            coordinates: coordinates,
          };

          setCogSource(source);

          // Update viewport to show the COG extent using consolidated utility
          const newViewport = calculateViewportFromCOG(coordinates, {
            currentViewport: viewport,
            preserveOrientation: true,
            minZoom: 1,
            maxZoom: 18,
          });
          onViewportChange(newViewport);
        }
      });
    }

    setCogLoading(false);
  } catch (error: any) {
    if (!cancelled.current) {
      console.error("Error loading COG:", error);
      setCogError(error.message || "Failed to load COG");
      setCogLoading(false);
    }
  }
};
