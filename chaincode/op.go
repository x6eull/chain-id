package chaincode

import (
	"encoding/binary"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/shim"
)

type PhoneIndexedUser struct {
	UserId EntryId `json:"user_id"`
}

var Endian = binary.BigEndian

const UserIdKey = "max_user_id"

func GetMaxUserId(stub shim.ChaincodeStubInterface) (EntryId, error) {
	max_id_bytes, err := stub.GetState(UserIdKey)
	if err != nil {
		return 0, err
	}
	if max_id_bytes == nil {
		return 0, nil
	}
	return EntryId(Endian.Uint32(max_id_bytes)), nil
}

func SetMaxUserId(stub shim.ChaincodeStubInterface, max_id EntryId) error {
	max_id_bytes := make([]byte, 4)
	Endian.PutUint32(max_id_bytes, uint32(max_id))
	return stub.PutState(UserIdKey, max_id_bytes)
}

func GetOrCreateUser(stub shim.ChaincodeStubInterface, phone string) (*User, error) {
	existed_indexed, err := stub.GetState("uphone:" + phone)
	if err != nil {
		return nil, err
	}
	if existed_indexed != nil {
		var p_indexed PhoneIndexedUser
		err = json.Unmarshal(existed_indexed, &p_indexed)
		if err != nil {
			return nil, err
		}
		return &User{Id: p_indexed.UserId, Phone: phone}, nil
	}
	cur_max_id, err := GetMaxUserId(stub)
	if err != nil {
		return nil, err
	}
	new_id := cur_max_id + 1
	err = SetMaxUserId(stub, new_id)
	if err != nil {
		return nil, err
	}
	new_user := &User{
		Id:    new_id,
		Phone: phone,
	}
	user_bytes, err := json.Marshal(new_user)
	if err != nil {
		return nil, err
	}
	err = stub.PutState("uuser:"+fmt.Sprint(new_id), user_bytes)
	if err != nil {
		return nil, err
	}
	new_indexed := &PhoneIndexedUser{
		UserId: new_id,
	}
	indexed_bytes, err := json.Marshal(new_indexed)
	if err != nil {
		return nil, err
	}
	err = stub.PutState("uphone:"+phone, indexed_bytes)
	if err != nil {
		return nil, err
	}
	return new_user, nil
}
