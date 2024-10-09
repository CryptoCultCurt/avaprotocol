# JavaScript SDK for Avs

## Overview

The JavaScript SDK for Avs is a library designed to simplify the integration of Avs services into your JavaScript applications. It provides a set of tools and functions to interact with Avs APIs, making it easier to build applications that leverage Avs capabilities.

## Installation

To install the SDK, you can use npm, which is the recommended way to manage JavaScript packages.

```bash
npm install *** COMING SOON ***
```

## Usage

To use the SDK in your project, you need to initialize it with a private key.  This can be stored in an .env file or set in your environment variables.

```javascript
const sdk = require('avs-sdk');
require('dotenv').config()
// for testing purposes, get a token without signing
const privateKey = process.env.PRIVATE_KEY
const token = await sdk.generateApiToken(privateKey);
const { owner, token } = results.data;

// Now you can use the token to interact with the Avs API

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

For more details on how to use the SDK, please refer to the [official documentation](https://docs.avs.com).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.md) file for more details.