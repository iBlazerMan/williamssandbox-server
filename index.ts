import Fastify, { FastifyInstance } from "fastify"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import { CronJob } from "cron"

import ClientManager from "./lib/clientManager"
import registerRoute from "./registerRoute"


const server = Fastify().withTypeProvider<TypeBoxTypeProvider>(); 
(async () => {
    registerRoute(server)
    ClientManager.getClientManager()
})()

const appId = "4088bfa933724882939cb8271515ad52"

server.get("/ping", async (req, res) => {
    res.send("pong\n") 
})

server.get("/currencyExchangeRate", async(req, res) => {
    let exchangeRatesResponse
    try {
        exchangeRatesResponse = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`)
    } catch (err) {
        console.error("Error fetching exchange rates: " + err)
        throw err
    }
    
    let exchangeRatesResponseJson
    try {
        exchangeRatesResponseJson = await exchangeRatesResponse.json()
    } catch(err) {
        console.error("Error parsing response to JSON: " + err)
        throw err
    }

    let exchangeRates
    if (exchangeRatesResponseJson.rates) {
        exchangeRates = exchangeRatesResponseJson.rates
    } else {
        throw new ReferenceError("the returned JSON object does not have property 'rates'")
    }

    console.warn(`CAD: ${exchangeRates.CAD}, CNY: ${exchangeRates.CNY}, conversion: ${exchangeRates.CNY / exchangeRates.CAD}`)
    res.send(exchangeRates)
})

// const checkAPI = async 

const hourlyCheck = new CronJob("0 * * * * *", () => {
    console.log(Date)
})

hourlyCheck.start()

server.listen({port: 8080}, (err, address) => {
    if (err) {
        console.error("Error:" + err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
