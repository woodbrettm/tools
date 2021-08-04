import contentful from 'contentful-management';
import { API_KEY, SPACE, ENV_ID, LOCALE } from './env';

// SPACE:
// ENV_ID: 'master'
// LOCALE: 'en-US'

const main = async () => {

  const client = contentful.createClient({
    accessToken: API_KEY,
  });

  const space = await client.getSpace(SPACE);
  const env = await space.getEnvironment(ENV_ID);

  const res = await env.getAssets({
    limit: 1000,
  });

  const entryPromises = [];

  for (const asset of res.items) {

    entryPromises.push(env.getEntries({
      links_to_asset: asset.sys.id,
    }));

  }

  const entries = await Promise.all(entryPromises);

  return entries.filter((asset) => asset.items.length > 0);



  for await (asset of assets.items) {

    // entry = await env.getEntries({
    //   links_to_asset: asset.sys.id,
    // });

    // if (entry.items.length > 0) continue;

    // noLinkedAssets.push(asset.fields.title[LOCALE]);

  }

  return noLinkedAssets;

};

const printAssets = (assets) => {
  assets.map((asset) => console.log(asset));
};

main().then((items) => {
  printAssets(items);
});
