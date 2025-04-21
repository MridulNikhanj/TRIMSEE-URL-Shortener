pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_CMD = 'docker-compose -f docker-compose.yml'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-creds', url: 'https://github.com/MridulNikhanj/TRIMSEE-URL-Shortener.git', branch: 'main'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "${DOCKER_COMPOSE_CMD} build"
            }
        }

        stage('Run Containers') {
            steps {
                sh "${DOCKER_COMPOSE_CMD} up -d"
            }
        }

        stage('Verify App') {
            steps {
                sh "curl -f http://localhost:3000 || exit 1"
            }
        }

        stage('Clean Up') {
            steps {
                sh "${DOCKER_COMPOSE_CMD} down"
            }
        }
    }

    post {
        failure {
            echo 'Build failed!'
        }
        success {
            echo 'CI/CD Pipeline executed successfully!'
        }
    }
}
