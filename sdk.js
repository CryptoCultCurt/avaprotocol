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
    return new Promise((resolve) => {
        client[method].bind(client)(request, metadata, (error, response) => {
            if (error) {
                resolve({ error: `gRPC Error: ${error.message}` })
            } else {
                resolve({ data: response })
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
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
}

async function listTasks(token) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'ListTasks', {}, metadata);
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data.tasks }
}

async function deleteTask(token, taskId) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'DeleteTask', { bytes: taskId }, metadata)
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
}

async function getKey({ owner, token, expired_at, signature }) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token) // Assuming PRIVATE_KEY is used as authkey
    const request = { owner, expired_at, signature }
    const result = await asyncRPC(client, 'GetKey', request, metadata)
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
}

async function getWallet(owner, token) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'GetSmartAccountAddress', { owner: owner }, metadata)
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
}

async function getTask(token, taskId) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'GetTask', { bytes: taskId }, metadata)
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
}

async function cancelTask(token, taskId) {
    const metadata = new grpc.Metadata()
    metadata.add('authkey', token)
    const result = await asyncRPC(client, 'CancelTask', { bytes: taskId }, metadata)
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: result.data }
}

async function generateApiToken(privateKey) {
    const wallet = new Wallet(privateKey)
    const owner = wallet.address
    const expired_at = Math.floor(+new Date() / 3600 * 24)
    const message = `key request for ${wallet.address} expired at ${expired_at}`
    const signature = await signMessageWithEthers(wallet, message)
    const result = await asyncRPC(client, 'GetKey', {
        owner,
        expired_at,
        signature
    }, {})
    if (result.error) {
        return { success: false, error: result.error }
    }
    return { success: true, data: { owner, token: result.data.key } }
}

module.exports = {
    generateApiToken,
    createTask,
    deleteTask,
    getKey,
    listTasks,
    cancelTask,
    getTask,
    getWallet,
    TriggerType,
    TaskType,
    config
}