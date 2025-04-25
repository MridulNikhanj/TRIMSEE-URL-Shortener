pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        FRONTEND_PORT = '3000'
        BACKEND_PORT = '3200'
        GITHUB_REPO = 'https://github.com/MridulNikhanj/TRIMSEE-URL-Shortener.git'
        DB_URI = 'mongodb+srv://nikhanjmridul:XcRsInwe9rfoVAtm@cluster0.o59qiro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        BASE = 'http://localhost:3200'
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
                docker system prune -f || true
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
                echo "Waiting for containers to be healthy..."
                sleep 60
                echo "Checking container statuses..."
                docker ps -a
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                echo "Checking container health..."
                if ! docker ps | grep -q trimsee-mongodb; then
                    echo "MongoDB container not running"
                    docker logs trimsee-mongodb
                    exit 1
                fi
                
                if ! docker ps | grep -q trimsee-backend; then
                    echo "Backend container not running"
                    docker logs trimsee-backend
                    exit 1
                fi
                
                if ! docker ps | grep -q trimsee-frontend; then
                    echo "Frontend container not running"
                    docker logs trimsee-frontend
                    exit 1
                fi
                
                echo "Testing backend health..."
                for i in $(seq 1 6); do
                    if curl -s -f http://localhost:${BACKEND_PORT}/health; then
                        echo "Backend is healthy"
                        break
                    fi
                    if [ $i -eq 6 ]; then
                        echo "Backend health check failed after 6 attempts"
                        docker logs trimsee-backend
                        exit 1
                    fi
                    echo "Waiting for backend to be ready... (attempt $i/6)"
                    sleep 10
                done
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
