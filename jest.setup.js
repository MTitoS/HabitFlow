process.env.TZ = 'UTC';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: jest.fn(async () => {}),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const create = (name) => (props) => React.createElement(View, props);
  return {
    __esModule: true,
    default: create('Svg'),
    Svg: create('Svg'),
    Circle: create('Circle'),
    Line: create('Line'),
    Rect: create('Rect'),
    Path: create('Path'),
    Polygon: create('Polygon'),
    G: create('G'),
    Text: create('Text'),
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const fake = { __esModule: true };
  return new Proxy(fake, {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop in target) return target[prop];
      return (props) => React.createElement(View, props);
    },
  });
});