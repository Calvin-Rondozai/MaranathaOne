const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bible translations and EGW book text (database/*.datjson) are large (tens of MB combined).
// A normal .json require() gets its full parsed content baked directly into the JS bundle at
// full, uncompressed size. Registering this extension as an "asset" instead makes Metro treat
// these files like images/fonts: copied into the APK as their own individually-compressed
// entries and loaded on demand at runtime (see database/loadJsonAsset.ts), rather than
// inflating index.android.bundle by their entire combined size on every install.
config.resolver.assetExts.push('datjson');

module.exports = config;
