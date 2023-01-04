const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');


const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
require('dotenv').config();

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

const STREAMS_KEY = "api";
const GROUP_NAME = "trade-group";
const CONSUMER_ID = "consumer-".concat(uuidv4());



async function main () {
  await client.xgroup('CREATE', STREAMS_KEY,
                       GROUP_NAME, '$', 'MKSTREAM')
                      .catch(() => console.log(`Consumer ${CONSUMER_ID} group already exists`));

  while (true) {
    const [[, records]] = await client.xreadgroup(
      'GROUP', GROUP_NAME, CONSUMER_ID, 'BLOCK', '0',
      'COUNT', '1', 'STREAMS', STREAMS_KEY, '>');
    for (const [id, [, request]] of records) {
      await processAndAck(id, request);
    }
  }
}

async function processAndAck (id, request) {
  const req = JSON.parse(request);

  await client.xack(STREAMS_KEY, GROUP_NAME, id);
 
  if (request) {
    console.log(`id: ${id}, user_id: ${req.user_id}, type: ${req.type}, amount: ${req.amount}, symbol: ${req.symbol}`);
  }
}

main().catch(err => console.error(err));

