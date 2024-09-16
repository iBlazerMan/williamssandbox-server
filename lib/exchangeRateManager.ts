import {CronJob} from "cron"

type ExchangeRate = {[key: string]: number};

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
        // FIXME: DEBUG
        //     await this.pullExchangeRates()
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
