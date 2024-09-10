import { Static, Type } from "@sinclair/typebox"

///// awsSns routes /////
// request
export const sendMessageToPhoneNumberRequestUrl = "/awsSns/sendMessageToPhoneNumber"
export const sendMessageToPhoneNumberRequest = Type.Object({
  message: Type.String({ minLength: 1 }),
  destNumber: Type.String({ minLength: 1 }),
})
export type SendMessageToPhoneNumberRequest = Static<typeof sendMessageToPhoneNumberRequest>

export const sendCodeToPhoneAndSaveRequestUrl = "/awsSns/sendCodeToPhoneAndSave"
export const sendCodeToPhoneAndSaveRequest = Type.Object({
  destNumber: Type.String({ minLength: 1 }),
})
export type SendCodeToPhoneAndSaveRequest = Static<typeof sendCodeToPhoneAndSaveRequest>

///// awsSes routes /////
// request
export const sendEmailRequestUrl = ""
export const sendEmailRequest = Type.Object({
  from: Type.String({ minLength: 1 }),
  to: Type.String({ minLength: 1 }),
  subject: Type.String(),
  html: Type.String(),
  text: Type.String(),
})
export type SendEmailRequest = Static<typeof sendEmailRequest>

///// subscription routes /////
// request
export const getExchangeRateRequestUrl = "/subscription/getExchangeRate"
export const getExchangeRateRequest = Type.Object({
  fromCurrency: Type.String({ minLength: 1 }),
  toCurrency: Type.String({ minLength: 1 }),
})
export type GetExchangeRateRequest = Static<typeof getExchangeRateRequest>

export const verifySignInRequestUrl = "/subscription/verifySignIn"
export const verifySignInRequest = Type.Object({
  contactType: Type.String({ minLength: 1 }),
  contactInfo: Type.String({ minLength: 1 }),
  verificationCode: Type.String({ minLength: 1 }),
})
export type VerifySignInRequest = Static<typeof verifySignInRequest>

// response
export const getExchangeRateResponse = Type.Object({
  rate: Type.Number(),
  lastUpdated: Type.String({ format: "date-time" }),
})
export type GetExchangeRateResponse = Static<typeof getExchangeRateResponse>

export const verifySignInResponse = Type.Object({
  status: Type.String({ minLength: 1 }),
})
export type VerifySignInResponse = Static<typeof verifySignInResponse>
