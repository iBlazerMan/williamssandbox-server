import {CronJob} from "cron"
import { Pool, RowDataPacket } from "mysql2"
import { sendPhoneMessage } from "../core/awsSnsCore"

import ClientManager from "./clientManager"

type ExchangeRate = {[key: string]: number}

export default class ExchangeRateManager {
    private static instance: ExchangeRateManager
    private exchangeRateApiId: string
    private currentExchangeRate: ExchangeRate
    private hourlyExchangeRateJob: CronJob
    private lastUpdated: Date

    private constructor(exchangeRateApiId: string) {
        this.exchangeRateApiId = exchangeRateApiId
        this.currentExchangeRate = {}
        this.lastUpdated = new Date()
        
        this.hourlyExchangeRateJob = new CronJob("0 0 * * * *", async () => {
            try {
                const sqlPool: Pool = (await ClientManager.getClientManager()).getSqlPool()
                // update exchange rates and query all subscription from sql simultaneously 
                const [queryResult] = await Promise.all([
                    sqlPool.promise().query(
                        `
                            SELECT *
                            FROM subscriptions
                        `
                    ) as Promise<RowDataPacket[][]>,

                    this.pullExchangeRates()
                ])

                for (const subscription of queryResult[0]) {
                    
                    // DEBUG
                    console.log(`${subscription.fromCurrency}, ${subscription.toCurrency}, ${subscription.desiredValue}`)

                    const currentExchangeRate: number = this.getCurrentExchangeRate(subscription.fromCurrency, subscription.toCurrency)
                    if (currentExchangeRate <= parseFloat(subscription.desiredValue)) {
                        // if subscription is a one time alert, delete subscription
                        if (subscription.minimumCooldown === "0") {
                            sqlPool.query(
                                `
                                    DELETE
                                    FROM subscriptions
                                    WHERE subscriptionId = ?
                                `, 
                                [subscription.subscriptionId]
                            )
                        } else {
                            // check if the cooldown 
                            const currentTime = new Date()
                            
                            const subscriptionCooldown = new Date(subscription.currentCooldown)
                            if (currentTime < subscriptionCooldown) {
                                // subscription on cooldown, continue
                                continue
                            } else {
                                // increment the current time with respect to minimumCooldown and 
                                // update the cooldown on database
                                const newCooldown = new Date()
                                switch(subscription.minimumCooldown) {
                                    case "1":
                                        newCooldown.setDate(newCooldown.getDate() + 7)
                                        break                                    
                                    case "2":
                                        newCooldown.setDate(newCooldown.getDate() + 14)
                                        break
                                    case "4":
                                        newCooldown.setMonth(newCooldown.getMonth() + 1)
                                        break
                                }
                                const newCooldownString = newCooldown.toISOString().slice(0, 19).replace("T", " ")

                                sqlPool.query(
                                    `
                                        UPDATE subscriptions
                                        SET currentCooldown = ?
                                        WHERE subscriptionId = ?
                                    `,
                                    [newCooldownString, subscription.subscriptionId]
                                )
                            }
                        }

                        const notificationMessage = `Currency Exchange Rate Alert: ${subscription.fromCurrency} to ` +
                        `${subscription.toCurrency} is now at ${Math.ceil(currentExchangeRate * 10000) / 10000}.\n\n` +
                        `To unsubscribe, visit williamssandbox.com/CurrencyExchange`

                        // TODO: this needs to be optimizwed using a queue, just testing functionality first
                        await sendPhoneMessage(notificationMessage, subscription.contactInfo)
                    }
                }
            } catch(err) {
                console.error("Failed to perform hourly cronjob: " + err)
            }
             
        })
        this.hourlyExchangeRateJob.start()
    }

    static getExchangeRateManager(): ExchangeRateManager {
        if (!ExchangeRateManager.instance) {
            throw new Error("Exchange Rate Manager not initialized before use")
        }
        return ExchangeRateManager.instance
    }

    static async initExchangeRateManager(exchangeRateApiId: string): Promise<ExchangeRateManager> {
        ExchangeRateManager.instance = new ExchangeRateManager(exchangeRateApiId)
        await ExchangeRateManager.instance.pullExchangeRates()

        return ExchangeRateManager.instance
    }

    // pullExchangeRates fetches the newest exchange rates from the API provider and stores it
    // in the ExchangeRateManager object. This should only be called upon server initialization
    // and by the cronJob every hour since the API provider limits # of API requests to 1000 per month,
    // and the rates are updated hourly. Exchange rate requests should use getCurrentExchangeRate
    private async pullExchangeRates() {
        const exchangeRatesResponse = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${this.exchangeRateApiId}`)
        const exchangeRatesResponseJson = await exchangeRatesResponse.json()
        this.currentExchangeRate = exchangeRatesResponseJson.rates
        this.lastUpdated = new Date()
    }

    // getCurrentExchangeRate takes two ISO 4217 currency code(ex. USD, CNY) strings, index the saved
    // exchange rates and returns the exchange rate as a number. Does not pull/update exchange rates.
    getCurrentExchangeRate(fromCurrency: string, toCurrency: string): number {
        if (!this.currentExchangeRate[fromCurrency] || !this.currentExchangeRate[toCurrency]) {
            throw new ReferenceError(`at least 1 of the following currencies: 
                ${fromCurrency} or ${toCurrency} does not exist`)
        } else {
            return this.currentExchangeRate[toCurrency] / this.currentExchangeRate[fromCurrency]
        }
    }

    // getLastUpdate returns the time when the current exchange rates are pulled as a Date object
    getLastUpdatedString(): string {
        return this.lastUpdated.toISOString()
    }
}
