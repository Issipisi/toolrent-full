pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        nodejs 'NodeJS-20'
    }

    environment {
        DOCKERHUB_CRED = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'isidorarojas'
        BACKEND_IMAGE  = "${DOCKERHUB_USERNAME}/toolrent-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/toolrent-frontend"
        IMAGE_TAG = "latest"
        BUILD_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo ' Cloning repository from GitHub...'
                git branch: 'main',
                    url: 'https://github.com/Issipisi/toolrent-full.git'
            }
        }

        stage('Test Backend') {
            steps {
                echo ' Running Backend Unit Tests (JUnit)...'
                dir('backend') {
                    bat 'mvn clean test'
                }
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo ' Building Spring Boot Backend...'
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo ' Building React Frontend...'
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo ' Building Docker images...'
                dir('backend') {
                    bat "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:${BUILD_TAG} ."
                }
                dir('frontend') {
                    bat "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:${BUILD_TAG} ."
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo ' Pushing images to DockerHub...'
                bat 'echo %DOCKERHUB_CRED_PSW% | docker login -u %DOCKERHUB_CRED_USR% --password-stdin'
                bat "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                bat "docker push ${BACKEND_IMAGE}:${BUILD_TAG}"
                bat "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                bat "docker push ${FRONTEND_IMAGE}:${BUILD_TAG}"
            }
        }

        stage('Deploy Local') {
            steps {
                echo ' Deploying locally with Docker Compose...'
                bat 'docker compose down || true'
                bat 'docker compose pull'
                bat 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo ' Pipeline completed successfully!'
        }
        failure {
            echo ' Pipeline failed! Check the logs above.'
        }
        always {
            bat 'docker logout || true'
        }
    }
}