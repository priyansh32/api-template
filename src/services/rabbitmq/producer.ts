import { type ConsumeMessage, type Channel } from 'amqplib'
import { randomUUID } from 'crypto'
import type EventEmitter from 'events'

const TIMEOUT = 30000
const queueName = 'execution_queue'

export interface Code {
  language: string
  code: string
}

export default class Producer {
  constructor (
    private readonly channel: Channel,
    private readonly replyQueueName: string,
    private readonly eventEmitter: EventEmitter
  ) { }

  private async _waitForResponse (correlationId: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.eventEmitter.removeListener(correlationId, listener)
        reject(new Error('timeout'))
      }, TIMEOUT)

      const listener = (message: ConsumeMessage): void => {
        if (message.properties.correlationId === correlationId) {
          clearTimeout(timer)
          this.eventEmitter.removeListener(correlationId, listener)
          resolve(message.content.toString())
        }
      }

      this.eventEmitter.once(correlationId, listener)
    })
  }

  async produceMessage (data: Code): Promise<any> {
    const correlationId = randomUUID()

    this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyQueueName,
        correlationId,
        expiration: TIMEOUT
      })

    return await this._waitForResponse(correlationId)
  }
}
