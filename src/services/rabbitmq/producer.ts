import { type Channel } from 'amqplib'
import { randomUUID } from 'crypto'
import type EventEmitter from 'events'

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

  async produceMessage (data: Code): Promise<any> {
    const queueName = data.language
    const correlationId = randomUUID()

    this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyQueueName,
        correlationId
      })

    return await new Promise((resolve, reject) => {
      this.eventEmitter.once(correlationId, (data) => {
        resolve(data)
      }
      )
    })
  }
}
