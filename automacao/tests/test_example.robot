*** Settings ***
Library    SeleniumLibrary

*** Test Cases ***
Open Example And Check Title
    Open Browser    https://example.com    chrome
    Title Should Be    Example Domain
    [Teardown]    Close Browser
