const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const token = process.env.token;

const requestToken = process.env.requestToken; // new CSRF / request token
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const api = axios.create({
  baseURL: "https://chainers.io/api/farm",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "Origin": "https://static.chainers.io",
    "Referer": "https://static.chainers.io/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    "x-request-token-id": requestToken,
  },
});
// 🌱 Seed array with growth times


const plantSeed = [
  {"userGardensIDs": "68c2eb6a7e204da0fe55f668","userBedsIDs": "68c7b8915c457c186fd40041","seedIDs": "665f2698534176fcd32f9a7d","growthTime": 1800000},
  {"userGardensIDs": "68c2eb6a7e204da0fe55f668","userBedsIDs": "68dd8aa03bdf0c6e7893f8ed","seedIDs": "665f2698534176fcd32f9a7d","growthTime": 1800000},  
  {"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"692c56ded5279610094c3213","seedID":"68824771915623f3dcc1fb09", "growthTime":21600000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"692c575064e8f74db4ad0094","seedID":"673e0c942c7bfd708b352489", "growthTime":6720000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"692c571fd5279610094c548f","seedID":"67dc227a59b878f195998db8", "growthTime":1920000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"692c56f964e8f74db4acd14f","seedID":"67dc227a59b878f195998d7c", "growthTime":18303000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"690b47dd284c0906f5ae679d","seedID":"67dc227a59b878f195998dd6", "growthTime": 900000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"695a826c64968779250095a2","seedID":"673e0c942c7bfd708b35244d", "growthTime": 120000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"694b90631541358fb2678528","seedID":"67dc227a59b878f195998ea2", "growthTime": 9360000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"692ea0a0337dbc729f96b95b","seedID":"67dc227a59b878f195998e60", "growthTime": 28140000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"695a83e164968779250129e3","seedID":"673e0c942c7bfd708b352405", "growthTime": 720000},
{"userGardensID":"68c2eb6a7e204da0fe55f668","userBedsID":"695a17456496877925db9108","seedID":"673e0c942c7bfd708b352465", "growthTime": 240000},
];



// 📊 Dashboard tracker
const bedStatus = new Map();
function showDashboard() {
  console.clear();
  console.log("🌾 CHAINERS FARM DASHBOARD 🌾");
  console.log("BED ID\t\t\tSEED ID\t\tREMAINING\tSTATUS");
  console.log("---------------------------------------------------------------");

  for (const [bedId, info] of bedStatus.entries()) {
    const remaining = info.remaining > 0 ? `${Math.floor(info.remaining / 1000)}s` : "0s";
    console.log(`${bedId}\t${info.seedId}\t${remaining}\t${info.status}`);
  }

  console.log("---------------------------------------------------------------");
  console.log("🕒 Updated:", new Date().toLocaleTimeString());
}

// 🚜 Harvest crop
async function harvestCrop(userFarmingID) {
  try {
    await api.post("/control/collect-harvest", {
        "userFarmingID": userFarmingID
    },);
    console.log(`✅ Harvested crop ${userFarmingID}`);
    return true;
  } catch (err) {
    console.error(`❌ Harvest failed for ${userFarmingID}:`, err.message);
    return false;
  }
}

// 🌱 Plant seed
async function plantSeedFunc(gardenId, bedId, seedId) {
  try {
    const res = await api.post("/control/plant-seed", {
      userGardensID: gardenId,
      userBedsID: bedId,
      seedID: seedId,
    });
    const userFarmingID = res.data?.data?.userFarmingID;
    console.log(`🌱 Planted seed ${seedId} on bed ${bedId} (farmID: ${userFarmingID})`);
    return userFarmingID;
  } catch (err) {
    console.error(`❌ Plant failed on bed ${bedId}: ${err.message}`);
    return null;
  }
}

// 🧩 Fetch all gardens
async function getGardens() {
  try {
    const res = await api.get("/user/gardens");
    return res.data.data || [];
  } catch (err) {
    console.error("❌ Error fetching gardens:", err.message);
    return [];
  }
}

// 🔁 Bed cycle: harvest if ready, else plant if empty
async function bedCycle(seedInfo) {
  const { userGardensIDs, userBedsIDs, seedIDs, growthTime } = seedInfo;
  let plantedAt = null;
  let userFarmingID = null;

  while (true) {
    // Check garden for existing planted seed
    const gardens = await getGardens();
    const garden = gardens.find(g => g.userGardensID === userGardensIDs);
    const bed = garden?.placedBeds?.find(b => b.userBedsID === userBedsIDs);

    if (bed?.plantedSeed) {
      userFarmingID = bed.plantedSeed.userFarmingID;
      plantedAt = new Date(bed.plantedSeed.plantedDate).getTime();
    }

    // If planted, check growth
    const now = Date.now();
    if (userFarmingID && plantedAt) {
      const elapsed = now - plantedAt;
      const remaining = growthTime - elapsed;

      bedStatus.set(userBedsIDs, {
        seedId: seedIDs,
        remaining: remaining > 0 ? remaining : 0,
        status: remaining > 0 ? "🌱 Growing" : "🌾 Ready to harvest",
      });

      if (remaining <= 0) {
        const harvested = await harvestCrop(userFarmingID);
        if (harvested) {
          await wait(20000); // 10s before replant
          userFarmingID = await plantSeedFunc(userGardensIDs, userBedsIDs, seedIDs);
          plantedAt = Date.now();
          bedStatus.set(userBedsIDs, {
            seedId: seedIDs,
            remaining: growthTime,
            status: "🌱 Replanted",
          });
        }
      }
    } else {
      // If not planted, plant
      await wait(20000); 
      userFarmingID = await plantSeedFunc(userGardensIDs, userBedsIDs, seedIDs);
      if (userFarmingID) plantedAt = Date.now();
      bedStatus.set(userBedsIDs, {
        seedId: seedIDs,
        remaining: growthTime,
        status: userFarmingID ? "🌱 Planted" : "⚠️ Plant failed",
      });
    }

    await wait(20000); // check every 5s
  }
}

// 🚀 Start farm
async function startFarm() {
  console.log("🌾 Starting Chainers farm automation...");

  // Start dashboard
  setInterval(showDashboard, 25000);

  // Start parallel bed cycles
  for (const seedInfo of plantSeed) {
    bedCycle(seedInfo);
    await wait(20000); // stagger bed starts to reduce rate-limit
  }
}

startFarm().catch(err => console.error("💥 Fatal error:", err.message));






