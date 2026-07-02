const dns = require("node:dns").promises;

(async () => {
  try {
    const records = await dns.resolveSrv(
      "_mongodb._tcp.democluster.us97fhu.mongodb.net"
    );
    console.log("SUCCESS:");
    console.log(records);
  } catch (err) {
    console.log("FAILED:");
    console.error(err);
  }
})();