const { Web3 } = require("web3");
const validateTransaction = require("./validate");
const confirmEtherTransaction = require("./confirm");
const ETH_ERC20_ABI = require("./abis/eth-erc-20-abi.json");

// Instantiate web3 with WebSocket provider
const web3 = new Web3(
  new Web3.providers.WebsocketProvider(
    `${process.env.INFURA_WS_URL}/${process.env.INFURA_API_KEY}`
  )
);

async function test() {
  const valid = confirmEtherTransaction(
    "0x528db3f1a820d5b73837028eb040c98c202e18395c7e081cc4ee7e8460cc4523"
  );
  console.log(valid);
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
  subscription.on("data", (event) => {
    if (event.topics.length == 3) {
      try {
        const transactionData = decodeTransactionData(event);
        const contract = new web3.eth.Contract(ETH_ERC20_ABI, event.address);
        collectData(contract).then((contractData) => {
          const amount = contractData.decimals; //web3.toWei(contractData.decimals * 1e18);
          console.log(
            `Trx: ${event.transactionHash} - Transfer of ${amount} ${contractData.symbol} from ${transactionData.from} to ${transactionData.to}`
          );
        });
      } catch (ex) {
        console.log(ex);
      }
    }
  });
  // Subscribe to pending transactions
  // subscription
  //   .subscribe((error, result) => {
  //     if (error) console.log(error);
  //   })
  //   .on("data", async (txHash) => {
  //     try {
  //       // Instantiate web3 with HttpProvider
  //       const web3Http = new Web3(process.env.INFURA_URL);

  //       // Get transaction details
  //       const trx = await web3Http.eth.getTransaction(txHash);

  //       const valid = validateTransaction(trx);
  //       // If transaction is not valid, simply return
  //       if (!valid) return;

  //       console.log(
  //         "Found incoming Ether transaction from " +
  //           process.env.WALLET_FROM +
  //           " to " +
  //           process.env.WALLET_TO
  //       );
  //       console.log("Transaction value is: " + process.env.AMOUNT);
  //       console.log("Transaction hash is: " + txHash + "\n");

  //       // Initiate transaction confirmation
  //       confirmEtherTransaction(txHash);

  //       // Unsubscribe from pending transactions.
  //       subscription.unsubscribe();
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
}

function watchTokenTransfers() {
  // Instantiate token contract object with JSON ABI and address
  const tokenContract = new web3.eth.Contract(
    TOKEN_ABI,
    process.env.TOKEN_CONTRACT_ADDRESS,
    (error, result) => {
      if (error) console.log(error);
    }
  );

  // Generate filter options
  const options = {
    filter: {
      _from: process.env.WALLET_FROM,
      _to: process.env.WALLET_TO,
      _value: process.env.AMOUNT,
    },
    fromBlock: "latest",
  };

  // Subscribe to Transfer events matching filter criteria
  tokenContract.events.Transfer(options, async (error, event) => {
    if (error) {
      console.log(error);
      return;
    }

    console.log(
      "Found incoming Pluton transaction from " +
        process.env.WALLET_FROM +
        " to " +
        process.env.WALLET_TO +
        "\n"
    );
    console.log("Transaction value is: " + process.env.AMOUNT);
    console.log("Transaction hash is: " + txHash + "\n");

    // Initiate transaction confirmation
    confirmEtherTransaction(event.transactionHash);

    return;
  });
}

function decodeTransactionData(event) {
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
    event.data,
    [event.topics[0], event.topics[1], event.topics[2]]
  );
  return transaction;
}

async function collectData(contract) {
  const [decimals, symbol] = await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.symbol().call(),
  ]);
  return { decimals, symbol };
}
module.exports = {
  watchEtherTransfers,
  watchTokenTransfers,
  test,
};
