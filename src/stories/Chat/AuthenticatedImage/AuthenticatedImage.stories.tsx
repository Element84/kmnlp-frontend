import type { Meta, StoryObj } from "@storybook/react";
import { AuthenticatedImage } from "./AuthenticatedImage";

const meta = {
  title: "Chat/AuthenticatedImage",
  component: AuthenticatedImage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthenticatedImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DirectUrl: Story = {
  args: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/NOAA_logo.svg/220px-NOAA_logo.svg.png",
    alt: "Direct (non-API) image",
  },
};

export const ApiUrl: Story = {
  name: "API URL (authenticated)",
  args: {
    url: "http://localhost:8000/data/user/chats/123/000000",
    alt: "Authenticated API image",
  },
};
