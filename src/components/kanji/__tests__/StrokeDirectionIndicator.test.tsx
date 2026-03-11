import { render } from '@testing-library/react-native';
import StrokeDirectionIndicator from '../StrokeDirectionIndicator';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => React.createElement(View, props, children),
    Svg: ({ children, ...props }: any) => React.createElement(View, props, children),
    G: ({ children, ...props }: any) => React.createElement(View, props, children),
    Circle: (props: any) => React.createElement(View, props),
    Polygon: (props: any) => React.createElement(View, props),
  };
});

describe('StrokeDirectionIndicator', () => {
  it('renders nothing when not visible', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 10 L 50 50" visible={false} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders when visible with valid path', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 10 L 50 50" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles simple line path (M L)', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 20 30 L 80 70" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles cubic curve path (M C)', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 10 C 30 30 50 50 70 70" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles quadratic curve path (M Q)', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 10 Q 50 50 90 10" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles multi-segment path', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 10 L 30 30 L 50 20" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles empty or invalid path gracefully', () => {
    const { toJSON: toJSON1 } = render(<StrokeDirectionIndicator strokePath="" visible={true} />);
    expect(toJSON1()).toBeNull();

    const { toJSON: toJSON2 } = render(
      <StrokeDirectionIndicator strokePath="invalid" visible={true} />
    );
    expect(toJSON2()).toBeNull();
  });

  it('handles horizontal right stroke', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 50 L 90 50" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles vertical down stroke', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 50 10 L 50 90" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles complex path with Z command', () => {
    const { toJSON } = render(
      <StrokeDirectionIndicator strokePath="M 10 10 L 50 10 L 50 50 Z" visible={true} />
    );
    expect(toJSON()).not.toBeNull();
  });
});
