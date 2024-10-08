const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
require('dotenv').config()
const { Wallet } = require('ethers')

const { TaskType, TriggerType } = require('./static_codegen/avs_pb')



// Load the protobuf definition
const packageDefinition = protoLoader.loadSync('../protobuf/avs.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const env = process.env.env || "staging"

async function signMessageWithEthers(wallet, message) {
    const signature = await wallet.signMessage(message)
    return signature
}

const config = {
    development: {
        AP_AVS_RPC: 'localhost:2206',
        // ... other config
    },

    staging: {
        AP_AVS_RPC: 'aggregator-holesky.avaprotocol.org:2206',
        // ... other config
    },

    production: {
        AP_AVS_RPC: 'aggregator.avaprotocol.org:2206',
        // ... other config
    },
}

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const apProto = protoDescriptor.aggregator
const client = new apProto.Aggregator(config[env].AP_AVS_RPC, grpc.credentials.createInsecure())

function asyncRPC(client, method, request, metadata) {
    return new Promise((resolve, reject) => {
        client[method].bind(client)(request, metadata, (error, response) => {
            if (error) {
                reject(error)
            } else {
                resolve(response)
            }
        })
    })
}

async function createTask({ token, taskType, action, trigger, start_at, expired_at, memo }) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)

    const request = {
        task_type: taskType,
        action,
        trigger,
        start_at,
        expired_at,
        memo
    }

    const result = await asyncRPC(client, 'CreateTask', request, metadata)
    return result
}

async function listTask(token) {
    //  const { owner, token } = await generateApiToken()
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'ListTasks', {}, metadata);
    return result.tasks;
}


async function deleteTask(token, taskId) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'DeleteTask', { bytes: taskId }, metadata)
    return result;
  }

async function getKey({ owner, token, expired_at, signature }) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey',token) // Assuming PRIVATE_KEY is used as authkey
    const request = { owner, expired_at, signature }
    const result = await asyncRPC(client, 'GetKey', request, metadata)
    return result
}

async function getWallet(owner, token) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'GetSmartAccountAddress', { owner: owner }, metadata)
    return result;
}

async function getTask(token, taskId) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'GetTask', { bytes: taskId }, metadata)
    return result;
  }

  async function cancelTask(token, taskId) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'CancelTask', { bytes: taskId }, metadata)
    return result;
  }

async function generateApiToken(privateKey) {
    // When running from frontend, we will ask user to sign this through their
    // wallet providr
    const wallet = new Wallet(privateKey)
    const owner = wallet.address
    const expired_at = Math.floor(+new Date() / 3600 * 24)
    const message = `key request for ${wallet.address} expired at ${expired_at}`
    const signature = await signMessageWithEthers(wallet, message)
    //console.log(`message: ${message}\nsignature: ${signature}`)

    let result = await asyncRPC(client, 'GetKey', {
        owner,
        expired_at,
        signature
    }, {})

    return { owner, token: result.key }
}

module.exports = {
    generateApiToken,
    createTask,
    deleteTask,
    getKey,
    listTask,
    cancelTask,
    getTask,
    getWallet,
    TriggerType,
    TaskType,
    config
}