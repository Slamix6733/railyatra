const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      features: {
        "custom-properties": false,
        "nesting-rules": true,
        "color-function": true,
        "color-functional-notation": true
      }
    }
  },
};

export default config;
