Feature: Example feature
  As a user of Cucumber.js
  I want to have documentation on Cucumber
  So that I can concentrate on building awesome applications

  Scenario: Failing Scenario
    Given I am on the Cucumber.js GitHub repository
    When I click on "CLI"
    Then I should see "A failing test"

  Scenario: Passing Scenario
    Given I am on the Cucumber.js GitHub repository
    When I click on "CLI"
    Then I should see "Running specific features"

  Scenario: Test Fake Scenario
    Given I go to Google
    When the page loads
    Then I expect to see cats
