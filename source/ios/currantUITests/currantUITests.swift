//
//  currantUITests.swift
//  currantUITests
//
//  Created by Foster Yin on 10/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import XCTest

class currantUITests: XCTestCase {
        
    override func setUp() {
        super.setUp()
        
        // Put setup code here. This method is called before the invocation of each test method in the class.
        
        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false
        // UI tests must launch the application that they test. Doing this in setup will make sure it happens for each test method.
        XCUIApplication().launch()

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
    
    func testSwitchTab() {
        // Use recording to get started writing UI tests.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        
        let app = XCUIApplication()
//        app.alerts["Alert Test"].collectionViews.buttons["OK"].tap()
//        
//        let element = app.childrenMatchingType(.Window).elementBoundByIndex(0).childrenMatchingType(.Other).element.childrenMatchingType(.Other).element
//        element.swipeLeft()
//        element.swipeLeft()
//        app.buttons["Launch Application"].tap()
//        app.alerts["New Version Available"].collectionViews.buttons["Later"].tap()

        let tabBarsQuery = app.tabBars
        tabBarsQuery.buttons["For Sale"].tap()
        tabBarsQuery.buttons["List Your Space"].tap()
        tabBarsQuery.buttons["For Rent"].tap()
        tabBarsQuery.buttons["Profile"].tap()
        tabBarsQuery.buttons["Homepage"].tap()

    }

    func testShowPhone() {
        
        let app = XCUIApplication()
        app.alerts["Alert Test"].collectionViews.buttons["OK"].tap()
        app.navigationBars["YoungFunding"].buttons["nav phone"].tap()
        app.alerts["Phone unavaliable"].collectionViews.buttons["OK"].tap()

    }

    func testLogin() {
        
        let app = XCUIApplication()
        app.alerts["Alert Test"].collectionViews.buttons["OK"].tap()
        app.tabBars.buttons["Profile"].tap()
        app.otherElements["+44 UK"].tap()
        app.pickerWheels["+44 UK"].tap()
        //http://stackoverflow.com/questions/31257409/how-to-select-a-picker-view-item-in-an-ios-ui-test-in-xcode
        app.pickerWheels.element.adjustToPickerWheelValue("+86 China")
        app.toolbars.buttons["Done"].tap()
        app.alerts["New Version Available"].collectionViews.buttons["Later"].tap()
        
        let phoneNumberTextField = app.textFields["Phone Number"]
        phoneNumberTextField.tap()
        phoneNumberTextField.typeText("15872411146")
        
        let passwordSecureTextField = app.secureTextFields["Password"]
        passwordSecureTextField.tap()
        passwordSecureTextField.typeText("abc123")
        app.buttons["Log In"].tap()
        app.alerts["Your language preference is not the system language you are using, you can change your language setting in \"Profile\" -> \"Setting\""].collectionViews.buttons["OK"].tap()
    }
    
}
