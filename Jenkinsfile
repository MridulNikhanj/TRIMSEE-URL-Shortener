pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        FRONTEND_PORT = '3000'
        BACKEND_PORT = '3200'
        GITHUB_REPO = 'https://github.com/MridulNikhanj/TRIMSEE-URL-Shortener.git'
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
                docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans
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
                bat 'docker-compose -f %DOCKER_COMPOSE_FILE% up -d'
                bat 'timeout /t 20'
                bat '''
                echo Checking container statuses...
                docker ps -a
                echo Backend Logs:
                docker logs trimsee-backend
                echo Frontend Logs:
                docker logs trimsee-frontend
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                bat '''
                echo Waiting for services to be ready...
                timeout /t 30
                
                echo Checking container health...
                docker ps | findstr trimsee-frontend || (echo Frontend container failed & exit /b 1)
                docker ps | findstr trimsee-backend || (echo Backend container failed & exit /b 1)
                
                echo Testing endpoints...
                curl -f -s http://localhost:%FRONTEND_PORT% > nul || (echo Frontend health check failed & exit /b 1)
                curl -f -s http://localhost:%BACKEND_PORT% > nul || (echo Backend health check failed & exit /b 1)
                echo All health checks passed!
                '''
            }
        }
        
        stage('Integration Tests') {
            steps {
                bat '''
                echo Running integration tests...
                curl -X POST -H "Content-Type: application/json" -d "{\"longUrl\":\"https://www.example.com\"}" http://localhost:%BACKEND_PORT%/api/url/shorten
                if errorlevel 1 (
                    echo URL shortening test failed
                    exit /b 1
                )
                echo Integration tests passed!
                '''
            }
        }
        
        stage('Clean Up') {
            steps {
                bat '''
                echo Cleaning up resources...
                docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans
                '''
            }
        }
    }
    
    post {
        success {
            bat '''
            echo Pipeline executed successfully!
            echo Deployment Status: SUCCESS
            '''
        }
        failure {
            bat '''
            echo Build or deployment failed!
            echo Container logs:
            docker logs trimsee-frontend
            docker logs trimsee-backend
            echo Deployment Status: FAILED
            '''
        }
        always {
            bat '''
            echo Cleaning up resources...
            docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans
            for /f "tokens=1" %%i in ('docker ps -a ^| findstr /i trimsee') do (
                docker stop %%i
                docker rm %%i
            )
            '''
        }
    }
}
