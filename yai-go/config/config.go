package config

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	token string
}

func New() *Config {
	return &Config{token: ""}
}

func (config *Config) SetToken(token string) error {
	var configPath, getConfigPathErr = getConfigPath()
	if getConfigPathErr != nil {
		return getConfigPathErr
	}
	var configText = "token=" + token

	var file, createFileError = os.Create(configPath)
	if createFileError != nil {
		return createFileError
	}
	defer file.Close()

	var _, writeFileError = file.WriteString(configText)
	if writeFileError != nil {
		return writeFileError
	}

	config.token = token

	return nil
}

func (config *Config) GetToken() (string, error) {
	if config.token != "" {
		return config.token, nil
	}

	var configPath, err = getConfigPath()
	if err != nil {
		return "", err
	}

	var stat, configStatErr = os.Stat(configPath)
	if configStatErr != nil {
		return "", configStatErr
	}

	if stat.IsDir() {
		return "", errors.New("CONFIG_FILE_IS_DIRECTORY")
	}

	var configText, configReadErr = os.ReadFile(configPath)
	if configReadErr != nil {
		return "", configReadErr
	}

	var token = parseConfig(string(configText))

	if token == "" {
		return "", errors.New("MISSING_TOKEN")
	}

	config.token = token

	return token, nil
}

func getConfigPath() (string, error) {
	var homeDir, getHomeDirErr = os.UserHomeDir()
	if getHomeDirErr != nil {
		return "", getHomeDirErr
	}
	var configPath = filepath.Join(homeDir, ".yai-config")
	return configPath, nil
}

func parseConfig(source string) string {
	var lines = strings.Split(source, "\n")
	for _, line := range lines {
		var keyValue = strings.Split(line, "=")
		if len(keyValue) < 2 {
			continue
		}
		var key = strings.ToLower(strings.TrimSpace(keyValue[0]))
		if key == "token" {
			var token = strings.TrimSpace(keyValue[1])
			return (token)
		}
	}
	return ("")
}
