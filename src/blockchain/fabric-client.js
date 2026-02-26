// In-memory representation of the ledger
let ledger = {};

const initLedger = () => {
  ledger = {
    'LAND0': { ID: 'LAND0', Owner: 'Ahmed', Area: 10.5, Details: 'Khartoum, Bahri' },
    'LAND1': { ID: 'LAND1', Owner: 'Fatima', Area: 20.0, Details: 'Omdurman, Block 10' },
  };
};

initLedger();

class MockContract {
  constructor() {}

  async evaluateTransaction(transactionName, ...args) {
    if (transactionName === 'QueryLandRecord') {
      const landRecord = ledger[args[0]];
      if (!landRecord) {
        throw new Error(`Land record ${args[0]} does not exist`);
      }
      return Buffer.from(JSON.stringify(landRecord));
    }
    throw new Error(`Transaction ${transactionName} not found`);
  }

  async submitTransaction(transactionName, ...args) {
    if (transactionName === 'CreateLandRecord') {
      const [id, owner, area, details] = args;
      ledger[id] = { ID: id, Owner: owner, Area: parseFloat(area), Details: details };
      return;
    }
    if (transactionName === 'TransferLandRecord') {
      const [id, newOwner] = args;
      if (!ledger[id]) {
        throw new Error(`Land record ${id} does not exist`);
      }
      ledger[id].Owner = newOwner;
      return;
    }
    throw new Error(`Transaction ${transactionName} not found`);
  }
}

class MockNetwork {
  constructor() {}

  getContract(contractName) {
    return new MockContract();
  }
}

class MockGateway {
  constructor() {}

  async connect(ccp, options) {
    // No-op
  }

  async getNetwork(channelName) {
    return new MockNetwork();
  }

  disconnect() {
    // No-op
  }
}

export const connect = async () => {
  // This is a mock connection. In a real application, this would connect to a real Hyperledger Fabric network.
  return new MockGateway();
};
