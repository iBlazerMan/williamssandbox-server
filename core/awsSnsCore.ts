import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"
import ClientManager from "../lib/clientManager"


export async function sendPhoneMessage(message: string, destNumber:string) {
    const snsClient: SNSClient = (await ClientManager.getClientManager()).getSnsClient()
    const messageCommand = new PublishCommand({
        PhoneNumber: destNumber,
        Message: message
    })
    const response = await snsClient.send(messageCommand)
    return response
}

