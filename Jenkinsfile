// Generate the populated version from Wafu → Integrations → Jenkins.
// Prerequisites: Linux agent labelled wafu-ci with Python 3, Git and curl;
// Credentials Binding, Pipeline, Git and JUnit plugins; Secret text wafu-ci-token.
pipeline {
    agent { label 'wafu-ci' }
    options {
        timeout(time: 90, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }
    environment {
        PFA_URL = 'https://scan.wafusecurity.com'
        PFA_PROJECT = '5b95958c-8712-48ec-9250-655bb5b0bb3e'
        PFA_CLI_SHA256 = 'f41979cca918869958785e6f0de7257de70ba97f0ea6af28f7bb0a808a8f55a0'
        PFA_REPORT_ONLY = 'false'
    }
    stages {
        stage('Prepare Wafu CLI') {
            steps {
                sh '''
                    set -eu
                    umask 077
                    command -v python3 >/dev/null
                    command -v git >/dev/null
                    command -v curl >/dev/null
                    agent_tmp="${WORKSPACE_TMP:-${WORKSPACE}@tmp}/wafu-${BUILD_NUMBER}"
                    mkdir -p "$agent_tmp"
                    curl --fail --silent --show-error --connect-timeout 10 --max-time 120 \
                      --proto '=https' "$PFA_URL/api/v1/cli/wafu.py" -o "$agent_tmp/wafu.py"
                    printf '%s  %s\n' "$PFA_CLI_SHA256" "$agent_tmp/wafu.py" | sha256sum --check --status
                    python3 "$agent_tmp/wafu.py" --url "$PFA_URL"  --check-version
                '''
            }
        }
        stage('Wafu security scan') {
            steps {
                withCredentials([string(credentialsId: 'wafu-ci-token', variable: 'PFA_CI_TOKEN')]) {
                    script {
                        def outcome = sh(returnStatus: true, script: '''
                            set +x
                            set -eu
                            umask 077
                            agent_tmp="${WORKSPACE_TMP:-${WORKSPACE}@tmp}/wafu-${BUILD_NUMBER}"
                            extra=""
                            if [ "$PFA_REPORT_ONLY" = "true" ]; then extra="--report-only"; fi
                            python3 "$agent_tmp/wafu.py" \
                              --url "$PFA_URL"  --project "$PFA_PROJECT" --source . \
                              --mode FULL --families sast secrets --no-ai-review --no-ai-guidance --presets \
                              --timeout 5100 --state "$agent_tmp/state.json" \
                              --reports "wafu-reports/$BUILD_NUMBER" $extra
                        ''')
                        if (outcome == 1) { error('Wafu quality gate FAIL: review the security findings') }
                        if (outcome == 2) { error('Wafu analysis ERROR: evidence or service unavailable') }
                        if (outcome != 0) { error('Wafu client did not complete successfully (exit ' + outcome + ')') }
                    }
                }
            }
        }
    }
    post {
        always {
            // The frozen Wafu gate controls the build result; JUnit lists findings.
            junit testResults: "wafu-reports/${env.BUILD_NUMBER}/*.junit.xml",
                allowEmptyResults: true, skipMarkingBuildUnstable: true
            archiveArtifacts artifacts: "wafu-reports/${env.BUILD_NUMBER}/*",
                allowEmptyArchive: true, fingerprint: true, followSymlinks: false
        }
    }
}
