import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ){}

    async getAllTodos(): Promise<TodoItem[]> {

        const result = await this.docClient.query({
          TableName: this.todosTable
        }).promise()
    
        const items = result.Items
        return items as TodoItem[]
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos function called')

        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        .promise()

        const items = result.Items
        return items as TodoItem[] 
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient
          .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'todoId = :todoId AND userId = :userId',
            ExpressionAttributeValues: {
              ':todoId': todoId,
              ':userId': userId
            }
          })
          .promise()
    
        const items = result.Items[0]
        return items as TodoItem
      }
    

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo item function called')
        const result = await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()
        logger.info('Todo item created', result)
        return todoItem as TodoItem
    }

    async updateTodo(todoId: string, userId: string, updateTodoRequest:UpdateTodoRequest){
        let expressionAttibutes = {
        ":done": updateTodoRequest.done,
        ":name": updateTodoRequest.name,
        ":dueDate": updateTodoRequest.dueDate
        }
        let updateExpression = "set done = :done, dueDate= :dueDate, #n= :name"      

        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            "userId": userId,
            "todoId": todoId
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttibutes,
          ExpressionAttributeNames:{
            "#n": "name"
          }
        }).promise()
    }

    async deleteTodo(userId:string, todoId: string): Promise<boolean> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
              "userId": userId,
              "todoId": todoId
            },
          }).promise()
        return true
      }

    async updateTodoAttachmentUrl(
        todoId: string,
        userId: string,
        attachmentUrl: string
    ): Promise<void>{
        logger.info('Update todo attachment url function called')
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            }
        }).promise()
    }
}