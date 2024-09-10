import { FastifyRequest, FastifyReply } from "fastify"
import { GetExchangeRateRequest, GetExchangeRateResponse, VerifySignInRequest } from "../serverTypeDefine"

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
                    WHERE contact_info = ? AND contact_type = ?
                `,
                [contactInfo, contactType]
            ) as RowDataPacket[][]

            if (queryResult[0].length === 0) {
                reply.code(401).send({ status: "failed" })
                return
            }

            const user = queryResult[0][0]
            console.log(queryResult[0])

            if (user.verification_code !== verificationCode) {
                reply.code(401).send({ status: "failed" })
                return
            }

            const currentTime = new Date()
            const verificationCodeExpiration = new Date(user.code_expiration)

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
    }
}