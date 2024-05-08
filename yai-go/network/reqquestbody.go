package network

import (
	"bytes"
	"encoding/json"
)

type RequestBody struct {
	ArticleUrl string `json:"article_url"`
}

func (requestBody *RequestBody) GetArticleUrl() string {
	return requestBody.ArticleUrl
}

func NewRequestBody(articleUrl string) *RequestBody {
	return &RequestBody{ArticleUrl: articleUrl}
}

func (requestBody *RequestBody) ToBuffer() (*bytes.Buffer, error) {
	var jsonData, err = json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}
	var buf = bytes.NewBuffer(jsonData)
	return buf, nil
}
