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
                script {
                    sh '''
                    docker-compose -f docker-compose.yml build || \
                    (docker run --rm -v $(pwd):/workspace -w /workspace docker/compose:latest -f docker-compose.yml build)
                    '''
                }
            }
        }
        stage('Run Containers') {
            steps {
                script {
                    sh '''
                    docker-compose -f docker-compose.yml up -d || \
                    (docker run --rm -v $(pwd):/workspace -w /workspace -v /var/run/docker.sock:/var/run/docker.sock docker/compose:latest -f docker-compose.yml up -d)
                    '''
                }
            }
        }
        stage('Verify App') {
            steps {
                script {
                    // Wait for the application to start
                    sh "sleep 20"
                    
                    // Try to access the frontend - using container name
                    sh '''
                    curl -f http://localhost:3000 || exit 1
                    '''
                }
            }
        }
        stage('Clean Up') {
            steps {
                script {
                    sh '''
                    docker-compose -f docker-compose.yml down || \
                    (docker run --rm -v $(pwd):/workspace -w /workspace -v /var/run/docker.sock:/var/run/docker.sock docker/compose:latest -f docker-compose.yml down)
                    '''
                }
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
            // Clean up any stray containers to prevent issues with future builds
            sh 'docker ps -a | grep -i trimsee || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker stop || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker rm || true'
        }
    }
}