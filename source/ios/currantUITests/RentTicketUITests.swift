//
//  RentTicketUITests.swift
//  currant
//
//  Created by Foster Yin on 10/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import XCTest

class RentTicketUITests: XCTestCase {
        
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
    
    func testCreateRentTicket() {
        // Use recording to get started writing UI tests.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
        
        let app = XCUIApplication()
        app.alerts["Alert Test"].collectionViews.buttons["OK"].tap()
        app.alerts["New Version Available"].collectionViews.buttons["Later"].tap()
        app.childrenMatchingType(.Other).element.childrenMatchingType(.Other).elementBoundByIndex(1).tap()
        app.tabBars.buttons["List Your Space"].tap()
        app.navigationBars["Draft"].buttons["Create"].tap()
        app.tables["List of rent type"].cells.staticTexts["整套出租"].tap()
        app.alerts["Allow “YoungFunding Property” to access your location while you use the app?"].collectionViews.buttons["Allow"].tap()
        app.maps.containingType(.Other, identifier:"Shenzhen Bao'an International Airport (SZX)").element.tap()
        app.tables.searchFields["Search"].tap()
        
        let emptyListTable = app.tables["Empty list"]
        emptyListTable.searchFields["Search"].typeText("Lon")
        emptyListTable.staticTexts["London"].tap()
        app.tables["Address"].textFields["Postcode"].typeText("E149aq")
        app.childrenMatchingType(.Window).elementBoundByIndex(1).buttons["Done"].tap()
        app.navigationBars["Address"].buttons["Continue"].tap()
        app.navigationBars["Information"].buttons["nav back"].tap()
        app.alerts["Are you sure you want to give up? Your property will be saved as draft"].collectionViews.buttons["Give Up"].tap()

    }
    
}
