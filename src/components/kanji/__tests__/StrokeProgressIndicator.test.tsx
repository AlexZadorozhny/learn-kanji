import React from 'react';
import { render } from '@testing-library/react-native';
import StrokeProgressIndicator from '../StrokeProgressIndicator';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    Svg: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    Path: (props: any) => React.createElement(View, props),
  };
});

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  useTheme: () => ({
    colors: {
      primary: '#6200ee',
      surface: '#ffffff',
      outline: '#cccccc',
      outlineVariant: '#999999',
    },
  }),
}));

describe('StrokeProgressIndicator', () => {
  const mockStrokePaths = [
    'M 10 10 L 50 50',
    'M 20 20 L 60 60',
    'M 30 30 L 70 70',
    'M 40 40 L 80 80',
    'M 50 50 L 90 90',
  ];

  it('renders nothing when totalStrokes is 0', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={0}
        currentStrokeIndex={0}
        strokePaths={[]}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders correct number of stroke thumbnails', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={5}
        currentStrokeIndex={2}
        strokePaths={mockStrokePaths}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with currentStrokeIndex at 0 (first stroke)', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={5}
        currentStrokeIndex={0}
        strokePaths={mockStrokePaths}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with currentStrokeIndex in middle', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={5}
        currentStrokeIndex={2}
        strokePaths={mockStrokePaths}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with currentStrokeIndex at last stroke', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={5}
        currentStrokeIndex={4}
        strokePaths={mockStrokePaths}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles single stroke', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={1}
        currentStrokeIndex={0}
        strokePaths={['M 10 10 L 50 50']}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles many strokes', () => {
    const manyPaths = Array.from(
      { length: 15 },
      (_, i) => `M ${i * 5} ${i * 5} L ${50 + i * 5} ${50 + i * 5}`
    );
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={15}
        currentStrokeIndex={7}
        strokePaths={manyPaths}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles missing stroke paths gracefully', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={5}
        currentStrokeIndex={2}
        strokePaths={[]}
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles all strokes completed', () => {
    const { toJSON } = render(
      <StrokeProgressIndicator
        totalStrokes={5}
        currentStrokeIndex={5}
        strokePaths={mockStrokePaths}
      />
    );
    expect(toJSON()).not.toBeNull();
  });
});
