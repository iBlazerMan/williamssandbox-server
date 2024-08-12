/*  ClientManger: stores all instances of third party clients (AWS SNS, SES, etc).
    Uses the singleton design pattern and there should only be 1 instance available
    at any time. 
 */
import { SNSClient } from "@aws-sdk/client-sns"
import { SESClient } from "@aws-sdk/client-ses"
import fs from "fs"

type AwsCredential = {
    accessKeyId: string,
    secretAccessKey: string
}

function readAwsCredentials(awsCredentialFilePath: string): AwsCredential {
    // do not catch error if JSON.parse or fs.readFileSync fails, server cannot start without
    // AWS credentials to create a client and should exit
    const awsCredential = JSON.parse(fs.readFileSync(awsCredentialFilePath, "utf-8").toString())
    if (!awsCredential.accessKeyId || !awsCredential.secretAccessKey) {
        throw new ReferenceError(`${awsCredential}: missing accessKeyId and/or secretAccessKey`)
    }
    return {accessKeyId: awsCredential.accessKeyId, secretAccessKey: awsCredential.secretAccessKey}
}

const awsCredentialFilePath = "./secret/aws.json"

export default class ClientManager {
    private static instance: ClientManager
    private snsClient: SNSClient
    private sesClient: SESClient

    private constructor(snsClient: SNSClient, sesClient: SESClient) {
        this.snsClient = snsClient
        this.sesClient = sesClient
    }

    // getClientManger() is the only way to retrieve the single shared instance of ClientManger
    // object. It initializes all clients if an instance does not already exist and should be
    // called upon server initialization so any error will be thrown immediately and resolved.
    static async getClientManager(): Promise<ClientManager> {
        if (ClientManager.instance) {
            return ClientManager.instance
        }

        const awsCredential = readAwsCredentials(awsCredentialFilePath)
        const snsClient = new SNSClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: awsCredential.accessKeyId,
                secretAccessKey: awsCredential.secretAccessKey,
            }
        })
        const sesClient = new SESClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: awsCredential.accessKeyId,
                secretAccessKey: awsCredential.secretAccessKey,
            }
        })
        ClientManager.instance = new ClientManager(snsClient, sesClient)
        return ClientManager.instance
    }

    getSnsClient(): SNSClient {
        if (this.snsClient) {
            return this.snsClient
        }
        const awsCredential = readAwsCredentials(awsCredentialFilePath)
        const snsClient = new SNSClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: awsCredential.accessKeyId,
                secretAccessKey: awsCredential.secretAccessKey,
            }
        })
        this.snsClient = snsClient
        return this.snsClient
    }

    getSesClient(): SESClient {
        if (this.sesClient) {
            return this.sesClient
        } 
        const awsCredential = readAwsCredentials(awsCredentialFilePath)
        const sesClient = new SESClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: awsCredential.accessKeyId,
                secretAccessKey: awsCredential.secretAccessKey,
            }
        })
        this.sesClient = sesClient
        return this.sesClient
    }
}