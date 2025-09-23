const axios = require("axios");
require('dotenv').config();
// Example IDs
// const userGardensIDs = ["1", "2"];
// const userBedsIDs = ["3", "4"];
const plantSeed = [{userGardensIDs:"68c2eb6a7e204da0fe55f668", userBedsIDs:"68c66ec9637b77c0d1f5ac2f",seedIDs:"673e0c942c7bfd708b352441"},
    {userGardensIDs:"68c2eb6a7e204da0fe55f668", userBedsIDs:"68c2eb6a7e204da0fe55f664",seedIDs:"673e0c942c7bfd708b352447"},
    {userGardensIDs:"68c2eb6a7e204da0fe55f668", userBedsIDs:"68c2ed1e5c457c186fbcf096",seedIDs:"673e0c942c7bfd708b352441"}];

// let seedIDs = ["seed1", "seed2", "seed3"];
let harvestIDs = [];

// Timers
const waitPlantToHarvest = 120000; // 2 minutes
const waitHarvestToPlant = 9000;  // 10 seconds
const token = process.env.token;
// 🔹 Function to plant seeds
async function plantSeeds() {
    console.log(`🌱 Planting seeds at ${new Date().toLocaleTimeString()}`);
    for (let seedID of plantSeed) {
        const plantId = {
            "userGardensID": seedID.userGardensIDs,
            "userBedsID": seedID.userBedsIDs,
            "seedID": seedID.seedIDs
        };
        console.log(plantId);
        try {
            const res = await axios.post("https://chainers.io/api/farm/control/plant-seed", 
                plantId
            , { headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`} });

            const usefarmID = res.data?.data?.userFarmingID;
            if (usefarmID) {
                harvestIDs.push(usefarmID);
                console.log("🔑 Collected userFarmIDs: ", harvestIDs);
            }

            console.log(`✅ Planted seed ${plantId}`, res.data.data.userFarmingID);
           
        } catch (err) {
            console.error(`❌ Error planting ` + "id: " + seedID.userGardensIDs , err.message);
        }
    }
    await afterInventory();
    await rewardPool();
}

// 🔹 Function to harvest crops
async function harvestCrops() {
    console.log(`🌾 Harvesting crops at ${new Date().toLocaleTimeString()}`);
    for (let harvestID of harvestIDs) {
        try {
            const res = await axios.post("https://chainers.io/api/farm/control/collect-harvest", {
                "userFarmingID": harvestID
            }, { headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}` } });

            console.log(`✅ Harvested crop ${harvestID}`, res.data.data.userFarmingID);
        } catch (err) {
            console.error(`❌ Error harvesting ${harvestID}:`, err.message);
        }
    }
    harvestIDs.length = 0;
    await afterInventory();
    await rewardPool();
}

async function afterInventory() {
    console.log(`🌾 Inventory crops at ${new Date().toLocaleTimeString()}`);
    // for (let harvestID of harvestIDs) {
        try {
            const res = await axios.get("https://chainers.io/api/farm/user/inventory?sort=lastUpdated&itemType=all&sortDirection=-1&skip=0&limit=0"
                , { headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`} });

            console.log(`✅ Inventory crop `, res.data.success);
        } catch (err) {
            console.error(`❌ Error Inventory :`, err.message);
        }
    // }
}

async function rewardPool() {
    console.log(`🌾 Reward Pool crops at ${new Date().toLocaleTimeString()}`);
    // for (let harvestID of harvestIDs) {
        try {
            const res = await axios.get("https://chainers.io/api/farm/reward-pools/user-block-vegetables?rewardsPoolsBlocksID=68cfb1a4f27dafd9eec912ce"
                , { headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`} });

            console.log(`✅ Reward Pool crop `, res.data.success);
        } catch (err) {
            console.error(`❌ Error Reward Pool :`, err.message);
        }
    // }
}


async function gardnersData() {
    console.log(`🌾 Gardners crops at ${new Date().toLocaleTimeString()}`);
    // for (let harvestID of harvestIDs) {
        try {
            const res = await axios.get("https://chainers.io/api/farm/user/gardens"
                , { headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`} });

            console.log(`✅ Gardners crop `, res.data.success);
        } catch (err) {
            console.error(`❌ Error Gardners Crop :`, err.message);
        }
    // }
}

async function activeBlock() {
    console.log(`🌾 Bloack Data crops at ${new Date().toLocaleTimeString()}`);
    // for (let harvestID of harvestIDs) {
        try {
            const res = await axios.get("https://chainers.io/api/farm/user/gardens"
                , { headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`} });

            console.log(`✅ Block  Data crop `, res.data.success);
        } catch (err) {
            console.error(`❌ Error Block  :`, err.message);
        }
    // }
}


// 🔹 Cycle runner
async function startCycle() {
    // 1. Plant seeds
    await plantSeeds();
    
    // 2. Wait 2 minutes before harvesting
    setTimeout(async () => {
        await harvestCrops();

        // 3. Wait 10 seconds before planting again
        setTimeout(() => {
            startCycle(); // 🔁 restart cycle
        }, waitHarvestToPlant);

    }, waitPlantToHarvest);
    gardnersData();
    gardnersData();
}

// Start automation
console.log("▶ Starting farm automation...");
startCycle();
