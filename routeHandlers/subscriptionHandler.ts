import { FastifyRequest, FastifyReply } from "fastify"
import { GetExchangeRateRequest, GetExchangeRateResponse, VerifySignInRequest, AddSubscriptionRequest, GetSubscriptionRequest, Subscription, DeleteSubscriptionRequest } from "../serverTypeDefine"

import ExchangeRateManager from "../lib/exchangeRateManager"
import { Pool, RowDataPacket } from "mysql2"
import ClientManager from "../lib/clientManager"

export default {
    getExchangeRate(request: FastifyRequest<{ Querystring: GetExchangeRateRequest }>, reply: FastifyReply) {
        const { fromCurrency, toCurrency } = request.query
        const exchangeRateManager: ExchangeRateManager = ExchangeRateManager.getExchangeRateManager()

        try {
            const exchangeRate: number = exchangeRateManager.getCurrentExchangeRate(fromCurrency, toCurrency)
            const response: GetExchangeRateResponse = {rate: exchangeRate, lastUpdated: exchangeRateManager.getLastUpdatedString()}
            return reply.send(response)
        } catch(err) {
            console.error("failed to get exchange rate: " + err)
            return reply.code(500).send("failed to get exchange ")
        }
    },

    async verifySignIn(request: FastifyRequest<{ Body: VerifySignInRequest }>, reply: FastifyReply) {
        const {contactType, contactInfo, verificationCode} = request.body

        try {
            const sqlPool: Pool = (await ClientManager.getClientManager()).getSqlPool()
            const queryResult = await sqlPool.promise().query(
                `
                    SELECT *
                    FROM users
                    WHERE contactInfo = ? AND contactType = ?
                `,
                [contactInfo, contactType]
            ) as RowDataPacket[][]

            if (queryResult[0].length === 0) {
                reply.code(401).send({ status: "failed" })
                return
            }

            const user = queryResult[0][0]

            if (user.verificationCode !== verificationCode) {
                reply.code(401).send({ status: "failed" })
                return
            }

            const currentTime = new Date()
            const verificationCodeExpiration = new Date(user.codeExpiration)

            if (currentTime > verificationCodeExpiration) {
                reply.code(401).send({ status: "expired" })
                return
            } else {
                reply.send({ status: "success"})
                return
            }
        } catch(err) {
            console.error("failed to query sql: " + err)
            reply.code(500).send({ status: "server error" })
            return
        }
    },

    async addSubscription(request: FastifyRequest<{Body: AddSubscriptionRequest}>, reply: FastifyReply) {
        const {contactInfo, contactType, fromCurrency, toCurrency, desiredValue, minimumCooldown} = request.body

        // TODO: add current subscription count check, return failure if max reached

        // use the current time as the currentCooldown value since the subscription is fresh and no cooldown
        // is required before sending the first alert
        const currentTime = new Date()
        const currentTimeString = currentTime.toISOString().slice(0, 19).replace("T", " ")

        try {
            const sqlPool: Pool = (await ClientManager.getClientManager()).getSqlPool()
            sqlPool.query(
                `
                    INSERT INTO subscriptions (contactInfo, contactType, fromCurrency, toCurrency, 
                    desiredValue, minimumCooldown, currentCooldown)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [contactInfo, contactType, fromCurrency, toCurrency, desiredValue, minimumCooldown, currentTimeString]
            )
        } catch(err) {
            console.error("failed to add subscription to MySQL: " + err)

            // TODO: add proper error message
            reply.code(500).send()
            return
        }
    },

    async getSubscription(request: FastifyRequest<{Body: GetSubscriptionRequest}>, reply: FastifyReply) {
        const {contactType, contactInfo} = request.body

        try {
            const sqlPool: Pool = (await ClientManager.getClientManager()).getSqlPool()
            const queryResult = await sqlPool.promise().query(
                `
                    SELECT *
                    FROM subscriptions
                    WHERE contactType = ? AND contactInfo = ?
                `,
                [contactType, contactInfo]
            ) as RowDataPacket[][]

            const subscriptions: Subscription[] = []
            queryResult[0].map((subscription) => {
                subscriptions.push({
                    subscriptionId: subscription.subscriptionId,
                    fromCurrency: subscription.fromCurrency, 
                    toCurrency: subscription.toCurrency, 
                    desiredValue: subscription.desiredValue,
                    minimumCooldown: subscription.minimumCooldown,
                    currentCooldown: subscription.currentCooldown
                })
            }) 
            reply.send(subscriptions)

        } catch(err) {
            console.error("failed to query subscription from MySQL: " + err)

            // TODO: add proper error message
            reply.code(500).send()
            return
        }
    },

    async deleteSubscription(request: FastifyRequest<{ Querystring: DeleteSubscriptionRequest }>, reply: FastifyReply) {
        const { subscriptionId } = request.query
        
        // DEBUG
        console.log ("deleted subscription id: " + subscriptionId)
        
        try {
            const sqlPool: Pool = (await ClientManager.getClientManager()).getSqlPool()
            sqlPool.query(
                `
                    DELETE 
                    FROM subscriptions
                    WHERE subscriptionId = ?
                `,
                [subscriptionId]
            )
        } catch(err) {
            console.error("failed to add subscription to MySQL: " + err)

            // TODO: add proper error message
            reply.code(500).send()
            return
        }
    }
}