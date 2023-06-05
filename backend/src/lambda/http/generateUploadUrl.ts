import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as AWS from  'aws-sdk'
import { createLogger } from '../../utils/logger'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { getUserId } from '../utils'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
createLogger('Update logger')
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event) 
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const signedUrl = getUploadUrl(todoId)

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}.png`

    await docClient.update({
      TableName: process.env.TODOS_TABLE,
      Key: { 
        "todoId": todoId,
        "userId": userId
       },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": imageUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            imageUrl: imageUrl,
            uploadUrl: signedUrl
        })
    }
  }
)

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: `${todoId}.png`,
    Expires: parseInt(urlExpiration)
  })
}
