package chaincode

import (
	"time"
)

type EntryId uint32

// 一个需要用户身份的下游客户端
type DownstreamClient struct {
	Id                    EntryId `json:"id"`                        // 唯一识别id
	Name                  string  `json:"name"`                      // 用户友好名称，如“XX科技”
	PublicKey             []byte  `json:"public_key"`                // 公钥
	NotifyUrlOnUserUpdate string  `json:"notify_url_on_user_update"` // 用户信息更新回调地址
}

// 一个用户，可能在绑定一些客户端后修改手机号
type User struct {
	Id    EntryId `json:"id"`    // 唯一识别id
	Phone string  `json:"phone"` // 手机号，同时为登录方式、验证方式
}

// 用户与下游客户端的绑定关系 如果用户修改信息，需要通知对应的下游客户端
// 同时已绑定的客户端可以随时查询用户信息
type UserBinding struct {
	UserId    EntryId   `json:"user_id"`   // 用户id
	ClientId  EntryId   `json:"client_id"` // 下游客户端id
	CreatedOn time.Time `json:"created_on"`
}

// 用户一次性密码(One Time Password)记录
// 生成后返回给用户，用户提交给下游客户端；
// 客户端提交OTP即可建立绑定关系并查询用户信息
// 一个用户只能有一个有效的OTP，生成新的OTP会使旧的失效；
// OTP有过期时间，过期后不可用
type UserOTP struct {
	UserId    EntryId   `json:"user_id"`    // 用户id
	OTP       string    `json:"otp"`        // 一次性密码
	ExpiredOn time.Time `json:"expired_on"` // 过期时间
}
