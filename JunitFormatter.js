import _ from 'lodash'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import Formatter from './'
import Status from '../status'
import util from 'util'
import xml from 'xml';

export default class JunitFormatter extends Formatter {
  constructor(options) {
    super(options)
    this.Scenarios = [];
    this.testsuite = {failed: 0, skipped: 0, tests: 0, time: 0};
  }

  convertNameToId(obj) {
    return obj.name.replace(/ /g, '-').toLowerCase()
  }

  handleBeforeScenario(scenario) {
    this.currentScenario = {steps: [], time: 0, name: ""};
  }

  handleAfterScenario(scenario){
    this.currentScenario.name = scenario.name;
    this.Scenarios.push(this.currentScenario);
  }

  handleFeatureResult(featuresResult){
    this.testsuite.tests = this.Scenarios.length;
    var junitTestCases = [{ _attr: { failed: this.testsuite.failed, skipped: this.testsuite.skipped, time: this.testsuite.time}}];
    this.Scenarios.forEach(function(element, index){
        var aJunitTestCase = new JunitTestCase(element);
        junitTestCases.push(aJunitTestCase.createJunitTestCase());
      });
    console.log(xml([{testsuite:junitTestCases}]));
  }

  handleStepResult(stepResult) {
    const step = stepResult.step
    const status = stepResult.status

    const currentStep = {
      keyword: step.keyword,
      name: step.name,
      result: {status: status}
    }

    if (step.isBackground) {
      currentStep.isBackground = true
    }

    if (step.constructor.name === 'Step') {
      this.currentScenario.steps.push(currentStep);
    }

    if (status === Status.PASSED || status === Status.FAILED) {
      currentStep.result.duration = stepResult.duration
      this.currentScenario.time += currentStep.result.duration;
      this.testsuite.time += currentStep.result.duration;

      if(status === Status.FAILED){
        this.testsuite.failed++;
      }
    }

    if (stepResult.stepDefinition) {
      const location = stepResult.stepDefinition.uri + ':' + stepResult.stepDefinition.line
      currentStep.match = {location}
    }

    this.currentScenario.steps.push(currentStep)
  }
}
