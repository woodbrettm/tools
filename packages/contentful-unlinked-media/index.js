import contentful from 'contentful';
import fs from 'fs';
import fileDialog from 'node-file-dialog';
import config from './config.js';

const timeOut = (time) => {
  const promise = new Promise((r) => setTimeout(r, time));
  return promise;
};

const createClient = () => {
  const prefix = config.INCLUDE_DRAFT ? 'preview' : 'cdn';
  const client = contentful.createClient({
    accessToken: config.API_KEY,
    space: config.SPACE_ID,
    env: config.ENV,
    host: `${prefix}.contentful.com`,
  });
  return client;
};

const getEntriesByLinkedAssetId = async (client, assets = []) => {
  const promises = [];
  for (const asset of assets) {
    const rateLimit = timeOut(75);
    promises.push(
      client.getEntries({
        limit: 1,
        links_to_asset: asset.sys.id,
      }),
    );
    await rateLimit;
  }
  const res = await Promise.all(promises);
  return res;
};

const getIndexesOfEmptyResults = (results = []) => {
  const indexes = results.reduce((emptyResults, result, index) => {
    if (result.items.length === 0) {
      emptyResults.push(index);
    }
    return emptyResults;
  }, []);
  return indexes;
};

const getAssetsByIndexes = (assets, indexes) => {
  const filteredAssets = [];
  for (const index of indexes) {
    filteredAssets.push(assets[index]);
  }
  return filteredAssets;
};

const removeLinkedAssets = async (client, assets = []) => {
  const entries = await getEntriesByLinkedAssetId(client, assets);
  const emptyResIndexes = getIndexesOfEmptyResults(entries);
  const unlinkedAssets = getAssetsByIndexes(assets, emptyResIndexes);
  return unlinkedAssets;
};

const getAllUnlinkedAssets = async (client) => {

  let totalAssets;
  let skip = 0;
  const limit = 100;
  const allUnlinkedAssets = [];

  do { // while skip < total

    const { total, items: assets } = await client.getAssets({ limit, skip });
    const unlinkedAssets = await removeLinkedAssets(client, assets);
    allUnlinkedAssets.push(...unlinkedAssets);

    if (!totalAssets) totalAssets = total;
    skip += limit;

    // FIX: 600 assets of 501 checked
    console.info(`${skip} assets of ${totalAssets} checked`);

  } while (skip < totalAssets);

  return allUnlinkedAssets;

};

const createReport = async (unlinkedAssets = []) => {
  let fileContents = `${unlinkedAssets.length} Results:\n\n`;
  for (const asset of unlinkedAssets) {
    fileContents += `${asset.sys.id}\n${asset.fields.title}\n\n`;
  }
  try {
    const dir = await fileDialog({ type: 'directory' });
    await fs.promises.writeFile(`${dir[0]}\\report.txt`, fileContents);
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {

  const client = createClient();
  console.info('Client Created');
  console.info('Media Checking Started');
  const unlinkedAssets = await getAllUnlinkedAssets(client);
  console.info('Media Checking Complete');
  console.info(`Found ${unlinkedAssets.length} Results`);

  createReport(unlinkedAssets);

};

main();
