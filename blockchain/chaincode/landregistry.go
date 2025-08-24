package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a car
type SmartContract struct {
	contractapi.Contract
}

// LandRecord describes basic details of what makes up a land record
type LandRecord struct {
	ID      string `json:"ID"`
	Owner   string `json:"owner"`
	Area    float64 `json:"area"`
	Details string `json:"details"`
}

// InitLedger adds a base set of land records to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	landRecords := []LandRecord{
		{ID: "LAND0", Owner: "Ahmed", Area: 10.5, Details: "Khartoum, Bahri"},
		{ID: "LAND1", Owner: "Fatima", Area: 20.0, Details: "Omdurman, Block 10"},
	}

	for _, landRecord := range landRecords {
		landRecordJSON, err := json.Marshal(landRecord)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(landRecord.ID, landRecordJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}

	return nil
}

// CreateLandRecord issues a new land record to the world state with given details.
func (s *SmartContract) CreateLandRecord(ctx contractapi.TransactionContextInterface, id string, owner string, area float64, details string) error {
	landRecord := LandRecord{
		ID:      id,
		Owner:   owner,
		Area:    area,
		Details: details,
	}
	landRecordJSON, err := json.Marshal(landRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, landRecordJSON)
}

// QueryLandRecord returns the land record stored in the world state with given id.
func (s *SmartContract) QueryLandRecord(ctx contractapi.TransactionContextInterface, id string) (*LandRecord, error) {
	landRecordJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if landRecordJSON == nil {
		return nil, fmt.Errorf("the land record %s does not exist", id)
	}

	var landRecord LandRecord
	err = json.Unmarshal(landRecordJSON, &landRecord)
	if err != nil {
		return nil, err
	}

	return &landRecord, nil
}

// TransferLandRecord updates the owner of a land record on the world state.
func (s *SmartContract) TransferLandRecord(ctx contractapi.TransactionContextInterface, id string, newOwner string) error {
	landRecord, err := s.QueryLandRecord(ctx, id)
	if err != nil {
		return err
	}

	landRecord.Owner = newOwner
	landRecordJSON, err := json.Marshal(landRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, landRecordJSON)
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating land registry chaincode: %v", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting land registry chaincode: %v", err)
	}
}
