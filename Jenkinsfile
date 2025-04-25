pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        FRONTEND_PORT = '3000'
        BACKEND_PORT = '3200'
        GITHUB_REPO = 'https://github.com/MridulNikhanj/TRIMSEE-URL-Shortener.git'
        MONGODB_URI = 'mongodb://mongodb:27017/trimsee'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-creds', url: env.GITHUB_REPO, branch: 'main'
            }
        }
        
        stage('Environment Setup') {
            steps {
                sh '''
                echo "Checking Docker and Docker Compose installation..."
                docker --version
                docker-compose --version
                
                echo "Cleaning up existing containers..."
                docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache'
            }
        }
        
        stage('Run Containers') {
            steps {
                sh '''
                docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                sleep 20
                echo "Checking container statuses..."
                docker ps -a
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                echo "Waiting for services to be ready..."
                sleep 30
                
                echo "Checking container health..."
                docker ps | grep trimsee-frontend || (echo "Frontend container failed" && exit 1)
                docker ps | grep trimsee-backend || (echo "Backend container failed" && exit 1)
                docker ps | grep trimsee-mongodb || (echo "MongoDB container failed" && exit 1)
                
                echo "Testing backend health..."
                curl -X GET http://localhost:${BACKEND_PORT}/health || (echo "Backend health check failed" && exit 1)
                
                echo "All health checks passed!"
                '''
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh '''
                echo "Running integration tests..."
                sleep 5
                
                echo "Testing URL shortening endpoint..."
                curl -X POST -H "Content-Type: application/json" -d '{"longUrl":"https://www.example.com"}' http://localhost:${BACKEND_PORT}/api/url/shorten || (echo "URL shortening test failed" && exit 1)
                
                echo "Integration tests passed!"
                '''
            }
        }
    }
    
    post {
        success {
            sh 'echo "Pipeline executed successfully!"'
        }
        failure {
            sh '''
            echo "Build or deployment failed!"
            echo "Container logs:"
            docker logs trimsee-frontend || true
            docker logs trimsee-backend || true
            docker logs trimsee-mongodb || true
            '''
        }
        always {
            sh '''
            echo "Cleaning up resources..."
            docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
            '''
        }
    }
}
