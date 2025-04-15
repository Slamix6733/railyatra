const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      features: {
        "custom-properties": false,
        "nesting-rules": true
      }
    }
  },
};

export default config;
