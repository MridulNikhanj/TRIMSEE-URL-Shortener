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
                bat 'docker-compose -f docker-compose.yml build'
            }
        }
        stage('Run Containers') {
            steps {
                bat 'docker-compose -f docker-compose.yml up -d'
                bat 'timeout /t 10'
                bat '''
                echo Checking container statuses...
                docker ps -a
                docker logs trimsee-backend
                docker logs trimsee-frontend
                '''
            }
        }
        stage('Verify App') {
            steps {
                bat '''
                echo Waiting for containers to be ready...
                timeout /t 30
                
                echo Checking container statuses...
                docker ps | findstr trimsee-frontend
                if errorlevel 1 (
                    echo Frontend container is not running
                    docker logs trimsee-frontend
                    exit /b 1
                )
                
                docker ps | findstr trimsee-backend
                if errorlevel 1 (
                    echo Backend container is not running
                    docker logs trimsee-backend
                    exit /b 1
                )

                echo Testing application endpoints...
                curl -f http://localhost:3000
                if errorlevel 1 (
                    echo Frontend is not accessible
                    exit /b 1
                )
                
                curl -f http://localhost:3200
                if errorlevel 1 (
                    echo Backend is not accessible
                    exit /b 1
                )
                '''
            }
        }
        stage('Clean Up') {
            steps {
                bat 'docker-compose -f docker-compose.yml down'
            }
        }
    }
    post {
        failure {
            echo 'Build failed!'
            bat '''
            echo Container logs:
            docker logs trimsee-frontend
            docker logs trimsee-backend
            '''
        }
        success {
            echo 'CI/CD Pipeline executed successfully!'
        }
        always {
            bat '''
            echo Stopping and removing leftover containers...
            for /f "tokens=1" %%i in ('docker ps -a ^| findstr /i trimsee') do (
                docker stop %%i
                docker rm %%i
            )
            '''
        }
    }
}
