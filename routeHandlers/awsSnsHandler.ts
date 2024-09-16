import { FastifyRequest, FastifyReply } from "fastify"
import { SendMessageToPhoneNumberRequest, SendCodeToPhoneAndSaveRequest } from "../serverTypeDefine"
import { sendPhoneMessage } from "../core/awsSnsCore"
import ClientManager from "../lib/clientManager"
import mysql, { Pool } from "mysql2"

export default {
    async sendMessageToPhoneNumber(request: FastifyRequest<{ Body: SendMessageToPhoneNumberRequest}>, reply: FastifyReply) {
        const {message, destNumber} = request.body
        
        try {
            const response = await sendPhoneMessage(message, destNumber)
            console.log(response)
            reply.send(response)
        } catch(err) {
            console.error(`Failed to send message to phone number ${destNumber}: ` + err)
            reply.code(500).send(`Failed to send message to phone number ${destNumber}: ` + err)
        }
    },

    async sendCodeToPhoneAndSave(request: FastifyRequest<{ Body: SendCodeToPhoneAndSaveRequest}>, 
        reply: FastifyReply) {
        const {destNumber} = request.body

        // DEBUG
        console.log("line 26 reached, dest number: " + destNumber)

        // generate 6 digit verification code
        const randomNumberString = Math.floor(100000 + Math.random() * 900000 - 1).toString()
        const otpMessage = "Your verification code is " + randomNumberString + ". This code is valid for 1 hour and can be used multiple times."

        try {
            await sendPhoneMessage(otpMessage, destNumber)
        } catch (err) {
            console.error(`Failed to send message to phone number ${destNumber}: ` + err)
            reply.code(500).send(`Failed to send message to phone number ${destNumber}: ` + err)
            return
        }

        // generate current date and increment by 1 hour, convert to YYYY-MM-DD HH:mm:ss format for MySQL
        const expirationDate = new Date()
        expirationDate.setTime(expirationDate.getTime() + 3600000)
        const expirationDateString: string = expirationDate.toISOString().slice(0, 19).replace("T", " ")
        
        try {
            const sqlPool: Pool = (await ClientManager.getClientManager()).getSqlPool()
            sqlPool.query(
                `
                    INSERT INTO users (contactType, contactInfo, verificationCode, codeExpiration)
                    VALUES (?, ?, ?, ?) AS user
                    ON DUPLICATE KEY UPDATE
                    verificationCode = user.verificationCode,
                    codeExpiration = user.codeExpiration;
                `,
                ["phone", destNumber, randomNumberString, expirationDateString]
            )
        } catch(err) {
            console.error("failed to perform sql insert: " + err)

            // TODO: add proper error message
            reply.code(500).send()
            return
        }
        
    }
}
