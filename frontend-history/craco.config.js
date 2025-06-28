// craco.config.js
module.exports = {
  jest: {
    configure: {
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(axios)/)'
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
    },
  },
};
