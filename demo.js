const sdk = require('./sdk');

// for testing purposes, get a token without signing
const privateKey = process.env.PRIVATE_KEY // Make sure to provide your private key with or without the '0x' prefix
const env = process.env.env || "staging"


const main = async () => {
    // generate a token without signing.  in production a UI should be used to sign for a token
    const { owner, token } = await sdk.generateApiToken(privateKey);

    // const tasks = await sdk.listTask(token);
    // console.log(`tasks from listTask: `)
    // console.log(tasks);
    // //const deleteTask = await sdk.deleteTask(0);
    // const wallet = await sdk.getWallet(owner, token);
    // console.log(`wallet from getWallet: `)
    // console.log(wallet);
    // // create task
    // taskCondition = `
    //   bigCmp(
    //     priceChainlink("${sdk.config[env].ORACLE_PRICE_CONTRACT}"),
    //     toBigInt("10000")
    //   ) > 0`
    // const taskResult= await sdk.createTask({
    //     token,
    //     taskType: sdk.TaskType.CONTRACTEXECUTIONTASK,
    //     action: {
    //         contract_execution: {
    //             contract_address: sdk.config[env].TEST_TRANSFER_TOKEN,
    //         }
    //     },
    //     trigger: {
    //         trigger_type: sdk.TriggerType.EXPRESSIONTRIGGER,
    //         expression: {
    //            taskCondition
    //         },
    //     },
    //     start_at: Math.floor(Date.now() / 1000) + 30,
    //     expired_at: Math.floor(Date.now() / 1000 + 3600 * 24 * 30),
    //     memo: `Demo Example task!`
    // })
    // console.log(`taskResult from createTask: `)
    // console.log(taskResult);
    // console.log(`taskId from taskResult: ${taskResult.id}`)
    // const task = await sdk.getTask(token, taskResult.id);
    // console.log(`task from getTask: `)
    // console.log(task);
    // const cancelTask = await sdk.cancelTask(token, taskResult.id);
    // console.log(`cancelTask from cancelTask: `)
    // console.log(cancelTask);
    // const taskAfterCancel = await sdk.getTask(token, taskResult.id);
    // console.log(`taskAfterCancel from getTask: `)
    // console.log(taskAfterCancel);
    // const deleteTask = await sdk.deleteTask(token, taskResult.id);
    // console.log(`deleteTask from deleteTask: `)
    // console.log(deleteTask);
    await sdk.deleteTask(token, 9);
    const tasksAfterDelete = await sdk.listTask(token);
    console.log(`tasksAfterDelete from listTask: `)
    console.log(tasksAfterDelete);
}

main();