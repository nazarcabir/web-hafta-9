FROM golang:1.21

WORKDIR /app

COPY go.mod ./
# No go.sum available, let's let tidy handle it
COPY . .

RUN go mod tidy
RUN go build -v -o main .

EXPOSE 8080

CMD ["./main"]
