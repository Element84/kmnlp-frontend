import type { Meta, StoryObj } from "@storybook/react";
import type { FeatureCollection } from "geojson";
import { UploadAOIModal } from "./UploadAOIModal";

const meta = {
  title: "Map/UploadAOIModal",
  component: UploadAOIModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A modal dialog with drag-and-drop functionality for uploading Area of Interest files. Only accepts GeoJSON (.geojson, .json) files and validates them before accepting.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Whether the modal is visible",
    },
    onClose: { action: "close" },
    onGeoJSONUpload: { 
      action: "GeoJSON uploaded",
      description: "Callback fired when valid GeoJSON is successfully uploaded and parsed"
    },
  },
} satisfies Meta<typeof UploadAOIModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Modal closed"),
    onGeoJSONUpload: (_data: FeatureCollection, _fileName: string) => {
      // console.log(`GeoJSON uploaded: ${fileName}`);
      // console.log(`Received ${data.features.length} feature(s)`);
      // console.log("Data:", data);
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log("Modal closed"),
    onGeoJSONUpload: (_data: FeatureCollection, fileName: string) =>
      console.log(`GeoJSON uploaded: ${fileName}`),
  },
};
