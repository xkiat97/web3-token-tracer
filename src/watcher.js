const { getERC20TokenContract } = require("./contract");
const web3 = require("./provider").getWeb3Provider();
const tronWeb = require("./provider").getTronProvider();

const trxHash = '0x216db2f85ad838dfdeec510fc2fd49bbf2e68e80f33e7a92a2d62d8f90de205e';
const tronTrxHash = process.env.TRON_TRX;

async function testTRC20() {
  const trxData = await tronWeb.getEventsByTransactionId({transactionID: tronTrxHash});
  console.log(trxData);
}

async function testERC20() {
  const trx = await web3.eth.getTransactionReceipt(trxHash);
  console.log(trx);
  if (trx.to && Array.isArray(trx.logs) && trx.logs.length) {
    const contract = getERC20TokenContract(trx.to);
    const { decimals, symbol } = await collectData(contract);
    trx.logs.forEach(log => {
      if (log.data && Array.isArray(log.topics) && log.topics.length === 3) {
        const transactionData = decodeTransactionData(log.data, log.topics);
        const amount = parseValueWithDecimals(transactionData.value, decimals);

        console.log(
          `TRX ${trxHash} - Transfer of ${amount} ${symbol} from ${transactionData.from} to ${transactionData.to}`
        );
      }
    });
  }
  return;
}

async function watchEtherTransfers() {
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
    const transactionData = decodeTransactionData(event.data, event.topics);
    const { decimals, symbol } = await collectData(contract);
    const amount = (new Decimal(Number(transactionData.value))).dividedBy(Math.pow(10, decimals));

    console.log(
      `Trx: ${event.transactionHash} - Transfer of ${amount} ${symbol} from ${transactionData.from} to ${transactionData.to}`
    );
  } catch (ex) {

  }
}

async function collectData(contract) {
  const [decimals, symbol] = await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.symbol().call(),
  ]);
  return { decimals, symbol };
}

function decodeTransactionData(data, topics) {
  const transaction = web3.eth.abi.decodeLog(
    [
      {
        type: "address",
        name: "from",
        indexed: true,
      },
      {
        type: "address",
        name: "to",
        indexed: true,
      },
      {
        type: "uint256",
        name: "value",
        indexed: false,
      },
    ],
    data,
    [topics[0], topics[1], topics[2]]
  );
  return transaction;
}

function parseValueWithDecimals(value, decimals){
  let number = Number(value) || 0;

  if(decimals > 0){
    for(let i = 1; i <= decimals; i++){
      number /= 10;
    }
  }
  
  return number;
}

module.exports = {
  watchEtherTransfers,
  testERC20,
  testTRC20,
};
