require("./env");
const trx = require("./transaction");
// const watcher = require("./watcher");
// const confirm = require("./confirm");

const ethTrx =
  "0x216db2f85ad838dfdeec510fc2fd49bbf2e68e80f33e7a92a2d62d8f90de205e";
const tronTrx =
  "539afdf815cba71d9ed04acacdbab5388c07cf092751725b7ef2f39b9d1cadd9";

trx.getERC20Transfer(ethTrx);
trx.getTRC20Transfer(tronTrx);
// confirm(ethTrx);
