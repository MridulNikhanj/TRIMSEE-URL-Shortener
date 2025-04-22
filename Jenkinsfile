pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f docker-compose.yml build'
            }
        }
        stage('Run Containers') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d'
            }
        }
        stage('Verify App') {
            steps {
                sh "sleep 20"
                sh 'curl -f http://localhost:3000 || exit 1'
            }
        }
        stage('Clean Up') {
            steps {
                sh 'docker-compose -f docker-compose.yml down'
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
        always {
            sh 'docker ps -a | grep -i trimsee || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker stop || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker rm || true'
        }
    }
}
