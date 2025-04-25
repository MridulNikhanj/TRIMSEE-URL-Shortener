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
                sh '''
                echo "Building Docker images..."
                docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                '''
            }
        }
        
        stage('Run Containers') {
            steps {
                sh '''
                echo "Starting containers..."
                docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                
                echo "Waiting for MongoDB to be healthy..."
                for i in $(seq 1 12); do
                    if docker-compose -f ${DOCKER_COMPOSE_FILE} ps | grep -q "trimsee-mongodb.*healthy"; then
                        echo "MongoDB is healthy"
                        break
                    fi
                    if [ $i -eq 12 ]; then
                        echo "MongoDB failed to become healthy"
                        docker-compose -f ${DOCKER_COMPOSE_FILE} logs mongodb
                        exit 1
                    fi
                    echo "Waiting for MongoDB... (attempt $i/12)"
                    sleep 10
                done
                
                echo "Waiting for backend to be healthy..."
                for i in $(seq 1 12); do
                    if docker-compose -f ${DOCKER_COMPOSE_FILE} ps | grep -q "trimsee-backend.*healthy"; then
                        echo "Backend is healthy"
                        break
                    fi
                    if [ $i -eq 12 ]; then
                        echo "Backend failed to become healthy"
                        docker-compose -f ${DOCKER_COMPOSE_FILE} logs backend
                        exit 1
                    fi
                    echo "Waiting for backend... (attempt $i/12)"
                    sleep 10
                done
                
                echo "Waiting for frontend to be healthy..."
                for i in $(seq 1 12); do
                    if docker-compose -f ${DOCKER_COMPOSE_FILE} ps | grep -q "trimsee-frontend.*healthy"; then
                        echo "Frontend is healthy"
                        break
                    fi
                    if [ $i -eq 12 ]; then
                        echo "Frontend failed to become healthy"
                        docker-compose -f ${DOCKER_COMPOSE_FILE} logs frontend
                        exit 1
                    fi
                    echo "Waiting for frontend... (attempt $i/12)"
                    sleep 10
                done
                
                echo "All containers are healthy!"
                docker-compose -f ${DOCKER_COMPOSE_FILE} ps
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
            docker-compose -f ${DOCKER_COMPOSE_FILE} logs || true
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
