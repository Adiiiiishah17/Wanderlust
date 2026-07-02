const dns = require("node:dns").promises;

async function test() {
  try {
    const records = await dns.resolveSrv(
      "_mongodb._tcp.democluster.us97fhu.mongodb.net"
    );
    console.log(records);
  } catch (err) {
    console.error(err);
  }
}

test();