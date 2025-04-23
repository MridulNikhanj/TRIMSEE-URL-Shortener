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
                sh "sleep 30"  // Wait longer for the app to start (30 seconds)
                sh '''
                # Check if containers are still running
                docker ps | grep frontend
                docker ps | grep backend
                
                # Try to access the app through Docker host network
                docker run --rm --network=host curlimages/curl:latest curl -f http://localhost:3000 || exit 1
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