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
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"697e19a8a9faa90b3269d62c","seedIDs":"67dc227a59b878f195998dc4", "growthTime": 1786000},
// 'corn'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"697e199751f2ac78b396fd36","seedIDs":"68824771915623f3dcc1fb0f", "growthTime": 18414000},
// 'broacli'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"697e1973a9faa90b3269c307","seedIDs":"67dc227a59b878f195998e84", "growthTime": 447000},
// 'pears'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"692c56ded5279610094c3213","seedIDs":"673e0c942c7bfd708b352405", "growthTime": 335000},
// 'pineapple'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"697e1985a9faa90b3269c9ca","seedIDs":"67dc227a59b878f195998d82", "growthTime": 19090000},
// 'mint'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a5fa3d62a9be10b7f52c97d","seedIDs":"673e0c942c7bfd708b35248f", "growthTime": 6720000},
// 'chicken'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a15cc2f6a9aeeb3da578ed7","seedIDs":"67dc227a59b878f195998e36", "growthTime": 14640000},
// 'snowdrops'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a2530b812dd3ee5f718abb2","seedIDs":"67dc227a59b878f195998e54", "growthTime": 4680000},
// 'leek'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a491cb806aeb8cfd2ae9084","seedIDs":"67dc227a59b878f195998e6c", "growthTime": 28140000},
// 'cauliflower'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a6a2f3865101b3a4db39498","seedIDs":"67dc227a59b878f195998d7c", "growthTime": 19680000},
// 'eggplant'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a6a31fa9c63585cafddbc39","seedIDs":"67dc227a59b878f195998ddc", "growthTime": 900000},
// 'onion'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a36abbe6b22a0e2eec502bd","seedIDs":"673e0c942c7bfd708b352435", "growthTime": 1020000},
// 'stawberry'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"69d9208541889f0f3ae3020e","seedIDs":"69c548076efcfb7e277d602c", "growthTime": 10800000},
// 'DEER'
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"69d92697048897c817194bfa","seedIDs":"69c548076efcfb7e277d6014","growthTime": 14400000},
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"697e19d851f2ac78b3971473","seedIDs":"665f2698534176fcd32f9a86","growthTime": 1800000},
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a1dabde12dd3ee5f734dc89","seedIDs":"665f2698534176fcd32f9ab3" ,"growthTime": 6600000},
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"6a1dabde12dd3ee5f734dc85","seedIDs":"67dc227a59b878f195998d58" ,"growthTime": 13800000},
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"69f223ff71df3f192c6f28db","seedIDs":"694412e2506616961d8cc890","growthTime": 18000000},
{"userGardensIDs":"68c2eb6a7e204da0fe55f668","userBedsIDs":"69500713cc638d10d00cc06b","seedIDs":"694412e2506616961d8cc890","growthTime": 18000000},
  
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




















