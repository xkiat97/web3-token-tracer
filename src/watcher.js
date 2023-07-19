const { getERC20TokenContract } = require("./contract");
const web3 = require("./provider").getWeb3Provider();
// const tronWeb = require("./provider").getTronProvider();

async function watchERC20Transfers() {
  let options = {
    topics: [web3.utils.sha3("Transfer(address,address,uint256)")],
  };
  // Instantiate subscription object
  const subscription = await web3.eth.subscribe("logs", options);
  subscription.on("error", (err) => {
    throw err;
  });
  subscription.on("connected", (nr) =>
    console.log("Subscription on ERC-20 started with ID %s", nr)
  );
  subscription.on("data", onLogsChanged);
}

async function onLogsChanged(event) {
  try {
    const contract = getERC20TokenContract(event.address);
    const transactionData = decodeERC20Topics(event.data, event.topics);
    const { decimals, symbol } = await collectERC20Data(contract);
    const amount = new Decimal(Number(transactionData.value)).dividedBy(
      Math.pow(10, decimals)
    );

    console.log(
      `Trx: ${event.transactionHash} - Transfer of ${amount} ${symbol} from ${transactionData.from} to ${transactionData.to}`
    );
  } catch (ex) {}
}

module.exports = {
  watchERC20Transfers,
};
