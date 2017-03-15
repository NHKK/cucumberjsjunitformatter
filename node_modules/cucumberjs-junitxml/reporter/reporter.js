// Customized reporter for cucumber-js
// Copy this file to your cucumber support file path. E.g. features/support/reporter.js
// Json result and report will save to features/output/
var fs = require('fs');
var junit = require('cucumberjs-junitxml');
var reportDir = process.env.TEST_RESULTS_DIR || process.cwd() + '/tests/features/output';
var reportFilePath = reportDir + '/cucumber-test-results.xml';
var testResult = [];

var reporterHooks = function() {
    // save feature output
    this.registerHandler('BeforeFeature', function(event, callback) {
        var feature = event.getPayloadItem('feature');
        var currentFeatureId = feature.getName().replace(/ /g, '-');
        var featureOutput = {
            id: currentFeatureId,
            name: feature.getName(),
            description: feature.getDescription(),
            line: feature.getLine(),
            keyword: feature.getKeyword(),
            uri: feature.getUri(),
            elements: []
        };

        testResult.push(featureOutput);

        callback();
    });

    // save scenario output
    this.registerHandler('BeforeScenario', function(event, callback) {
        var scenario = event.getPayloadItem('scenario');
        var currentScenarioId = testResult[testResult.length - 1].id + ';' + scenario.getName().replace(/ /g, '-');
        var scenarioOutput = {
            id: currentScenarioId,
            name: scenario.getName(),
            description: scenario.getDescription(),
            line: scenario.getLine(),
            keyword: scenario.getKeyword(),
            steps: []
        };

        testResult[testResult.length - 1].elements.push(scenarioOutput);

        callback();
    });

    // save steps output
    this.registerHandler('StepResult', function(event, callback) {
        var stepResult = event.getPayloadItem('stepResult');
        var steps = stepResult.getStep();

        var stepOutput = {
            name: steps.getName(),
            line: steps.getLine(),
            keyword: steps.getKeyword(),
            result: {},
            match: {}
        };
        var resultStatus;
        var attachments;

        if (stepResult.isSuccessful()) {
            resultStatus = 'passed';
            if (stepResult.hasAttachments()) {
                attachments = stepResult.getAttachments();
            }
            stepOutput.result.duration = stepResult.getDuration();
        } else if (stepResult.isPending()) {
            resultStatus = 'pending';
            stepOutput.result.error_message = undefined;
        } else if (stepResult.isSkipped()) {
            resultStatus = 'skipped';
        } else if (stepResult.isUndefined()) {
            resultStatus = 'undefined';
        } else {
            resultStatus = 'failed';
            var failureMessage = stepResult.getFailureException();
            if (failureMessage) {
                stepOutput.result.error_message = (failureMessage.stack || failureMessage);
            }
            if (stepResult.hasAttachments()) {
                attachments = stepResult.getAttachments();
            }
            stepOutput.result.duration = stepResult.getDuration();
        }

        stepOutput.result.status = resultStatus;

        if (attachments) {
            attachments.syncForEach(function(attachment) {
                // TODO: formatter.embedding
            });
        }

        var rlen = testResult.length - 1;
        testResult[rlen].elements[testResult[rlen].elements.length - 1].steps.push(stepOutput);

        callback();
    });

    // output testResult
    this.registerHandler('AfterFeatures', function(event, callback) {
        var xml = junit(JSON.stringify(testResult), { indent: '    ', strict: true });
        var file = fs.openSync(reportFilePath, 'w+');
        fs.writeSync(file, xml);
        callback();
    });
};

module.exports = reporterHooks;