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
                docker ps | grep frontend || exit 1
                docker ps | grep backend || exit 1
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
            docker ps -a | grep -i trimsee || true
            docker ps -a | grep -i trimsee | awk '{print $1}' | xargs docker stop || true
            docker ps -a | grep -i trimsee | awk '{print $1}' | xargs docker rm || true
            '''
        }
    }
}
