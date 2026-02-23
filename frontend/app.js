// ================== CONFIG ==================
const contractAddress = "0x72132fB9FB8b27DC12D4909f9Eea885Eb9b9DFba";

const abi = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function getBalance(address) view returns(uint256)",
  "event Deposited(address user,uint256 amount)",
  "event Withdrawn(address user,uint256 amount)"
];

let provider;
let signer;
let contract;

// WebSocket provider for real-time events
const wsProvider = new ethers.WebSocketProvider(
  "https://sepolia.infura.io/v3/002d22dbf4cf4a1fbd1f01f7dbc6c686"
);
const contractWS = new ethers.Contract(contractAddress, abi, wsProvider);

// ================== NETWORK CHECK ==================
async function testProvider() {
  if (!window.ethereum) {
    alert("MetaMask not found. Please install it.");
    throw new Error("MetaMask not found");
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  console.log("Connected network:", network);

  if (network.name !== "sepolia") {
    alert("Please switch MetaMask to Sepolia network!");
    throw new Error("Wrong network");
  }
}

// ================== CONNECT WALLET ==================
async function connectWallet() {
  await testProvider();

  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);

  updateBalance();
  listenEvents();
  showPastEvents();
}

// ================== DEPOSIT ==================
async function deposit() {
  if (!contract) {
    alert("Connect wallet first!");
    return;
  }

  const amount = document.getElementById("amount").value;
  if (!amount || isNaN(amount)) {
    alert("Enter a valid amount!");
    return;
  }

  try {
    const tx = await contract.deposit({ value: ethers.parseEther(amount) });
    await tx.wait();
    updateBalance();
  } catch (err) {
    console.error("Deposit failed:", err);
  }
}

// ================== WITHDRAW ==================
async function withdraw() {
  if (!contract) {
    alert("Connect wallet first!");
    return;
  }

  const amount = document.getElementById("withdrawAmount").value;
  if (!amount || isNaN(amount)) {
    alert("Enter a valid amount!");
    return;
  }

  try {
    const tx = await contract.withdraw(ethers.parseEther(amount));
    await tx.wait();
    updateBalance();
  } catch (err) {
    console.error("Withdraw failed:", err);
  }
}

// ================== UPDATE BALANCE ==================
async function updateBalance() {
  if (!signer || !contract) return;

  const address = await signer.getAddress();
  const balance = await contract.getBalance(address);

  document.getElementById("balance").innerHTML =
    "Balance: " + ethers.formatEther(balance) + " ETH";
}

// ================== LIVE EVENTS ==================
function listenEvents() {
  contract.on("Deposited", (user, amount) => {
    const div = document.getElementById("events");
    const el = document.createElement("p");
    el.innerText = `${user} deposited ${ethers.formatEther(amount)} ETH`;
    div.appendChild(el);
  });

  contract.on("Withdrawn", (user, amount) => {
    const div = document.getElementById("events");
    const el = document.createElement("p");
    el.innerText = `${user} withdrew ${ethers.formatEther(amount)} ETH`;
    div.appendChild(el);
  });
}

// WebSocket event logging
contractWS.on("Deposited", (user, amount) => {
  console.log("Deposit event via WS:", user, ethers.formatEther(amount));
});

contractWS.on("Withdrawn", (user, amount) => {
  console.log("Withdraw event via WS:", user, ethers.formatEther(amount));
});

// ================== PAST EVENTS ==================
async function showPastEvents() {
  if (!contract) return;
  const eventsDiv = document.getElementById("events");

  try {
    const depositedEvents = await contract.queryFilter("Deposited");
    depositedEvents.forEach((ev) => {
      const el = document.createElement("p");
      el.innerText = `${ev.args.user} deposited ${ethers.formatEther(
        ev.args.amount
      )} ETH`;
      eventsDiv.appendChild(el);
    });

    const withdrawnEvents = await contract.queryFilter("Withdrawn");
    withdrawnEvents.forEach((ev) => {
      const el = document.createElement("p");
      el.innerText = `${ev.args.user} withdrew ${ethers.formatEther(
        ev.args.amount
      )} ETH`;
      eventsDiv.appendChild(el);
    });
  } catch (err) {
    console.error("Failed to fetch past events:", err);
  }
}