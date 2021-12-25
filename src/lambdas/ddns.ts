"use strict";

import { ChangeResourceRecordSetsCommand, ChangeResourceRecordSetsCommandInput, Route53Client } from "@aws-sdk/client-route-53";
import { APIGatewayEventRequestContext, APIGatewayProxyEvent } from "aws-lambda";


const route53Client: Route53Client = new Route53Client({})
module.exports.handler = async (event: APIGatewayProxyEvent, context: APIGatewayEventRequestContext) => {
  if (event.pathParameters?.hostedZoneId === undefined || event.pathParameters?.name === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'must specify hostedZoneId and name in path parameters'
      })
    }
  }
  const hostedZoneId = event.pathParameters.hostedZoneId
  const name = event.pathParameters.name
  const sourceIp = event.requestContext.identity.sourceIp

  console.log(`setting ${name} on ${hostedZoneId} to ${sourceIp}`)

  const changeResourceRecordSetsInput: ChangeResourceRecordSetsCommandInput = {
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Comment: `Update from DDNS API on ${new Date().toISOString()}`,
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: name,
            Type: 'A',
            TTL: 300,
            ResourceRecords: [
              { Value: sourceIp }
            ]
          }
        }
      ]
    }
  }

  try {
    const response = await route53Client.send(new ChangeResourceRecordSetsCommand(changeResourceRecordSetsInput))
    console.log(response.ChangeInfo)
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error'
      })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        hostedZoneId,
        name,
        sourceIp
      }
    )
  }
}