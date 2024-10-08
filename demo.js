const sdk = require('./sdk');

// for testing purposes, get a token without signing
const privateKey = process.env.PRIVATE_KEY // Make sure to provide your private key with or without the '0x' prefix
const env = process.env.env || "staging"

async function listTasks(token) {
    const tasks = await sdk.listTasks(token);
    if (tasks.success) {
        console.log(`listTasks: `)
        tasks.data.forEach(task => {
            console.log(`   task id    : ${task.id}`);
            console.log(`   task status: ${task.status}\n`);
        });
    } else {
        console.log(`Error listing tasks: ${tasks.error}`);
    }
}

async function getWallet(owner, token) {
    const wallet = await sdk.getWallet(owner, token);
    if (wallet.success) {   
        console.log(`wallet from getWallet: `)
        console.log(`   Smart Wallet: ${wallet.data.smart_account_address}`);
        console.log(`   Nonce       : ${wallet.data.nonce}`);
    } else {
        console.log(`Error getting wallet: ${wallet.error}`);
    }
}

async function createTask(owner, token) {
     taskCondition = `
      bigCmp(
        priceChainlink("${sdk.config[env].ORACLE_PRICE_CONTRACT}"),
        toBigInt("10000")
      ) > 0`
    const taskResult= await sdk.createTask({
        token,
        taskType: sdk.TaskType.CONTRACTEXECUTIONTASK,
        action: {
            contract_execution: {
                contract_address: sdk.config[env].TEST_TRANSFER_TOKEN,
            }
        },
        trigger: {
            trigger_type: sdk.TriggerType.EXPRESSIONTRIGGER,
            expression: {
               taskCondition
            },
        },
        start_at: Math.floor(Date.now() / 1000) + 30,
        expired_at: Math.floor(Date.now() / 1000 + 3600 * 24 * 30),
        memo: `Demo Example task!`
    })
    if (taskResult.success) {
        console.log(`Task created: ${taskResult.data.id}`)
        return taskResult.data.id;
    } else {
        console.log(`Error creating task: ${taskResult.error}`);
    }
}

async function getTask(token, taskId) {
    const task = await sdk.getTask(token, taskId);
    if (task.success) {
        console.log(`task ${taskId} from getTask: `)
        console.log(task.data);
    } else {
        console.log(`Error getting task: ${task.error}`);
    }
}

async function cancelTask(token, taskId) {
    const task = await sdk.cancelTask(token, taskId);
    if (task.success) {
        console.log(`task ${taskId} canceled(${task.data.value}) `)
    } else {
        console.log(`Error canceling task: ${task.error}`);
    }
}

async function deleteTask(token, taskId) {
    const task = await sdk.deleteTask(token, taskId);
    if (task.success) {
        console.log(`task ${taskId} deleted(${task.data.value}) `)
    } else {
        console.log(`Error deleting task: ${task.error}`);
    }
}

const main = async () => {
    // generate a token without signing.  in production a UI should be used to sign for a token
    const results = await sdk.generateApiToken(privateKey);
    if (results.error) {
        console.log(`Error generating token: ${results.error}`);
        return;
    }
    const { owner, token } = results.data;
   
    console.log(`running demos for wallet: ${owner} in env: ${env}`)

    // list task
    await listTasks(token);
    // get wallet
    await getWallet(owner, token);

    // create task
    const taskId = await createTask(owner, token);
    // get task
    if (taskId) {
        await getTask(token, taskId);
        await cancelTask(token, taskId);
        await getTask(token, taskId);
        await deleteTask(token, taskId);
        await listTasks(token);
    }
}

main();