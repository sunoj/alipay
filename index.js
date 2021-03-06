/**
 * @author synder on 2016/12/21
 * @copyright
 * @desc
 */

const url = require('url');
const crypto = require('crypto');
const request = require('request');

const trade = require('./module/trade');
const oauth = require('./module/oauth');

const AliPayRequest = require('./lib/request');

class AliPayClient {

    gateway () {
        if(this.develop === true){
            return {
                protocol: 'https',
                host: 'openapi.alipaydev.com',
                port: 443,
                pathname: 'gateway.do',
            }
        }else{
            return {
                protocol: 'https',
                host: 'openapi.alipay.com',
                port: 443,
                pathname: 'gateway.do',
            }
        }
    };
        
    constructor(options, develop = false){
        this.develop = develop;
        this.appId = options.appId;
        this.appPrivateKey = options.appPrivateKey;
        this.appAESKey = options.appAESKey;
        this.appPublicKey = options.appPublicKey;
        this.aliPayPublicKey = options.aliPayPublicKey;

        
        if(!this.appId){
            throw new Error('appId should not be null');
        }
        
        if(!this.appPrivateKey){
            throw new Error('appPrivateKey should not be null');
        }
        
        if(!this.appPublicKey){
            throw new Error('appPublicKey should not be null');
        }

        if(!this.aliPayPublicKey){
            throw new Error('aliPayPublicKey should not be null');
        }
    }
    
    //返回重定向请求URL
    redirect(aliPayRequest){
        if(!(aliPayRequest instanceof AliPayRequest)){
            throw new Error('request should be a instance of AliPayRequest')
        }
        
        aliPayRequest._setGateway(this.gateway());
        aliPayRequest._setAppId(this.appId);
        aliPayRequest._setAppPrivateKey(this.appPrivateKey);
        aliPayRequest._setAppPublicKey(this.appPublicKey);
        aliPayRequest._setAppAesKey(this.appAESKey);
        aliPayRequest._setAliPublicKey(this.aliPayPublicKey);
        
        return aliPayRequest._getRequestUrl()
    }

    //回调验签
    verifyNotify(query){
        return AliPayRequest.rsaVerifyNotify(this.aliPayPublicKey, query)
    }
    
    //发送请求
    request(aliPayRequest, callback){
        
        if(!(aliPayRequest instanceof AliPayRequest)){
            throw new Error('request should be a instance of AliPayRequest')
        }
        
        aliPayRequest._setGateway(this.gateway());
        aliPayRequest._setAppId(this.appId);
        aliPayRequest._setAppPrivateKey(this.appPrivateKey);
        aliPayRequest._setAppPublicKey(this.appPublicKey);
        aliPayRequest._setAppAesKey(this.appAESKey);
        aliPayRequest._setAliPublicKey(this.aliPayPublicKey);
        
        const options = {
            method: aliPayRequest._getRequestMethod(),
            url: aliPayRequest._getRequestUrl(),
            json: true
        };
        
        if(arguments.length === 1){
            return new Promise(function (resolve, reject) {
                
                request(options, function (err, response, body) {
                    if(err){
                        return reject(err);
                    }
                    
                    let results = aliPayRequest._checkResponse(body);

                    callback(results.error, results.response);
                });
            });
        }
        
        if(typeof callback === 'function'){
            return request(options, function (err, response, body) {
                if(err){
                    return callback(err);
                }

                let results = aliPayRequest._checkResponse(body);
                
                callback(results.error, results.response);
            });
        }
        
        return request(options);
    }
}

exports.AliPayClient = AliPayClient;

exports.auth = {
    WebLoginRequest : oauth.WebLoginRequest,
    AccessTokenRequest : oauth.AccessTokenRequest,
    OpenAuthTokenAppRequest : oauth.OpenAuthTokenAppRequest,
    UserInfoRequest : oauth.UserInfoRequest,
};

exports.trade = {
    CreatePay : trade.CreatePay,
    CreatePayQRcode : trade.CreatePayQRcode,
    WapPayRequest : trade.WapPayRequest,
    AppPayRequest : trade.AppPayRequest,
    PayQueryRequest : trade.PayQueryRequest,
    PayCloseRequest : trade.PayCloseRequest,
    PayRefundRequest : trade.PayRefundRequest,
    PayCancelRequest : trade.PayCancelRequest,
    RefundQueryRequest : trade.RefundQueryRequest,
};