package network

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type YandexAPIClient struct {
	token        string
	client       *http.Client
	replacements *map[string]string
}

func NewYandexAPIClient(token string) *YandexAPIClient {
	return &YandexAPIClient{
		token:  token,
		client: &http.Client{},
		replacements: &map[string]string{
			"•": "",
		},
	}
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

func (yandexAPIClient *YandexAPIClient) getShortHTML(htmlURL string) (string, error) {
	var response, responseError = yandexAPIClient.client.Get(htmlURL)
	if responseError != nil {
		return "", responseError
	}
	defer response.Body.Close()

	var document, tokenizerError = goquery.NewDocumentFromReader(response.Body)
	if tokenizerError != nil {
		return "", tokenizerError
	}

	var el = document.Find("meta[name=\"description\"]")
	if el == nil {
		return "", errors.New("CONTENT_NOT_FOUND")
	}

	var content, exists = el.Attr("content")
	if !exists {
		return "", errors.New("CONTENT_TAG_NOT_EXISTS")
	}

	return content, nil
}

func (yandexAPIClient *YandexAPIClient) formatResponse(response string) string {
	var linesResult = make([]string, 0, 2)
	var currentLines = strings.Split(response, "\n")
	for _, line := range currentLines {
		for from, to := range *yandexAPIClient.replacements {
			var updatedLine = fmt.Sprintf("  %s", strings.TrimSpace(strings.ReplaceAll(line, from, to)))
			if updatedLine != "" {
				linesResult = append(linesResult, updatedLine)
			}
		}
	}
	return strings.Join(linesResult, "\n")
}

func (yandexAPIClient *YandexAPIClient) HandleUrlCandidate(urlCandidate string) (string, error) {
	var yandexAPIResponse, yandexAPIResponseErr = yandexAPIClient.getShortResponse(urlCandidate)
	if yandexAPIResponseErr != nil {
		return "", yandexAPIResponseErr
	}
	if !yandexAPIResponse.IsSuccess() {
		return "", errors.New("YANDEX_API_FAILED")
	}

	var shortText, shortResponseError = yandexAPIClient.getShortHTML(yandexAPIResponse.SharingURL)
	if shortResponseError != nil {
		return "", shortResponseError
	}

	return yandexAPIClient.formatResponse(shortText), nil
}
