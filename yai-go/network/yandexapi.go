package network

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
)

type YandexAPIClient struct {
	token  string
	client *http.Client
}

func NewYandexAPIClient(token string) *YandexAPIClient {
	return &YandexAPIClient{token: token, client: &http.Client{}}
}

func (yandexAPIClient *YandexAPIClient) getShortResponse(urlCandidate string) (*YandexAPIResponse, error) {
	var _, err = url.Parse(urlCandidate)
	if err != nil {
		return nil, err
	}

	var requestBody = NewRequestBody(urlCandidate)

	var requestBodyBuffer, requestBodyBufferError = requestBody.ToBuffer()
	if requestBodyBufferError != nil {
		return nil, requestBodyBufferError
	}

	var request, makeRequestError = http.NewRequest("POST", "https://300.ya.ru/api/sharing-url", requestBodyBuffer)
	if makeRequestError != nil {
		return nil, makeRequestError
	}

	request.Header.Set("Authorization", fmt.Sprintf("OAuth %s", yandexAPIClient.token))
	request.Header.Set("Content-Type", "application/json")

	var rawResponse, yandexResponseError = yandexAPIClient.client.Do(request)
	if yandexResponseError != nil {
		return nil, yandexResponseError
	}
	defer rawResponse.Body.Close()

	var yandexAPIResponse YandexAPIResponse
	var responseDecodeError = json.NewDecoder(rawResponse.Body).Decode(&yandexAPIResponse)
	if responseDecodeError != nil {
		return nil, yandexResponseError
	}
	return &yandexAPIResponse, nil
}

func (yandexAPIClient *YandexAPIClient) HandleUrlCandidate(urlCandidate string) (string, error) {
	var yandexAPIResponse, err = yandexAPIClient.getShortResponse(urlCandidate)
	if err != nil {
		return "", err
	}
	if !yandexAPIResponse.IsSuccess() {
		return "", errors.New("YANDEX_API_FAILED")
	}
	return fmt.Sprintf("status: %s, url: %s", yandexAPIResponse.Status, yandexAPIResponse.SharingURL), nil
}
