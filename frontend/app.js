// ===== CONFIG =====
const INFURA_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID";
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

// ===== PROVIDER & CONTRACT =====
provider = new ethers.BrowserProvider(window.ethereum);

// ===== NETWORK CHECK =====
async function testProvider() {
  if (!window.ethereum) {
    alert("MetaMask not found. Please install it!");
    throw new Error("MetaMask not found");
  }
  const network = await provider.getNetwork();
  if (network.name !== "sepolia") {
    alert("Switch MetaMask to Sepolia network!");
    throw new Error("Wrong network");
  }
  console.log("Connected to network:", network.name);
}

// ===== CONNECT WALLET =====
export async function connectWallet() {
  await testProvider();
  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
  await updateBalance();
  await showPastEvents();
}

// ===== DEPOSIT =====
export async function deposit() {
  if (!contract) return alert("Connect wallet first!");
  const amount = document.getElementById("amount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid amount!");
  try {
    const tx = await contract.deposit({ value: ethers.parseEther(amount) });
    await tx.wait();
    await updateBalance();
    await showPastEvents();
  } catch (err) {
    console.error("Deposit failed:", err);
  }
}

// ===== WITHDRAW =====
export async function withdraw() {
  if (!contract) return alert("Connect wallet first!");
  const amount = document.getElementById("withdrawAmount").value;
  if (!amount || isNaN(amount)) return alert("Enter a valid amount!");
  try {
    const tx = await contract.withdraw(ethers.parseEther(amount));
    await tx.wait();
    await updateBalance();
    await showPastEvents();
  } catch (err) {
    console.error("Withdraw failed:", err);
  }
}

// ===== UPDATE BALANCE =====
async function updateBalance() {
  if (!signer || !contract) return;
  const address = await signer.getAddress();
  const balance = await contract.getBalance(address);
  document.getElementById("balance").innerText =
    "Balance: " + ethers.formatEther(balance) + " ETH";
}

// ===== SHOW PAST EVENTS USING INTERFACE =====
// async function showPastEvents() {
//   if (!contract) return;
//   const eventsDiv = document.getElementById("events");
//   eventsDiv.innerHTML = ""; // clear old events

//   try {
//     const iface = new ethers.Interface(abi);

//     const logs = await provider.getLogs({
//       fromBlock: 0,
//       toBlock: "latest",
//       address: contractAddress,
//     });

//     console.log("all logs bbx", logs)

//     logs.forEach((log) => {
//       try {
//         const parsed = iface.parseLog(log);
//         const el = document.createElement("p");
//         el.innerText = `${parsed.args[0]} ${parsed.name.toLowerCase()}ed ${ethers.formatEther(parsed.args[1])} ETH`;
//         eventsDiv.appendChild(el);
//       } catch (err) {
//         // ignore logs that don't match ABI
//       }
//     });
//   } catch (err) {
//     console.error("Failed to fetch past events:", err);
//   }
// }

async function showPastEvents() {
  if (!contract) return;
  const eventsDiv = document.getElementById("events");
  eventsDiv.innerHTML = "";

  try {
    const iface = new ethers.Interface(abi);
    const logs = await provider.getLogs({
      fromBlock: 0,
      toBlock: "latest",
      address: contractAddress,
    });

    console.log("bbx logs", logs)

    logs.forEach((log) => {
      try {
        const parsed = iface.parseLog(log);
        const user = parsed.args.user || parsed.args[0]; // may be in args[0] if indexed
        const amount = parsed.args.amount || parsed.args[1];
        const el = document.createElement("p");
        el.innerText = `${user} ${parsed.name.toLowerCase()}ed ${ethers.formatEther(amount)} ETH`;
        eventsDiv.appendChild(el);
      } catch (err) {
        // some logs won't match the ABI (ignore)
      }
    });
  } catch (err) {
    console.error("Failed to fetch past events:", err);
  }
}