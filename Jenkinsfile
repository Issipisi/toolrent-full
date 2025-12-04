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
                    sh 'mvn clean test'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo ' Building Spring Boot Backend...'
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo ' Building React Frontend...'
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo ' Building Docker images...'
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:${BUILD_TAG} ."
                }
                dir('frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:${BUILD_TAG} ."
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo ' Pushing images to DockerHub...'
                sh 'echo $DOCKERHUB_CRED_PSW | docker login -u $DOCKERHUB_CRED_USR --password-stdin'
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:${BUILD_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:${BUILD_TAG}"
            }
        }

        stage('Deploy Local') {
            steps {
                echo ' Deploying locally with Docker Compose...'
                sh 'docker compose down || true'
                sh 'docker compose pull'
                sh 'docker compose up -d'
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
            sh 'docker logout || true'
        }
    }
}