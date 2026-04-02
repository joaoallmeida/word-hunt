# 🧩 Word Hunt (Caça-Palavras)

Welcome to the **Word Hunt** project! This is a fun and interactive word search puzzle game built with a web frontend (HTML/CSS/JS) and a Python (Flask) backend.

## 🎥 Demo

![Word Hunt Demo](frontend/assets/videos/demo.gif)

## 🌟 What is this project?

The project generates a dynamic Word Hunt board where players must find a list of hidden words. The game includes:
- **Interactive Board**: Click and drag to select words naturally.
- **Dynamic Generation**: The backend generates totally unique boards and word lists each time.
- **Timer & Progress**: Keep track of your time and visually strike through the words you find.
- **Responsive Design**: Fully playable on desktop, tablet, and mobile devices.
- **Theming**: Enjoy the game in dark or light mode.

## 🧰 Requirements

To run this project locally, you only need:
- **Docker** and **Docker Compose**

## ⚙️ How to use the Makefile

We use Docker to power the environment to keep things simple. You can manage the application using the included `Makefile`. Here are the available commands:

- **`make build`**: 🚧 Builds the `wordhunt:latest` Docker image from the `docker/Dockerfile`.
- **`make up`**: 🚀 Starts the application container in the background using `docker compose up -d`.
- **`make down`**: 🧹 Stops and removes the currently running containers along with their volumes.
- **`make deploy`**: ⚡ The easiest way to get started! It runs `make build` followed automatically by `make up`.
- **`make rebuild`**: 🔄 Tears down the environment and performs a fresh build and startup (`down` -> `build` -> `up`).
- **`make destroy`**: 💥 Stops the environment, fully removes the active `wordhunt` Docker image, and prunes cached builds to save system space.

### 🚀 Quick Start

From your terminal, simply use:
```bash
make deploy
```
Once the command finishes, the backend server will be up and running and the frontend will be accessible from your browser! Enjoy hunting! 🕵️‍♂️
