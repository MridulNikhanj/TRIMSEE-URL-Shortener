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
                sh 'sleep 10'
                sh '''
                echo "Checking container statuses..."
                docker ps -a
                docker logs trimsee-backend
                docker logs trimsee-frontend
                '''
            }
        }
        stage('Verify App') {
            steps {
                sh '''
                echo "Waiting for containers to be ready..."
                sleep 30
                
                echo "Checking container statuses..."
                if ! docker ps | grep -q trimsee-frontend; then
                    echo "Frontend container is not running"
                    docker logs trimsee-frontend
                    exit 1
                fi
                
                if ! docker ps | grep -q trimsee-backend; then
                    echo "Backend container is not running"
                    docker logs trimsee-backend
                    exit 1
                fi

                echo "Testing application endpoints..."
                if ! curl -f http://localhost:3000; then
                    echo "Frontend is not accessible"
                    exit 1
                fi
                
                if ! curl -f http://localhost:3200; then
                    echo "Backend is not accessible"
                    exit 1
                fi
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
            sh '''
            echo "Container logs:"
            docker logs trimsee-frontend || true
            docker logs trimsee-backend || true
            '''
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
