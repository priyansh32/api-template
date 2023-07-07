package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"sync"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"golang.org/x/sync/semaphore"

	amqp "github.com/rabbitmq/amqp091-go"
)

type message struct {
	Language string `json:"language"`
	Code     string `json:"code"`
}

type response struct {
	replyTo       string
	correlationID string
	body          string
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func consumeMessages(conn *amqp.Connection, queueName string, ds chan amqp.Delivery, wg *sync.WaitGroup) {
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")

	defer wg.Done()
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Failed to declare a queue")

	// default prefetch count is 20

	// register a consumer
	_ds, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-wait
		false,  // no-local
		nil,    // args
	)

	failOnError(err, "Failed to register a consumer")

	for d := range _ds {
		ds <- d
	}
}

func sandboxRunner(ds chan amqp.Delivery, responses chan response, dockerClient *client.Client, wg *sync.WaitGroup, maxContainers int) {
	defer wg.Done()

	semaphore := semaphore.NewWeighted(int64(maxContainers))

	for d := range ds {
		go func(d amqp.Delivery) {
			semaphore.Acquire(context.Background(), 1)
			defer semaphore.Release(1)

			var messageBody message

			err := json.Unmarshal(d.Body, &messageBody)
			if err != nil {
				log.Printf("Error decoding JSON: %s", err)
				return
			}

			responses <- response{
				replyTo:       d.ReplyTo,
				correlationID: d.CorrelationId,
				body:          executeCodeInSandbox(dockerClient, messageBody.Language, messageBody.Code),
			}
		}(d)
	}

}

func produceResponses(conn *amqp.Connection, responses chan response, wg *sync.WaitGroup) {
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")

	defer wg.Done()
	defer ch.Close()

	for response := range responses {
		err = ch.PublishWithContext(
			context.Background(),
			"",               // exchange
			response.replyTo, // routing key
			false,            // mandatory
			false,            // immediate
			amqp.Publishing{
				ContentType:   "text/plain",
				CorrelationId: response.correlationID,
				Body:          []byte(response.body),
			},
		)
		failOnError(err, "Failed to publish a message")
	}
}

var containerConfigs map[string](func(code string) *container.Config) = map[string](func(code string) *container.Config){
	"python": func(code string) *container.Config {
		return &container.Config{
			Image: "python:3.10-alpine3.18",
			Cmd:   []string{"python", "-c", code},
		}
	},
	"javascript": func(code string) *container.Config {
		return &container.Config{
			Image: "node:18.16-alpine3.18",
			Cmd:   []string{"node", "-e", code},
		}
	},
}

func executeCodeInSandbox(dockerClient *client.Client, language string, code string) string {

	sandbox, err := dockerClient.ContainerCreate(
		context.Background(),
		containerConfigs[language](code),
		&container.HostConfig{
			AutoRemove: true,
		},
		nil, // networking config
		nil, // platform config
		"",
	)

	if err != nil {
		log.Printf("Error creating container: %s", err)
		return ""
	}

	if err != nil {
		log.Printf("Error getting container logs: %s", err)
		return ""
	}

	err = dockerClient.ContainerStart(
		context.Background(),
		sandbox.ID,
		types.ContainerStartOptions{},
	)

	if err != nil {
		log.Printf("Error starting container: %s", err)
		return ""
	}

	statusCh, errCh := dockerClient.ContainerWait(
		context.Background(),
		sandbox.ID,
		container.WaitConditionNotRunning,
	)

	var out string
	select {
	case err := <-errCh:
		if err != nil {
			log.Printf("Error waiting for container: %s", err)
			out = ""
		}
	case <-statusCh:
		logs, err := dockerClient.ContainerLogs(
			context.Background(),
			sandbox.ID,
			types.ContainerLogsOptions{
				ShowStdout: true,
				ShowStderr: true,
			},
		)
		defer logs.Close()

		if err != nil {
			log.Printf("Error getting container logs: %s", err)
			return ""
		}

		// currently the output has a bunch of garbage in it
		// gotta figure out how to get rid of it
		buf := new(bytes.Buffer)
		buf.ReadFrom(logs)
		out = buf.String()
	}

	return out
}

func main() {
	var wg sync.WaitGroup

	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	dockerClient, err := client.NewClientWithOpts(client.FromEnv)
	failOnError(err, "Failed to connect to Docker")
	defer dockerClient.Close()

	wg.Add(3)

	ds := make(chan amqp.Delivery, 20)
	responses := make(chan response, 20)

	go consumeMessages(conn, "execution_queue", ds, &wg)
	go sandboxRunner(ds, responses, dockerClient, &wg, 5)
	go produceResponses(conn, responses, &wg)

	wg.Wait()
}
