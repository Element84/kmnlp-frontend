

import "@testing-library/jest-dom";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

// Apply the project annotations to the test runner
setProjectAnnotations(projectAnnotations);
