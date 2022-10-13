package main

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v4/pgxpool"
	"time"
	// "github.com/kataras/iris/v12"
)

var (
	pool        *pgxpool.Pool
	idsToBeRead []int //no size to make things interesting
	iterations  = 50_000
)

type Log struct {
	ID  int  `json:"id" db:"id"`
	Log Data `json:"log" db:"log"`
}

type Data struct {
	A int `json:"a" db:"a"`
}

func connectToDataBase() {
	var err error
	pool, err = pgxpool.Connect(context.Background(), "postgresql://postgres:development-password@localhost:12340/ndis")
	if err != nil {
		panic(err)
	}

	if err = pool.Ping(context.Background()); err != nil {
		fmt.Printf(err.Error())
		return
	}

	println("DB connected")
}

func main() {
	connectToDataBase()
	runTest()
}

func runTest() {
	startTime := time.Now()

	runWrite()
	runRead()
	runWrite()

	fmt.Println(time.Now().Sub(startTime))
}

func runRead() {
	for i := 1; i < len(idsToBeRead); i++ {
		rows, err := pool.Query(context.Background(), "select * from logs where id=$1;", idsToBeRead[i])

		if err != nil {
			fmt.Println(err.Error())
			continue
		}
		for rows.Next() {
			log := Log{}

			err := rows.Scan(&log.ID, &log.Log) // order matters
			if err != nil {
				fmt.Println(err)
			}
		}

		rows.Close()
	}
}

func runWrite() {
	for i := 1; i < iterations; i++ {
		data := Data{i}
		log := Log{Log: data}

		err := pool.QueryRow(context.Background(), "insert into logs (log) VALUES ($1) returning *", &data)
		err.Scan(&log.ID, &log.Log)
		//fmt.Println("returned ", log)
	}
}
