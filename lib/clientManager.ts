/*  ClientManger: stores all instances of third party clients (AWS SNS, SES, etc).
    Uses the singleton design pattern and there should only be 1 instance available
    at any time. 
 */
import { SNSClient } from "@aws-sdk/client-sns"
import { SESClient } from "@aws-sdk/client-ses"
import mysql, { Pool } from "mysql2"
import fs from "fs"

type AwsCredential = {
    accessKeyId: string,
    secretAccessKey: string
}

type SqlCredentials = {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
}

// TODO: move all file read to index(server).ts and pass the credential object to here
const awsCredentialFilePath = "./secrets/aws.json"
const sqlCredetialFilePath = "./secrets/mysql.json"

function readAwsCredentials(awsCredentialFilePath: string): AwsCredential {
    // do not catch error if JSON.parse or fs.readFileSync fails, server cannot start without
    // AWS credentials to create a client and should exit
    const awsCredential: AwsCredential = JSON.parse(fs.readFileSync(awsCredentialFilePath, "utf-8").toString())
    if (!awsCredential.accessKeyId || !awsCredential.secretAccessKey) {
        throw new ReferenceError("AWS credential file is missing information")
    }
    return awsCredential
}

function readSqlCredentials(sqlCredentialFilePath: string): SqlCredentials {
    const sqlCredentials: SqlCredentials = JSON.parse(fs.readFileSync(sqlCredentialFilePath, "utf-8").toString())
    if (!sqlCredentials.host || !sqlCredentials.database || !sqlCredentials.password || !sqlCredentials.user) {
        throw new ReferenceError("SQL credential file is missing information")
    }
    return sqlCredentials
}



export default class ClientManager {
    private static instance: ClientManager
    private snsClient: SNSClient
    private sesClient: SESClient
    private sqlPool: Pool

    private constructor(snsClient: SNSClient, sesClient: SESClient, sqlPool: Pool) {
        this.snsClient = snsClient
        this.sesClient = sesClient
        this.sqlPool = sqlPool
    }

    // getClientManger() is the only way to retrieve the single shared instance of ClientManger
    // object. It initializes all clients if an instance does not already exist and should be
    // called upon server initialization so any error will be thrown immediately and resolved.
    static async getClientManager(): Promise<ClientManager> {
        if (ClientManager.instance) {
            return ClientManager.instance
        }

        // create AWS SNS and SES client
        const awsCredential = readAwsCredentials(awsCredentialFilePath)
        const snsClient: SNSClient = new SNSClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: awsCredential.accessKeyId,
                secretAccessKey: awsCredential.secretAccessKey,
            }
        })
        const sesClient: SESClient = new SESClient({
            region: "us-east-1",
            credentials: {
                accessKeyId: awsCredential.accessKeyId,
                secretAccessKey: awsCredential.secretAccessKey,
            }
        })

        const sqlCredentials = readSqlCredentials(sqlCredetialFilePath)

        // DEBUG
        console.log(sqlCredentials)

        const sqlPool: Pool = mysql.createPool({
            host: sqlCredentials.host,
            user: sqlCredentials.user,
            port: sqlCredentials.port,
            password: sqlCredentials.password,
            database: sqlCredentials.database,
            connectionLimit: 20,
        })

        // test SQL connection immediately upon pool creation and exit if failed
        sqlPool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to MySQL server using the credentials provided: " + err)
                process.exit(1)
            } else {
                connection.release()
            }
        })

        ClientManager.instance = new ClientManager(snsClient, sesClient, sqlPool)
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

    getSqlPool(): Pool {
        return this.sqlPool
    }
}