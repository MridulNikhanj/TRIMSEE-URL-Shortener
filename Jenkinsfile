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
                sh '''
                echo Checking Docker and Docker Compose installation...
                docker --version
                docker-compose --version
                
                echo Cleaning up existing containers...
                docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
                '''
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache'
            }
        }
        
        stage('Run Containers') {
            steps {
                sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d'
                sh 'sleep 20'
                sh '''
                echo Checking container statuses...
                docker ps -a
                echo Backend Logs:
                docker logs trimsee-backend || true
                echo Frontend Logs:
                docker logs trimsee-frontend || true
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                echo Waiting for services to be ready...
                sleep 30
                
                echo Checking container health...
                docker ps | grep trimsee-frontend || (echo Frontend container failed && exit 1)
                docker ps | grep trimsee-backend || (echo Backend container failed && exit 1)
                
                echo Testing endpoints...
                attempt_counter=0
                max_attempts=5
                until $(curl --output /dev/null --silent --head --fail http://localhost:$FRONTEND_PORT); do
                    if [ ${attempt_counter} -eq ${max_attempts} ];then
                      echo "Frontend health check failed after $max_attempts attempts."
                      exit 1
                    fi
                    printf '.'
                    attempt_counter=$(($attempt_counter+1))
                    sleep 5
                done
                echo "Frontend OK."

                attempt_counter=0
                until $(curl --output /dev/null --silent --head --fail http://localhost:$BACKEND_PORT); do
                    if [ ${attempt_counter} -eq ${max_attempts} ];then
                      echo "Backend health check failed after $max_attempts attempts."
                      exit 1
                    fi
                    printf '.'
                    attempt_counter=$(($attempt_counter+1))
                    sleep 5
                done
                echo "Backend OK."
                
                echo All health checks passed!
                '''
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh '''
                echo Running integration tests...
                sleep 5 
                curl -X POST -H "Content-Type: application/json" -d '{"longUrl":"https://www.example.com"}' http://localhost:$BACKEND_PORT/api/url/shorten
                if [ $? -ne 0 ]; then
                    echo URL shortening test failed
                    exit 1
                fi
                echo Integration tests passed!
                '''
            }
        }
        
        stage('Clean Up') {
            steps {
                sh '''
                echo Cleaning up resources...
                docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
                '''
            }
        }
    }
    
    post {
        success {
            sh '''
            echo Pipeline executed successfully!
            echo Deployment Status: SUCCESS
            '''
        }
        failure {
            sh '''
            echo Build or deployment failed!
            echo Container logs:
            docker logs trimsee-frontend || echo "Frontend logs unavailable."
            docker logs trimsee-backend || echo "Backend logs unavailable."
            echo Deployment Status: FAILED
            '''
        }
        always {
            sh '''
            echo Cleaning up resources in always block...
            docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
            docker ps -a -q --filter "name=trimsee" | xargs -r docker stop || true
            docker ps -a -q --filter "name=trimsee" | xargs -r docker rm || true
            '''
        }
    }
}
