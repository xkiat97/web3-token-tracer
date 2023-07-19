const web3 = require("./provider").getWeb3Provider();

async function collectERC20Data(contract) {
  const [decimals, symbol] = await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.symbol().call(),
  ]);
  return { decimals, symbol };
}

function decodeERC20Topics(data, topics) {
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

function parseValueWithDecimals(value, decimals) {
  let number = Number(value) || 0;

  if (decimals > 0) {
    for (let i = 1; i <= decimals; i++) {
      number /= 10;
    }
  }

  return number;
}

function printTransaction(trxHash, from, to, amount, symbol) {
  const log = `TRX ${trxHash} - Transfer of ${amount} ${symbol} from ${from} to ${to}`;
  console.log(log);
  return log;
}

module.exports = {
  collectERC20Data,
  decodeERC20Topics,
  parseValueWithDecimals,
  printTransaction,
};
