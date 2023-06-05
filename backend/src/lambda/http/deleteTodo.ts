import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('delete')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Event to be deleted: ", event)
  const todoId = event.pathParameters.todoId
  // TODO: Remove a TODO item by id
  const userId = getUserId(event)
  const result = await deleteTodo(userId, todoId)

  return {
      statusCode: 201,
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
          result
      })
  }
}
