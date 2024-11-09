pipeline {
    environment {
        customImage = ""
    }

    agent any 
    tools {nodejs "nodejs"}

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }

        stage('Build History Service') {
            steps {
                sh '''
                    # Navigate to your Node.js app directory
                    cd history-service

                    # Install dependencies
                    npm install

                    # Build your Node.js application
                    npm run build
                '''
            }
        }
        stage('Build Questions Service') {
            steps {
                sh '''
                    # Navigate to your Node.js app directory
                    cd questions-service

                    # Install dependencies
                    npm install

                    # Build your Node.js application
                    npm run build
                '''
            }
        }

        // stage('Build Frontend') {
        //     steps {
        //         sh '''
        //             # Navigate to your Node.js app directory
        //             cd frontend

        //             # Install dependencies
        //             npm install

        //             # Build your Node.js application
        //             npm run dev
        //         '''
        //     }
        // }

        stage('Build History Docker Image') {
            steps {
                dir('history-service') {
                    script {
                        customImage = docker.build("alyssaoyx/history-service:${env.BUILD_ID}")
                    }
                }
            }
        }

        stage('Build Questions Docker Image') {
            steps {
                dir('question-service') {
                    script {
                        customImage = docker.build("alyssaoyx/question-service:${env.BUILD_ID}")
                    }
                }
            }
        }

        stage('Push Docker Images to Registry') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin'
                    }

                    // Push the images
                    sh "docker push alyssaoyx/history-service:${env.BUILD_ID}"
                    sh "docker push alyssaoyx/question-service:${env.BUILD_ID}"
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up Docker images...'
            sh 'docker rmi alyssaoyx/history-service:${env.BUILD_ID} || true'
            sh 'docker rmi alyssaoyx/questions-service:${env.BUILD_ID} || true'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for errors.'
        }
    }
}
