function getWeb3Provider() {
  const { Web3 } = require("web3");
  const web3 = new Web3(
    new Web3.providers.WebsocketProvider(
      `${process.env.INFURA_WS_URL}/${process.env.INFURA_API_KEY}`
    )
  );

  return web3;
}

module.exports = {
  getWeb3Provider,
};
