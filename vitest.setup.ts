import '@testing-library/jest-dom';

// Mock scrollIntoView for tests (not available in JSDOM)
Element.prototype.scrollIntoView = () => {};
