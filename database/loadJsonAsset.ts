import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const cache = new Map<number, Promise<unknown>>();

// Reads the JSON content of a require()'d .datjson module at runtime instead of it being
// parsed and baked into the JS bundle at build time — see metro.config.js for why these
// specific files use that extension. `moduleId` is whatever `require('./foo.datjson')`
// returns (an asset reference number, since the extension is registered in assetExts).
export function loadJsonAsset<T>(moduleId: number): Promise<T> {
  let promise = cache.get(moduleId);
  if (!promise) {
    promise = (async () => {
      const asset = Asset.fromModule(moduleId);
      await asset.downloadAsync();
      const text = await FileSystem.readAsStringAsync(asset.localUri ?? asset.uri);
      return JSON.parse(text);
    })();
    cache.set(moduleId, promise);
  }
  return promise as Promise<T>;
}
