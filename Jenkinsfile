pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm  // Ensures the repo is checked out first
                sh 'ls -al'  // Lists files to confirm the repo is cloned correctly
            }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f docker-compose.yml build'  // Build the Docker images
            }
        }
        stage('Run Containers') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d'  // Run the containers in detached mode
            }
        }
        stage('Verify App') {
            steps {
                sh "sleep 20"  // Wait for the app to start
                sh 'curl -f http://localhost:3000 || exit 1'  // Verify if the app is running by hitting the endpoint
            }
        }
        stage('Clean Up') {
            steps {
                sh 'docker-compose -f docker-compose.yml down'  // Clean up and stop containers
            }
        }
    }
    post {
        failure {
            echo 'Build failed!'  // If build fails, print this message
        }
        success {
            echo 'CI/CD Pipeline executed successfully!'  // If build succeeds, print this message
        }
        always {
            // Clean up any stray containers
            sh 'docker ps -a | grep -i trimsee || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker stop || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker rm || true'
        }
    }
}
