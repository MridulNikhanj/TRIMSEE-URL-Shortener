pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    // Explicitly clone the repository if it's not already cloned
                    if (!fileExists('.git')) {
                        git credentialsId: 'github-creds', url: 'https://github.com/MridulNikhanj/TRIMSEE-URL-Shortener.git', branch: 'main'
                    } else {
                        echo 'Repository already checked out.'
                    }
                }
            }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f docker-compose.yml build'  // Build the Docker images
            }
        }
        stage('Run Containers') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d'  // Run the containers in detached mode
            }
        }
        stage('Verify App') {
            steps {
                sh "sleep 20"  // Wait for the app to start
                // Use the container name instead of localhost
                sh '''
                FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' trimsee-url-pipeline-frontend-1 || docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' trimsee-url-pipeline_frontend_1)
                curl -f http://$FRONTEND_IP:3000 || exit 1
                '''
            }
        }
        stage('Clean Up') {
            steps {
                sh 'docker-compose -f docker-compose.yml down'  // Clean up and stop containers
            }
        }
    }
    post {
        failure {
            echo 'Build failed!'  // If build fails, print this message
        }
        success {
            echo 'CI/CD Pipeline executed successfully!'  // If build succeeds, print this message
        }
        always {
            // Clean up any stray containers
            sh 'docker ps -a | grep -i trimsee || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker stop || true'
            sh 'docker ps -a | grep -i trimsee | awk \'{print $1}\' | xargs docker rm || true'
        }
    }
}