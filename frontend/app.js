let provider;
let signer;
let contract;

const contractAddress = "0xf53A4d118761A262307cffACDaBfbc50b1e1E4B4";

const abi = [

"function deposit() payable",

"function getBalance(address) view returns(uint256)",

"event Deposited(address user,uint256 amount)"

];

// if (typeof window.ethereum !== "undefined") {
//     console.log("MetaMask is installed!");
// } else {
//     console.log("MetaMask not found. Please install it.");
// }

async function testProvider(){
    const providerTest = new ethers.BrowserProvider(window.ethereum);
const network = await providerTest.getNetwork();
console.log("Connected network:", network);

if (network.name !== "sepolia") {
    alert("Please switch MetaMask to Sepolia network!");
    throw new Error("Wrong network");
}
}

testProvider()

async function connectWallet() {

 provider = new ethers.BrowserProvider(
   window.ethereum
 );

 signer = await provider.getSigner();

 contract = new ethers.Contract(
   contractAddress,
   abi,
   signer
 );

 updateBalance();

 listenEvents();

}

async function deposit() {
    if (!contract) {
        alert("Contract not loaded yet. Connect wallet first!");
        return;
    }
 const amount =
 document.getElementById("amount").value;

 const tx =
 await contract.deposit({

   value:
ethers.parseEther(amount)

 });

 await tx.wait();

 updateBalance();

}

async function updateBalance() {

 const address =
 await signer.getAddress();

 const balance =
 await contract.getBalance(address);
 console.log("current balance bbx", await balance)
 document.getElementById("balance")
 .innerHTML =
 "Balance: " +
 ethers.formatEther(balance)
 + " ETH";

}

function listenEvents() {

 contract.on(
 "Deposited",

 (user, amount) => {

   const div =
   document.getElementById("events");

   const el =
   document.createElement("p");

   el.innerText =
   user +
   " deposited " +
   ethers.formatEther(amount) +
   " ETH";

   div.appendChild(el);

 });

}