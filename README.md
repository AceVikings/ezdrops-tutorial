# EzDrops Tutorial

We start by installing dependency packages in our project, these are:

1. Ethers
2. Dotenv

For this do:

```
npm i ethers dotenv
```

Next in your directory create an index.js file and an .env file <br>

<b>Note: </b>Make sure to add .env in your .gitgnore file if you're planning to push your commits to public repositores.

In the .env file add the JSON RPC URL you for the network in use, we are going to use Polygon Mumbai for this example and have therefore are using Polygon's RPC. Next add your private for the account that owns the NFTs.

.env file:

```
RPC = <your RPC URL>
PRIVATE_KEY = <your Private key>
```

In the index.js we start by importing these dependencies:

```
const { ethers } = require("ethers");
require("dotenv").config();
```

We would also need ABI for the Dropper which you can find on our website, let's import that too:

```
const DropperABI = require("./abis/DropperV2.json");
```

Next we define the addresses in use:

```
const NftAddress = "<your nft address>";
const DropperAddress = "<dropper contract addresses>";
const RPC = process.env.RPC;
```

And then we use all these to setup our signer and contract

```
const provider = new ethers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const Dropper = new ethers.Contract(DropperAddress, DropperABI, signer);
```

Now let's create an async main function and call it at the end of our index.js file, it'd look something like:

```
const main = async () => {
}

try {
    main();
} catch (err) {
    console.log(err);
}
```

Inside the main function we start by retrieving the fees:

```
let fees = await Dropper.FEES();
```

<b>Note:</b> This is only required if you don't have a VIP token.

If you have a VIP token use it's token ID (ensure it's not expired) otherwise use vipId = 0

```
  let vipId = 0;
```

Airdrop function signature for 721 reads as: <br> "airDrop721(address contractAddress,pairInfo[] calldata transferInfo,uint vipId)" <br>
For this we need to convert our token receiver array into an array of array format <br>
Lets say we want to transfer token Ids 113 and 114 from our address to "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"

```
  let transferInfo = [
    ["113", "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"],
    ["114", "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"],
  ];
```

For bigger data sets you can generate this programmatically too!

Next you need to approve Dropper contract to transfer tokens on your behalf, for this we use setApprovalForAll function:

```
await new ethers.Contract(
    NftAddress,
    ["function setApprovalForAll(address,bool)"],
    signer
).setApprovalForAll(DropperAddress, true);
```

Finally we can Airdrop our tokens:

```
  let tx = await Dropper.airDrop721(NftAddress, transferInfo, vipId, {
    value: fees,
  });
```

We can receive the tx hash by using tx.hash value

```
console.log(tx.hash);
```

Our main function looks like:

```
const main = async () => {
  let fees = await Dropper.FEES();

  let transferInfo = [
    ["113", "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"],
    ["114", "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"],
  ];

  let vipId = 0;

  await new ethers.Contract(
    NftAddress,
    ["function setApprovalForAll(address,bool)"],
    signer
  ).setApprovalForAll(DropperAddress, true);


  let tx = await Dropper.airDrop721(NftAddress, transferInfo, vipId, {
    value: fees,
  });

  console.log(tx.hash);

  let receipt = await tx.wait();
  console.log(receipt.status === 1 ? "Transfer success" : "Transfer failed");
};
```

That's it, that's how you interact with EzDrops contract to Airdrop tokens to up to 100 users in a single transaction!
