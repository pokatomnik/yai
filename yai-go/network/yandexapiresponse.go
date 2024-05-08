package network

type YandexAPIResponse struct {
	Status     string `json:"status"`
	SharingURL string `json:"sharing_url"`
}

func (yandexAPIResponse *YandexAPIResponse) IsSuccess() bool {
	return yandexAPIResponse.Status == "success"
}
