import { type Channel, type Connection, connect } from 'amqplib'
import Producer, { type Code } from './producer'
import Consumer from './consumer'
import { EventEmitter } from 'events'

const RABBITMQ_URL = (process.env.RABBITMQ_URL != null) ? process.env.RABBITMQ_URL : 'amqp://localhost'

class RabbitMQClient {
  private constructor () { }

  private static instance: RabbitMQClient
  private isInitialized = false

  private producer!: Producer
  private consumer!: Consumer
  private connection!: Connection
  private producerChannel!: Channel
  private consumerChannel!: Channel

  private eventEmitter: EventEmitter | undefined

  public static getInstance (): RabbitMQClient {
    if (this.instance == null) {
      this.instance = new RabbitMQClient()
    }
    return this.instance
  }

  async initialize (): Promise<void> {
    try {
      this.connection = await connect(RABBITMQ_URL)

      this.producerChannel = await this.connection.createChannel()
      this.consumerChannel = await this.connection.createChannel()

      const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', { exclusive: true })

      this.eventEmitter = new EventEmitter()
      this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter)
      this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter)

      void this.consumer.consumeMessages()
      this.isInitialized = true
    } catch (error) {
      console.error(error)
    }
  }

  async produce (data: Code): Promise<any> {
    if (!this.isInitialized) await this.initialize()
    return await this.producer.produceMessage(data)
  }
}

export default RabbitMQClient.getInstance()
