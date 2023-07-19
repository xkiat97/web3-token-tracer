const axios = require("axios");
const web3 = require("./provider").getWeb3Provider();
const hlps = require("./helpers");

async function getTRC20Transfer(trxHash) {
  const trx = (await axios.get(`${process.env.TRONSCAN_API}?hash=${trxHash}`))
    .data;
  const contractAddress = trx["toAddress"];
  const isConfirmed = trx["confirmed"];
  const transfersAllList = trx["transfersAllList"];

  if (
    contractAddress &&
    isConfirmed &&
    Array.isArray(transfersAllList) &&
    transfersAllList.length === 1
  ) {
    const trc20Transfer = transfersAllList[0];
    const amount = hlps.parseValueWithDecimals(
      trc20Transfer["amount_str"],
      trc20Transfer["decimals"]
    );
    return hlps.printTransaction(
      trxHash,
      trc20Transfer["from_address"],
      trc20Transfer["to_address"],
      amount,
      trc20Transfer["symbol"]
    );
  }

  return;
}

async function getERC20Transfer(trxHash) {
  const trx = await web3.eth.getTransactionReceipt(trxHash);
  if (trx.to && Array.isArray(trx.logs) && trx.logs.length === 1) {
    const contract = require("./contract").getERC20TokenContract(trx.to);
    const { decimals, symbol } = await hlps.collectERC20Data(contract);

    const erc20Transfer = trx.logs[0];
    if (
      erc20Transfer.data &&
      Array.isArray(erc20Transfer.topics) &&
      erc20Transfer.topics.length === 3
    ) {
      const transactionData = hlps.decodeERC20Topics(
        erc20Transfer.data,
        erc20Transfer.topics
      );
      const amount = hlps.parseValueWithDecimals(
        transactionData.value,
        decimals
      );
      return hlps.printTransaction(
        trxHash,
        transactionData.from,
        transactionData.to,
        amount,
        symbol
      );
    }
  }
  return;
}

module.exports = {
  getTRC20Transfer,
  getERC20Transfer,
};
