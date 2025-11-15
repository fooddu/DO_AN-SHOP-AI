// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Đây là plugin BẮT BUỘC cho react-native-reanimated
    'react-native-reanimated/plugin',
  ],
};