import { FastifyRequest, FastifyReply } from "fastify"
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"

import ClientManager from "../lib/clientManager"
import { SendMessageToPhoneNumberRequest } from "../serverTypeDefine"

export default {
    async sendMessageToPhoneNumber(request: FastifyRequest<{ Body: SendMessageToPhoneNumberRequest}>, reply: FastifyReply) {
        const {message, destNumber} = request.body
        const snsClient = (await ClientManager.getClientManager()).getSnsClient()

        const messageCommand = new PublishCommand({
            PhoneNumber: destNumber,
            Message: message
        })

        try {
            const response = await snsClient.send(messageCommand)
            console.log(response)
            reply.send(response)
        } catch(err) {
            console.error(`Failed to send message to phone number ${destNumber}: ` + err)
            reply.code(500).send(`Failed to send message to phone number ${destNumber}: ` + err)
        }
    }
}