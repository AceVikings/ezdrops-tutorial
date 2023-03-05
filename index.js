const { ethers } = require("ethers");
require("dotenv").config();
const DropperABI = require("./abis/DropperV2.json");

//Let's define addresses first
const NftAddress = "0xB9c9710DC3484376a8ef4e0A35E6D37Ac0d496fb";
const DropperAddress = "0x3a93571eF6266188d6d7CEC2341C0859bd2b11ff";
const RPC = process.env.RPC;

//Then setup the provider, signer and contract using the constants
const provider = new ethers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const Dropper = new ethers.Contract(DropperAddress, DropperABI, signer);

//Now we can start calling function on the contract

const main = async () => {
  //Retrieve fees
  //Note: If you own a VIP token, you don't need this step
  let fees = await Dropper.FEES();

  //Airdrop function signature for 721 reads as:
  //"airDrop721(address contractAddress,pairInfo[] calldata transferInfo,uint vipId)"
  //For this we need to convert our token receiver array into an array of array format
  //Let say we want to transfer token Ids 113 and 114 from our address to 0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f
  let transferInfo = [
    ["113", "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"],
    ["114", "0xb845e20405df993FFEbd8b70Fe29D8f0b5a8cb4f"],
  ];

  //If you have a VIP token use it's token ID (ensure it's not expired) otherwise use tokenId = 0
  let vipId = 0;

  //We need to approve Dropper contract to be able to transfer tokens on our behalf
  await new ethers.Contract(
    NftAddress,
    ["function setApprovalForAll(address,bool)"],
    signer
  ).setApprovalForAll(DropperAddress, true);

  //Make the airdrop transaction and record tx hash
  let tx = await Dropper.airDrop721(NftAddress, transferInfo, vipId, {
    value: fees,
  });

  console.log(tx.hash);

  //Get transaction receipt
  let receipt = await tx.wait();
  console.log(receipt.status === 1 ? "Transfer success" : "Transfer failed");
};

try {
  main();
} catch (err) {
  console.log(err);
}
