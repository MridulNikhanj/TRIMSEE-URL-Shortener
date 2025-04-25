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
                bat '''
                echo Checking Docker and Docker Compose installation...
                docker --version
                docker-compose --version
                
                echo Cleaning up existing containers...
                docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans || exit 0
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                bat 'docker-compose -f %DOCKER_COMPOSE_FILE% build --no-cache'
            }
        }
        
        stage('Run Containers') {
            steps {
                bat '''
                docker-compose -f %DOCKER_COMPOSE_FILE% up -d
                timeout /t 20 /nobreak
                echo Checking container statuses...
                docker ps -a
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                bat '''
                echo Waiting for services to be ready...
                timeout /t 30 /nobreak
                
                echo Checking container health...
                docker ps | findstr "trimsee-frontend" || (echo Frontend container failed && exit 1)
                docker ps | findstr "trimsee-backend" || (echo Backend container failed && exit 1)
                docker ps | findstr "trimsee-mongodb" || (echo MongoDB container failed && exit 1)
                
                echo Testing backend health...
                curl -X GET http://localhost:%BACKEND_PORT%/health || (echo Backend health check failed && exit 1)
                
                echo All health checks passed!
                '''
            }
        }
        
        stage('Integration Tests') {
            steps {
                bat '''
                echo Running integration tests...
                timeout /t 5 /nobreak
                
                echo Testing URL shortening endpoint...
                curl -X POST -H "Content-Type: application/json" -d "{\"longUrl\":\"https://www.example.com\"}" http://localhost:%BACKEND_PORT%/api/url/shorten || (echo URL shortening test failed && exit 1)
                
                echo Integration tests passed!
                '''
            }
        }
    }
    
    post {
        success {
            bat 'echo Pipeline executed successfully!'
        }
        failure {
            bat '''
            echo Build or deployment failed!
            echo Container logs:
            docker logs trimsee-frontend
            docker logs trimsee-backend
            docker logs trimsee-mongodb
            '''
        }
        always {
            bat '''
            echo Cleaning up resources...
            docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans || exit 0
            '''
        }
    }
}
