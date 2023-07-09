package main

import (
	"context"
	"os/exec"
	rabbitmq_client "sandboxes/rabbitmq_client"
	"time"
)

func executeCode(code string) string {

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "node", "-e", code)
	out, err := cmd.CombinedOutput()

	if ctx.Err() == context.DeadlineExceeded {
		return "Time limit exceeded"
	}

	result := string(out)
	if err != nil {
		result = err.Error() + "\n" + result
	}
	return result
}

func main() {
	rabbitmq_client.Initialize("node18_16", executeCode)
}
