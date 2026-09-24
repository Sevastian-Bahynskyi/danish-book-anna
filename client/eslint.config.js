// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // dist is build output; reactbits holds vendored React Bits components kept close to upstream.
    ignores: ["dist/*", "src/components/reactbits/*"],
  }
]);
