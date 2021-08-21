# Contentful Unlinked Media

[![Project Status: WIP](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Contentful doesn't provide a way in the UI to find assets not linked to any entries.

This tool runs through all media/assets in a Contentful space, and outputs those not linked to any entries into a report.txt file. The id and title of each unlinked asset are provided in the report.

## Performance

Since the only method in Contentful's api to find unlinked assets is the following: `.getEntries({ links_to_asset: asset_id })`, the script has to query the entries API once for every asset, which is slow.

Roughly 10 assets per second. So if you have 1000 assets to scan, the script should take roughly 1 minute 40 seconds to complete. The rate is also due in part to Contentful's rate limiting.

To prevent memory usage from growing too much, the script processes batches of 100 assets at a time, until all assets are scanned. When each batch is completed, the progress is shown in the console.


## Todo

- Convert this script into a proper npm package
- Ability to pass filter conditions, allowing to scan a subset of assets/media rather than all of them.


## Usage

Clone the script to your current dir:

```shell
npx degit "woodbrettm/tools/packages/contentful-unlinked-media" contentful-unlinked-media
```

Install dependencies
```shell
yarn install
```

Add a config file to the root of the folder (same level as index.js).

If you want to scan unpublished content, set `INCLUDE_DRAFT` to true, and instead of your content delivery api key, use the content preview API key in your account.

```javascript
// config.js
export default {
  API_KEY: 'yourKeyHere',
  SPACE_ID: 'yourSpaceHere',
  ENV: 'master',
  LOCALE: 'en_US',
  INCLUDE_DRAFT: false,
};
```

Run the script
```shell
yarn index
```

When the script is complete, you'll be prompted to select a directory where `report.txt` will be saved.
