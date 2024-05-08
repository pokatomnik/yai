package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/pokatomnik/yai/yai-go/config"
	"github.com/pokatomnik/yai/yai-go/network"
)

func getUpdatedUsage(original func()) func() {
	return func() {
		fmt.Println("Shows a short description of some webpage using Yandex API")
		original()
		fmt.Println("  yai URL [URL1, URL2, ..., URLN]")
	}
}

func main() {
	var setTokenValue string
	var showHelp = flag.Bool("help", false, "Show help")
	flag.StringVar(&setTokenValue, "token", "", "Set Yandex API token")
	flag.Usage = getUpdatedUsage(flag.Usage)
	flag.Parse()

	if *showHelp && setTokenValue != "" {
		fmt.Println("Confusing flags combination")
		flag.Usage()
		os.Exit(1)
	}

	if *showHelp {
		flag.Usage()
		os.Exit(0)
	}

	var config = config.New()

	if setTokenValue != "" {
		var writeTokenErr = config.SetToken(setTokenValue)
		if writeTokenErr == nil {
			fmt.Println("Token saved")
			os.Exit(0)
		} else {
			fmt.Println("Token saving failed")
			os.Exit(1)
		}
	}

	var token, err = config.GetToken()

	if err != nil || token == "" {
		fmt.Println("Missing Yandex API token. See --help")
		os.Exit(1)
	}

	var urls = flag.Args()

	if len(urls) == 0 {
		fmt.Println("At least one URL required")
		flag.Usage()
		os.Exit(0)
	}

	var yandexAPIClient = network.NewYandexAPIClient(token)

	var urlsNumber = len(urls)
	for idx, url := range urls {
		var result, err = yandexAPIClient.HandleUrlCandidate(url)
		if err != nil {
			fmt.Printf("URL: %s\n", url)
			fmt.Printf("  Failed\n")
		} else {
			fmt.Printf("URL: %s\n", url)
			fmt.Println(result)
		}
		if idx < urlsNumber-1 {
			fmt.Println()
		}
	}
}
