import { type Channel, type ConsumeMessage } from 'amqplib'
import { type EventEmitter } from 'events'

export default class Consumer {
  constructor (
    private readonly channel: Channel,
    private readonly replyQueueName: string,
    private readonly eventEmitter: EventEmitter) { }

  async consumeMessages (): Promise<void> {
    console.log('Consumer started')
    void this.channel.consume(this.replyQueueName, (message: ConsumeMessage | null) => {
      if (message == null) return
      this.eventEmitter.emit(
        message.properties.correlationId,
        message
      )
    },
    {
      noAck: true
    }
    )
  }
}
