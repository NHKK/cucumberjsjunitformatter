import _ from 'lodash'
import DataTable from '../models/step_arguments/data_table'
import DocString from '../models/step_arguments/doc_string'
import Formatter from './'
import Status from '../status'
import util from 'util'
import xml from 'xml';

export default class JunitTestCase{
  constructor(scenario) {
    this.testcase = scenario;
  }

  createJunitTestCase() {
    var cdataResult = this.createCdataAndGetTotalTime();
    var testcaseClassname = "";
    var testcaseName = this.testcase.name;
    var testcaseTime = cdataResult.time;
    var createFailTag = cdataResult.hasFailStep;
    var cdataString = cdataResult.cdata.join(" \n");
    var attributeObject = { _attr: { classname: testcaseClassname, name: testcaseName, time: testcaseTime } },
          innerObject;
    if (createFailTag) {
        innerObject = { failure: { _cdata: cdataString } };
      } else {
        innerObject = { "system-out": { _cdata: cdataString } };
      }

    return { testcase: [attributeObject, innerObject] };
  }

  createCdataAndGetTotalTime(){
    var result = { time: 0, cdata: [], hasFailStep: false };
      this.testcase.steps.forEach(function (step) {
        result.time += extractNumber(step.result.duration);

        if (step.result.status === 'failed') {
          result.hasFailStep = true;
        }

        result.cdata.push(step.name);
      });
      return result;
  }
}
