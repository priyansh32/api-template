package utils

import (
	"log"
)

type Message struct {
	Language string `json:"language"`
	Code     string `json:"code"`
}

type Response struct {
	ReplyTo       string
	CorrelationID string
	Body          string
}

func FailOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}
