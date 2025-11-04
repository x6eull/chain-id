package chaincode

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"errors"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type CC struct {
	contractapi.Contract
}

func main() {
	cc, err := contractapi.NewChaincode(new(CC))
	if err != nil {
		panic(err.Error())
	}
	if err := cc.Start(); err != nil {
		panic(err.Error())
	}
}

func (c *CC) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (c *CC) PutAddrMapping(ctx contractapi.TransactionContextInterface, derBytes []byte) error {
	parsedKey, err := x509.ParsePKIXPublicKey(derBytes)
	if err != nil {
		return err
	}
	_, ok := parsedKey.(*rsa.PublicKey)
	if !ok {
		return errors.New("only RSA public keys are supported")
	}
	h := sha256.Sum256(derBytes)
	hashHex := hex.EncodeToString(h[:])
	return ctx.GetStub().PutState("addr2der:"+hashHex, derBytes)
}

func (c *CC) GetAddrMapping(ctx contractapi.TransactionContextInterface, addr string) ([]byte, error) {
	derBytes, err := ctx.GetStub().GetState("addr2der:" + addr)
	if err != nil {
		return nil, err
	}
	return derBytes, nil
}

func (c *CC) CheckSign(ctx contractapi.TransactionContextInterface, addr string, rawDataToHashAndSign []byte, sign []byte) error {
	derBytes, err := c.GetAddrMapping(ctx, addr)
	if err != nil {
		return err
	}
	pubKey, err := x509.ParsePKIXPublicKey(derBytes)
	if err != nil {
		return err
	}
	hash := sha256.Sum256(rawDataToHashAndSign)
	return rsa.VerifyPKCS1v15(pubKey.(*rsa.PublicKey), crypto.SHA256, hash[:], sign)
}

// 此方法既可以新增也可以修改现有记录
func (c *CC) PutRecord(ctx contractapi.TransactionContextInterface, addr string, index string, value []byte, sign []byte) error {
	stub := ctx.GetStub()
	if err := c.CheckSign(ctx, addr, append([]byte("PUT:"+index+":"), value...), sign); err != nil {
		return err
	}
	key, err := stub.CreateCompositeKey("record", []string{addr, index})
	if err != nil {
		return err
	}
	return stub.PutState(key, value)
}

// 不做任何权限检查，直接获取记录
func (c *CC) GetRecord(ctx contractapi.TransactionContextInterface, addr string, index string) ([]byte, error) {
	stub := ctx.GetStub()
	key, err := stub.CreateCompositeKey("record", []string{addr, index})
	if err != nil {
		return nil, err
	}
	return stub.GetState(key)
}

func (c *CC) DelRecord(ctx contractapi.TransactionContextInterface, addr string, index string, sign []byte) error {
	stub := ctx.GetStub()
	if err := c.CheckSign(ctx, addr, []byte("DEL:"+index), sign); err != nil {
		return err
	}
	key, err := stub.CreateCompositeKey("record", []string{addr, index})
	if err != nil {
		return err
	}
	return stub.DelState(key)
}

func (c *CC) ListAddrIndexes(ctx contractapi.TransactionContextInterface, addr string) ([]string, error) {
	stub := ctx.GetStub()
	entries, err := stub.GetStateByPartialCompositeKey("record", []string{addr})
	if err != nil {
		return nil, err
	}
	defer entries.Close()

	var indexes []string
	for entries.HasNext() {
		queryResponse, err := entries.Next()
		if err != nil {
			return nil, err
		}
		_, compositeKeyParts, err := stub.SplitCompositeKey(queryResponse.Key)
		if err != nil {
			return nil, err
		}
		if len(compositeKeyParts) >= 2 {
			indexes = append(indexes, compositeKeyParts[1])
		} else {
			return nil, errors.New("invalid composite key parts")
		}
	}
	return indexes, nil
}
