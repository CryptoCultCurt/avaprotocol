# JavaScript SDK for Ava Protocol

## Overview

The JavaScript SDK for the Ava Protocol is a library designed to simplify the integration of the Ava Protocol into your JavaScript applications. It provides a set of tools and functions to interact with the Ava Protocol APIs, making it easier to build applications that leverage Ava Protocol capabilities.

## Installation

To install the SDK, you can use npm, which is the recommended way to manage JavaScript packages.

```bash
npm install ava-javascript-sdk
```

## Usage

To use the SDK in your project, you need to initialize it with a private key.  This can be stored in an .env file or set in your environment variables.

```javascript
const sdk = require('ava-javascript-sdk');
require('dotenv').config()
// for testing purposes, get a token without signing
const privateKey = process.env.PRIVATE_KEY
const token = await sdk.generateApiToken(privateKey);
const { owner, token } = results.data;

// Now you can use the token to interact with the Ava Protocol API

const tasks = await sdk.listTasks(token);
console.log(tasks);
```

## Examples

The examples/demo.js file shows how to use the SDK to list, create and delete tasks.  You can run the example with the following command:

```bash
node examples/demo.js
```
**Note:  The examples assume that there is an .env file with a PRIVATE_KEY set to the private key of the wallet you want to use.**

## Documentation

For more details on how to use the SDK, please refer to the [official documentation](https://avaprotocol.org/docs/ethereum/getting-started/introduction).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.md) file for more details.