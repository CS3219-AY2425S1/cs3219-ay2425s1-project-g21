pipeline {
    environment {
        customImage = ""
    }

    agent any 
    tools {
        nodejs 'nodejs'
    }

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
                echo 'Testing'
            }
        }

        stage('Build History Service') {
            steps {
                dir('history-service') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }
        
        // stage('Test History Service') {
        //     steps {
        //         dir('history-service') {
        //             sh '''
        //                 npm test
        //             '''
        //         }
        //     }
        // }

        stage('Build Questions Service') {
            steps {
                dir('question-service') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }
        
        stage('Test Questions Service') {
            steps {
                dir('question-service') {
                    sh '''
                        npm test
                    '''
                }
            }
        }

        // Optionally, uncomment to build the frontend
        // stage('Build Frontend') {
        //     steps {
        //         dir('frontend') {
        //             sh '''
        //                 npm install
        //                 npm run dev
        //             '''
        //         }
        //     }
        // }

        // stage('Build History Docker Image') {
        //     steps {
        //         dir('history-service') {
        //             script {
        //                 withDockerRegistry(credentialsId: 'docker-credentials', url: '') {
        //                     customImage = docker.build("alyssaoyx/history-service:${BUILD_NUMBER}")
        //                 }
        //             }
        //         }
        //     }
        // }

        // stage('Build Questions Docker Image') {
        //     steps {
        //         dir('question-service') {
        //             script {
        //                 customImage = docker.build("alyssaoyx/question-service:${env.BUILD_ID}")
        //             }
        //         }
        //     }
        // }

        // stage('Push Docker Images to Registry') {
        //     steps {
        //         script {
        //             withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
        //                 sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin'
        //             }
        //             sh "docker push alyssaoyx/history-service:${env.BUILD_ID}"
        //             sh "docker push alyssaoyx/question-service:${env.BUILD_ID}"
        //         }
        //     }
        // }
    }
    post {
        always {
            echo 'Cleaning up Docker images...'
            sh 'docker rmi alyssaoyx/history-service:${env.BUILD_ID} || true'
            sh 'docker rmi alyssaoyx/question-service:${env.BUILD_ID} || true'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for errors.'
        }
    }
}
