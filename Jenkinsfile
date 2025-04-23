pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-creds', url: 'https://github.com/MridulNikhanj/TRIMSEE-URL-Shortener.git', branch: 'main'
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
                sh "sleep 30"
                sh '''
                echo "Checking container statuses..."
                docker ps | grep trimsee-frontend || exit 1
                docker ps | grep trimsee-backend || exit 1

                echo "Testing application endpoint..."
                curl -f http://localhost:3000 || exit 1
                '''
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
            sh '''
            echo "Stopping and removing leftover containers..."
            docker ps -a | grep -i trimsee | awk '{print $1}' | xargs docker stop || true
            docker ps -a | grep -i trimsee | awk '{print $1}' | xargs docker rm || true
            '''
        }
    }
}
