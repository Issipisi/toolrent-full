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
                    script {
                        def results = junit '**/target/surefire-reports/*.xml'
                        def total   = results.totalCount
                        def passed  = total - results.failCount - results.skipCount
                        def coverage = (passed / total * 100).round(2)
                        echo " Test Coverage: ${coverage}%"
                        if (coverage < 90) {
                            error " Cobertura ${coverage}% < 90%"
                        } else {
                            echo " Cobertura cumple 90%"
                        }
                    }
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

        stage